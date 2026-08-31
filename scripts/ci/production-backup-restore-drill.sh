#!/usr/bin/env bash
set -euo pipefail

INPUT_DIR="${1:-restore-input}"
: "${BACKUP_ENCRYPTION_PASSPHRASE:?BACKUP_ENCRYPTION_PASSPHRASE is required}"

test -d "$INPUT_DIR" || {
  echo "Restore drill input directory missing: $INPUT_DIR" >&2
  exit 1
}

mapfile -t encrypted_files < <(find "$INPUT_DIR" -maxdepth 1 -type f -name '*.tar.gz.gpg' -print | sort)
mapfile -t checksum_files < <(find "$INPUT_DIR" -maxdepth 1 -type f -name '*.tar.gz.gpg.sha256' -print | sort)

[[ "${#encrypted_files[@]}" == "1" ]] || {
  echo "Restore drill requires exactly one encrypted backup, found ${#encrypted_files[@]}" >&2
  exit 1
}
[[ "${#checksum_files[@]}" == "1" ]] || {
  echo "Restore drill requires exactly one checksum, found ${#checksum_files[@]}" >&2
  exit 1
}

encrypted="${encrypted_files[0]}"
checksum="${checksum_files[0]}"
expected_checksum="${encrypted}.sha256"
[[ "$checksum" == "$expected_checksum" ]] || {
  echo "Restore drill checksum filename does not match encrypted backup" >&2
  exit 1
}

if find "$INPUT_DIR" -maxdepth 1 -type f \( -name '*.sql' -o -name '*.tar.gz' \) -print -quit | grep -q .; then
  echo "Restore drill artifact unexpectedly contains plaintext backup material" >&2
  exit 1
fi

checksum_target="$(awk 'NF >= 2 {print $2; exit}' "$checksum")"
checksum_target="${checksum_target#\*}"
[[ "$checksum_target" == "$(basename "$encrypted")" ]] || {
  echo "Restore drill checksum references an unexpected filename" >&2
  exit 1
}
(
  cd "$INPUT_DIR"
  sha256sum -c "$(basename "$checksum")"
)
echo "PRODUCTION_BACKUP_ARTIFACT_CHECKSUM = PASS"

WORK_DIR="$(mktemp -d /tmp/centro-studi-production-restore-XXXXXX)"
MIGRATIONS_STASH=""
cleanup() {
  if [[ -n "${MIGRATIONS_STASH:-}" && -d "$MIGRATIONS_STASH" ]]; then
    rm -rf supabase/migrations
    mv "$MIGRATIONS_STASH" supabase/migrations
  fi
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

archive="$WORK_DIR/backup.tar.gz"
printf '%s' "$BACKUP_ENCRYPTION_PASSPHRASE" \
  | gpg --batch --yes --pinentry-mode loopback --passphrase-fd 0 \
    --decrypt --output "$archive" "$encrypted"
test -s "$archive"
echo "PRODUCTION_BACKUP_DECRYPTION = PASS"

mkdir -p "$WORK_DIR/extracted"
backup_root_name="$(python3 - "$archive" "$WORK_DIR/extracted" <<'PY'
from pathlib import Path, PurePosixPath
import sys
import tarfile

archive = Path(sys.argv[1])
out = Path(sys.argv[2])

with tarfile.open(archive, "r:gz") as tf:
    members = tf.getmembers()
    if not members:
        raise SystemExit("Restore drill: decrypted archive is empty")

    roots = set()
    names = set()
    for member in members:
        name = member.name
        path = PurePosixPath(name)
        if path.is_absolute() or ".." in path.parts:
            raise SystemExit(f"Restore drill: unsafe archive member: {name}")
        if not (member.isdir() or member.isfile()):
            raise SystemExit(f"Restore drill: unsupported archive member type: {name}")
        if not path.parts:
            raise SystemExit("Restore drill: invalid empty archive member")
        roots.add(path.parts[0])
        names.add(name.rstrip("/"))

    if len(roots) != 1:
        raise SystemExit(f"Restore drill: expected one archive root, found {sorted(roots)}")
    root = next(iter(roots))
    if not root.startswith("centro-studi-"):
        raise SystemExit(f"Restore drill: unexpected archive root: {root}")

    required = {
        f"{root}/roles.sql",
        f"{root}/schema.sql",
        f"{root}/data.sql",
    }
    missing = required - names
    if missing:
        raise SystemExit(f"Restore drill: missing logical backup components: {sorted(missing)}")

    tf.extractall(out, filter="data")
    print(root)
PY
)"

