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

# A fresh Supabase-managed target already owns platform logging configuration.
# Depending on the Supabase/PostgreSQL version, the role-only dump can encode
# that managed privilege either as ALTER ROLE ... log_min_messages or as
# GRANT SET ON PARAMETER "log_min_messages" TO .... Supautils correctly blocks
# replaying either form through normal project privileges. Remove only those
# exact log_min_messages statements and preserve every other role setting,
# membership and parameter grant.
python3 - "$ROLES_FILE" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
parts = re.split(r"(?<=;)", text)
kept = []
removed = []

alter_role = re.compile(
    r"(?is)^\s*ALTER\s+ROLE\b.*\blog_min_messages\b"
)
grant_parameter = re.compile(
    r'(?is)^\s*GRANT\s+SET\s+ON\s+PARAMETER\s+"?log_min_messages"?\s+TO\b'
)

for part in parts:
    statement = part.strip()
    if statement and alter_role.match(statement):
        removed.append("ALTER ROLE log_min_messages")
        continue
    if statement and grant_parameter.match(statement):
        removed.append("GRANT SET ON PARAMETER log_min_messages")
        continue
    kept.append(part)

filtered = "".join(kept)
if re.search(r"(?i)\blog_min_messages\b", filtered):
    raise SystemExit(
        "Restore drill: unrecognized log_min_messages statement survived normalization"
    )

path.write_text(filtered, encoding="utf-8")
if removed:
    print(
        "Restore drill: ignored platform-managed log_min_messages statement(s): "
        + ", ".join(sorted(set(removed))),
        file=sys.stderr,
    )
PY

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
