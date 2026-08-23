#!/usr/bin/env bash
set -euo pipefail

DUMP_FILE="$(mktemp /tmp/centro-studi-backup-XXXXXX.dump)"
RESTORE_SQL="$(mktemp /tmp/centro-studi-restore-XXXXXX.sql)"
LIST_FILE="$(mktemp /tmp/centro-studi-backup-list-XXXXXX.txt)"
RESTORE_DB="centro_studi_restore_smoke"
DB_CONTAINER=""

cleanup() {
  if [[ -n "${DB_CONTAINER:-}" ]]; then
    docker exec "$DB_CONTAINER" dropdb -U postgres --if-exists --force "$RESTORE_DB" >/dev/null 2>&1 || true
  fi
  rm -f "$DUMP_FILE" "$RESTORE_SQL" "$LIST_FILE"
}
trap cleanup EXIT

DB_CONTAINER="$(
  docker ps --format '{{.Names}}' \
    | awk '/^supabase_db_/ { print; exit }'
)"

test -n "$DB_CONTAINER" || {
  echo "Local supabase_db_* container not running" >&2
  exit 1
}

# Run the PostgreSQL client tools from the same major-version image as the local
# database. This avoids runner pg_dump/server version mismatches.
docker exec "$DB_CONTAINER" \
  pg_dump -U postgres -d postgres \
    --format=custom \
    --no-owner \
    --no-privileges \
  > "$DUMP_FILE"

test -s "$DUMP_FILE"

docker exec -i "$DB_CONTAINER" pg_restore --list \
  < "$DUMP_FILE" > "$LIST_FILE"

# pg_restore --list lines use e.g. "TABLE public contents postgres" or
# "TABLE DATA public contents postgres". Keep this check exact enough to prove
# the expected objects are in the archive without depending on archive OIDs.
grep -Eq 'TABLE( DATA)? public contents ' "$LIST_FILE"
grep -Eq 'TABLE( DATA)? public observatory_indicators ' "$LIST_FILE"

# Materialize the archive into SQL as a recovery-path integrity check.
docker exec -i "$DB_CONTAINER" \
  pg_restore --no-owner --no-privileges --file=- \
  < "$DUMP_FILE" > "$RESTORE_SQL"

test -s "$RESTORE_SQL"
grep -q 'CREATE TABLE public.contents' "$RESTORE_SQL"
grep -q 'CREATE TABLE public.observatory_indicators' "$RESTORE_SQL"

# Exercise a real restore into a disposable database on the same PostgreSQL 17
# server. This validates object ordering, extensions, data and RLS rather than
# merely proving that pg_restore can print the archive.
docker exec "$DB_CONTAINER" dropdb -U postgres --if-exists --force "$RESTORE_DB" >/dev/null 2>&1 || true
docker exec "$DB_CONTAINER" createdb -U postgres -T template0 "$RESTORE_DB"
docker exec -i "$DB_CONTAINER" \
  pg_restore -U postgres -d "$RESTORE_DB" \
    --no-owner \
    --no-privileges \
  < "$DUMP_FILE"

languages_count="$(docker exec "$DB_CONTAINER" psql -U postgres -d "$RESTORE_DB" -Atqc \
  'select count(*) from public.languages;')"
contents_exists="$(docker exec "$DB_CONTAINER" psql -U postgres -d "$RESTORE_DB" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='contents' and c.relkind='r';")"
indicators_exists="$(docker exec "$DB_CONTAINER" psql -U postgres -d "$RESTORE_DB" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='observatory_indicators' and c.relkind='r';")"
private_rls="$(docker exec "$DB_CONTAINER" psql -U postgres -d "$RESTORE_DB" -Atqc \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('accounts','account_role_assignments','editorial_inbox_items','editorial_submissions') and c.relrowsecurity;")"

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

echo "BACKUP_ARCHIVE_INTEGRITY = PASS"
echo "BACKUP_EPHEMERAL_RESTORE = PASS"