backup_root="$WORK_DIR/extracted/$backup_root_name"
ROLES_FILE="$backup_root/roles.sql"
SCHEMA_FILE="$backup_root/schema.sql"
DATA_FILE="$backup_root/data.sql"
for file in "$ROLES_FILE" "$SCHEMA_FILE" "$DATA_FILE"; do
  test -s "$file" || {
    echo "Restore drill logical component is empty: $file" >&2
    exit 1
  }
done

grep -Eq 'CREATE TABLE .*contents' "$SCHEMA_FILE" || {
  echo "Restore drill: public.contents DDL missing" >&2
  exit 1
}
grep -Eq 'CREATE TABLE .*observatory_indicators' "$SCHEMA_FILE" || {
  echo "Restore drill: public.observatory_indicators DDL missing" >&2
  exit 1
}
grep -Eq 'COPY .*languages' "$DATA_FILE" || {
  echo "Restore drill: public.languages data missing" >&2
  exit 1
}
echo "PRODUCTION_BACKUP_LOGICAL_PREFLIGHT = PASS"

# A fresh Supabase-managed target owns platform logging configuration. Remove
# only the known log_min_messages forms that normal project privileges cannot
# replay. Fail closed if any other log_min_messages statement survives.
python3 - "$ROLES_FILE" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
parts = re.split(r"(?<=;)", text)
kept = []

alter_role = re.compile(r"(?is)^\s*ALTER\s+ROLE\b.*\blog_min_messages\b")
grant_parameter = re.compile(
    r'(?is)^\s*GRANT\s+SET\s+ON\s+PARAMETER\s+"?log_min_messages"?\s+TO\b'
)

for part in parts:
    statement = part.strip()
    if statement and (alter_role.match(statement) or grant_parameter.match(statement)):
        continue
    kept.append(part)

filtered = "".join(kept)
if re.search(r"(?i)\blog_min_messages\b", filtered):
    raise SystemExit(
        "Restore drill: unrecognized log_min_messages statement survived normalization"
    )
path.write_text(filtered, encoding="utf-8")
PY

if [[ -d supabase/migrations ]]; then
  MIGRATIONS_STASH="$(mktemp -d /tmp/centro-studi-production-migrations-XXXXXX)"
  rmdir "$MIGRATIONS_STASH"
  mv supabase/migrations "$MIGRATIONS_STASH"
fi
mkdir -p supabase/migrations

if [[ ! -f supabase/config.toml ]]; then
  supabase init
fi
supabase stop --no-backup >/dev/null 2>&1 || true
supabase start

LOCAL_DB_URL="postgresql://postgres@127.0.0.1:54322/postgres"
PGPASSWORD=postgres psql "$LOCAL_DB_URL" \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file "$ROLES_FILE" \
  --file "$SCHEMA_FILE" \
  --command 'SET session_replication_role = replica' \
  --file "$DATA_FILE"

PGPASSWORD=postgres psql "$LOCAL_DB_URL" \
  --variable ON_ERROR_STOP=1 \
  --file scripts/ci/post-restore-auth-hooks.sql

languages_count="$(PGPASSWORD=postgres psql "$LOCAL_DB_URL" -Atqc \
  'select count(*) from public.languages;')"
contents_exists="$(PGPASSWORD=postgres psql "$LOCAL_DB_URL" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='contents' and c.relkind='r';")"
indicators_exists="$(PGPASSWORD=postgres psql "$LOCAL_DB_URL" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='observatory_indicators' and c.relkind='r';")"
private_rls="$(PGPASSWORD=postgres psql "$LOCAL_DB_URL" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('accounts','account_role_assignments','editorial_inbox_items','editorial_submissions') and c.relrowsecurity;")"
auth_users_exists="$(PGPASSWORD=postgres psql "$LOCAL_DB_URL" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='auth' and c.relname='users' and c.relkind='r';")"
auth_hook_exists="$(PGPASSWORD=postgres psql "$LOCAL_DB_URL" -Atqc \
  "select count(*) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid join pg_namespace pn on pn.oid=p.pronamespace where not t.tgisinternal and n.nspname='auth' and c.relname='users' and t.tgname='on_auth_user_created' and pn.nspname='public' and p.proname='handle_new_user';")"

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
  echo "Restore drill: managed auth.users table missing from isolated target" >&2
  exit 1
}
[[ "$auth_hook_exists" == "1" ]] || {
  echo "Restore drill: application Auth provisioning hook missing after restore" >&2
  exit 1
}

echo "PRODUCTION_BACKUP_POST_RESTORE_AUTH_HOOK = PASS"
echo "PRODUCTION_BACKUP_ISOLATED_RESTORE = PASS"
