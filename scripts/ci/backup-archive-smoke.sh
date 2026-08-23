#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="$(mktemp -d /tmp/centro-studi-backup-XXXXXX)"
MIGRATIONS_STASH=""

cleanup() {
  if [[ -n "${MIGRATIONS_STASH:-}" && -d "$MIGRATIONS_STASH" ]]; then
    rm -rf supabase/migrations
    mv "$MIGRATIONS_STASH" supabase/migrations
  fi
  rm -rf "$BACKUP_DIR"
}
trap cleanup EXIT

ROLES_FILE="$BACKUP_DIR/roles.sql"
SCHEMA_FILE="$BACKUP_DIR/schema.sql"
DATA_FILE="$BACKUP_DIR/data.sql"

# Supabase's CLI wraps pg_dump with the platform-specific filters required for
# portable logical backups. Raw pg_dump includes managed realtime/vault objects
# that cannot be restored with normal project privileges.
supabase db dump --local -f "$ROLES_FILE" --role-only
supabase db dump --local -f "$SCHEMA_FILE"
supabase db dump --local -f "$DATA_FILE" --use-copy --data-only \
  -x "storage.buckets_vectors" \
  -x "storage.vector_indexes"

for file in "$ROLES_FILE" "$SCHEMA_FILE" "$DATA_FILE"; do
  test -s "$file" || {
    echo "Logical backup component is empty: $file" >&2
    exit 1
  }
done

# pg_dump may quote schema and relation identifiers (for example
# "public"."contents"). Match the structural statement rather than one exact
# rendering so this preflight does not reject a valid Supabase logical dump.
grep -Eq 'CREATE TABLE .*contents' "$SCHEMA_FILE" || {
  echo "Logical backup preflight: public.contents DDL missing" >&2
  exit 1
}
grep -Eq 'CREATE TABLE .*observatory_indicators' "$SCHEMA_FILE" || {
  echo "Logical backup preflight: public.observatory_indicators DDL missing" >&2
  exit 1
}
grep -Eq 'COPY .*languages' "$DATA_FILE" || {
  echo "Logical backup preflight: public.languages data missing" >&2
  exit 1
}

# Temporary, safe diagnostic for the managed role-setting restore blocker.
# Print only the SQL statement(s) containing log_min_messages and redact the
# role identifier. No schema/data dump, password, token or connection secret is
# emitted. Keep this until the exact Supabase CLI rendering is captured once.
python3 - "$ROLES_FILE" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
needle = re.compile(r"log_min_messages", re.IGNORECASE)
seen = set()

for match in needle.finditer(text):
    start = text.rfind(";", 0, match.start()) + 1
    end = text.find(";", match.end())
    if end == -1:
        end = len(text)
    else:
        end += 1
    statement = text[start:end].strip()
    if not statement or statement in seen:
        continue
    seen.add(statement)
    statement = re.sub(
        r'(?is)(\bALTER\s+ROLE\s+)(?:"(?:[^"]|"")*"|\S+)',
        r'\1<ROLE>',
        statement,
        count=1,
    )
    first_line = text.count("\n", 0, start) + 1
    last_line = first_line + statement.count("\n")
    print(f"RESTORE_ROLE_DIAGNOSTIC lines={first_line}-{last_line}", file=sys.stderr)
    for line in statement.splitlines():
        print(f"RESTORE_ROLE_DIAGNOSTIC_SQL {line}", file=sys.stderr)

if not seen:
    print("RESTORE_ROLE_DIAGNOSTIC no log_min_messages occurrence found", file=sys.stderr)
PY

