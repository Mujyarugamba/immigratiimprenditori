#!/usr/bin/env bash
set -euo pipefail

export PGPASSWORD="${PGPASSWORD:-postgres}"
DB_URL="${SUPABASE_LOCAL_DB_URL:-postgresql://postgres@127.0.0.1:54322/postgres}"
DUMP_FILE="$(mktemp /tmp/centro-studi-backup-XXXXXX.dump)"
RESTORE_SQL="$(mktemp /tmp/centro-studi-restore-XXXXXX.sql)"
trap 'rm -f "$DUMP_FILE" "$RESTORE_SQL"' EXIT

pg_dump "$DB_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="$DUMP_FILE"

test -s "$DUMP_FILE"
pg_restore --list "$DUMP_FILE" > /tmp/centro-studi-backup-list.txt

grep -Eq 'TABLE .* public .*contents|TABLE DATA .* public .*contents' /tmp/centro-studi-backup-list.txt
grep -Eq 'TABLE .* public .*observatory_indicators|TABLE DATA .* public .*observatory_indicators' /tmp/centro-studi-backup-list.txt

# Materialize the archive into SQL as a recovery-path integrity check. This does
# not mutate the running ephemeral database.
pg_restore \
  --no-owner \
  --no-privileges \
  --file="$RESTORE_SQL" \
  "$DUMP_FILE"

test -s "$RESTORE_SQL"
grep -q 'CREATE TABLE public.contents' "$RESTORE_SQL"

echo "BACKUP_ARCHIVE_INTEGRITY = PASS"
