#!/usr/bin/env bash
set -euo pipefail

DUMP_FILE="$(mktemp /tmp/centro-studi-backup-XXXXXX.dump)"
RESTORE_SQL="$(mktemp /tmp/centro-studi-restore-XXXXXX.sql)"
LIST_FILE="$(mktemp /tmp/centro-studi-backup-list-XXXXXX.txt)"
trap 'rm -f "$DUMP_FILE" "$RESTORE_SQL" "$LIST_FILE"' EXIT

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

# Materialize the archive into SQL as a recovery-path integrity check. This does
# not mutate the running ephemeral database.
docker exec -i "$DB_CONTAINER" \
  pg_restore --no-owner --no-privileges \
  < "$DUMP_FILE" > "$RESTORE_SQL"

test -s "$RESTORE_SQL"
grep -q 'CREATE TABLE public.contents' "$RESTORE_SQL"
grep -q 'CREATE TABLE public.observatory_indicators' "$RESTORE_SQL"

echo "BACKUP_ARCHIVE_INTEGRITY = PASS"