# A fresh Supabase-managed target already owns platform logging configuration.
# The role-only dump can contain ALTER ROLE ... SET log_min_messages copied from
# the source. Supautils correctly prevents a normal project connection from
# overwriting that platform-managed GUC. Supabase/pg_dump output may quote the
# parameter name or vary SET syntax, so match the statement semantically rather
# than relying on one exact rendering. Remove only ALTER ROLE statements that
# mention log_min_messages; keep every other role setting/membership/grant.
ROLES_FILTERED="$BACKUP_DIR/roles.filtered.sql"
awk '
  BEGIN { IGNORECASE = 1 }
  /^[[:space:]]*ALTER[[:space:]]+ROLE[[:space:]]+/ && /log_min_messages/ {
    filtered = 1
    next
  }
  { print }
  END {
    if (filtered) {
      print "Restore drill: ignored platform-managed role log_min_messages setting" > "/dev/stderr"
    }
  }
' "$ROLES_FILE" > "$ROLES_FILTERED"
mv "$ROLES_FILTERED" "$ROLES_FILE"

# Defensive check: never continue if an ALTER ROLE log_min_messages statement
# survived the normalization above.
if awk '
  BEGIN { IGNORECASE = 1; found = 0 }
  /^[[:space:]]*ALTER[[:space:]]+ROLE[[:space:]]+/ && /log_min_messages/ { found = 1 }
  END { exit found ? 0 : 1 }
' "$ROLES_FILE"; then
  echo "Restore drill: platform-managed log_min_messages ALTER ROLE survived filtering" >&2
  exit 1
fi

# Prove actual recoverability against a clean Supabase-managed database, not a
# bare PostgreSQL database. Stop the source stack, start a fresh managed stack
# with no application migrations, restore the three official logical components,
# then leave the restored stack running for the remaining Auth/HTTP/E2E gates.
MIGRATIONS_STASH="$(mktemp -d /tmp/centro-studi-migrations-XXXXXX)"
rmdir "$MIGRATIONS_STASH"
mv supabase/migrations "$MIGRATIONS_STASH"
mkdir -p supabase/migrations

supabase stop --no-backup
supabase start

PGPASSWORD=postgres psql "postgresql://postgres@127.0.0.1:54322/postgres" \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file "$ROLES_FILE" \
  --file "$SCHEMA_FILE" \
  --command 'SET session_replication_role = replica' \
  --file "$DATA_FILE"

rm -rf supabase/migrations
mv "$MIGRATIONS_STASH" supabase/migrations
MIGRATIONS_STASH=""

languages_count="$(PGPASSWORD=postgres psql "postgresql://postgres@127.0.0.1:54322/postgres" -Atqc \
  'select count(*) from public.languages;')"
contents_exists="$(PGPASSWORD=postgres psql "postgresql://postgres@127.0.0.1:54322/postgres" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='contents' and c.relkind='r';")"
indicators_exists="$(PGPASSWORD=postgres psql "postgresql://postgres@127.0.0.1:54322/postgres" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='observatory_indicators' and c.relkind='r';")"
private_rls="$(PGPASSWORD=postgres psql "postgresql://postgres@127.0.0.1:54322/postgres" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('accounts','account_role_assignments','editorial_inbox_items','editorial_submissions') and c.relrowsecurity;")"
auth_users_exists="$(PGPASSWORD=postgres psql "postgresql://postgres@127.0.0.1:54322/postgres" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='auth' and c.relname='users' and c.relkind='r';")"

[[ "$languages_count" =~ ^[0-9]+$ ]] && (( languages_count > 0 )) || {
  echo "Restore drill: public.languages is empty or unavailable" >&2
  exit 1
}
[[ "$contents_exists" == "1" ]] || {
  echo "Restore drill: public.contents missing" >&2
  exit 1
}
[[ "$indicators_exists" == "1" ]] || {
  echo "Restore drill: public.observatory_indicators missing" >&2
  exit 1
}
[[ "$private_rls" == "4" ]] || {
  echo "Restore drill: expected RLS on four critical private tables, found $private_rls" >&2
  exit 1
}
[[ "$auth_users_exists" == "1" ]] || {
  echo "Restore drill: managed auth.users table missing from fresh Supabase target" >&2
  exit 1
}

echo "BACKUP_SUPABASE_FILTERED_DUMP = PASS"
echo "BACKUP_EPHEMERAL_RESTORE = PASS"
