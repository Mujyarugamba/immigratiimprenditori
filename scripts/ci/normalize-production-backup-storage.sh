#!/usr/bin/env bash
set -euo pipefail

INPUT_DIR="${1:-restore-input}"
: "${BACKUP_ENCRYPTION_PASSPHRASE:?BACKUP_ENCRYPTION_PASSPHRASE is required}"

test -d "$INPUT_DIR" || { echo "Storage normalization input directory missing: $INPUT_DIR" >&2; exit 1; }

mapfile -t encrypted_files < <(find "$INPUT_DIR" -maxdepth 1 -type f -name '*.tar.gz.gpg' -print | sort)
mapfile -t checksum_files < <(find "$INPUT_DIR" -maxdepth 1 -type f -name '*.tar.gz.gpg.sha256' -print | sort)
[[ "${#encrypted_files[@]}" == "1" ]] || { echo "Expected exactly one encrypted backup" >&2; exit 1; }
[[ "${#checksum_files[@]}" == "1" ]] || { echo "Expected exactly one encrypted backup checksum" >&2; exit 1; }

encrypted="${encrypted_files[0]}"
checksum="${checksum_files[0]}"
[[ "$checksum" == "${encrypted}.sha256" ]] || { echo "Checksum filename mismatch" >&2; exit 1; }
(
  cd "$INPUT_DIR"
  sha256sum -c "$(basename "$checksum")"
)
echo "PRODUCTION_BACKUP_ORIGINAL_ARTIFACT_CHECKSUM = PASS"

work_dir="$(mktemp -d /tmp/centro-studi-storage-normalize-XXXXXX)"
cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

archive="$work_dir/backup.tar.gz"
printf '%s' "$BACKUP_ENCRYPTION_PASSPHRASE" \
  | gpg --batch --yes --pinentry-mode loopback --passphrase-fd 0 \
    --decrypt --output "$archive" "$encrypted"
test -s "$archive"

mkdir -p "$work_dir/extracted"
root_name="$(python3 - "$archive" "$work_dir/extracted" <<'PY'
from pathlib import Path, PurePosixPath
import sys
import tarfile

archive = Path(sys.argv[1])
out = Path(sys.argv[2])
with tarfile.open(archive, "r:gz") as tf:
    members = tf.getmembers()
    if not members:
        raise SystemExit("Storage normalization: decrypted archive is empty")
    roots = set()
    for member in members:
        path = PurePosixPath(member.name)
        if path.is_absolute() or ".." in path.parts:
            raise SystemExit(f"Storage normalization: unsafe archive member: {member.name}")
        if not (member.isdir() or member.isfile()):
            raise SystemExit(f"Storage normalization: unsupported archive member type: {member.name}")
        if path.parts:
            roots.add(path.parts[0])
    if len(roots) != 1:
        raise SystemExit(f"Storage normalization: expected one archive root, found {sorted(roots)}")
    root = next(iter(roots))
    if not root.startswith("centro-studi-"):
        raise SystemExit(f"Storage normalization: unexpected archive root: {root}")
    tf.extractall(out, filter="data")
    print(root)
PY
)"

data_file="$work_dir/extracted/$root_name/data.sql"
test -s "$data_file" || { echo "Storage normalization: data.sql missing or empty" >&2; exit 1; }

removed_blocks="$(python3 - "$data_file" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
copy_storage = re.compile(r'^\s*COPY\s+(?:"?storage"?\.)', re.IGNORECASE)
out = []
removed = 0
i = 0
while i < len(lines):
    if not copy_storage.match(lines[i]):
        out.append(lines[i])
        i += 1
        continue
    removed += 1
    i += 1
    while i < len(lines) and lines[i].strip() != r'\.':
        i += 1
    if i >= len(lines):
        raise SystemExit("Storage normalization: unterminated COPY storage block")
    i += 1

filtered = ''.join(out)
if re.search(r'^\s*COPY\s+(?:"?storage"?\.)', filtered, re.IGNORECASE | re.MULTILINE):
    raise SystemExit("Storage normalization: COPY storage block survived normalization")
path.write_text(filtered, encoding="utf-8")
print(removed)
PY
)"
[[ "$removed_blocks" =~ ^[0-9]+$ ]] || { echo "Storage normalization: invalid removed block count" >&2; exit 1; }

normalized_archive="$work_dir/normalized.tar.gz"
tar -czf "$normalized_archive" -C "$work_dir/extracted" "$root_name"
test -s "$normalized_archive"

normalized_encrypted="$work_dir/normalized.tar.gz.gpg"
printf '%s' "$BACKUP_ENCRYPTION_PASSPHRASE" \
  | gpg --batch --yes --pinentry-mode loopback --passphrase-fd 0 \
    --symmetric --cipher-algo AES256 --output "$normalized_encrypted" "$normalized_archive"
test -s "$normalized_encrypted"

rm -f "$encrypted" "$checksum"
cp "$normalized_encrypted" "$encrypted"
sha256sum "$encrypted" > "$checksum"

echo "PRODUCTION_BACKUP_MANAGED_STORAGE_COPY_BLOCKS_REMOVED = $removed_blocks"
echo "PRODUCTION_BACKUP_MANAGED_STORAGE_DATA_NORMALIZATION = PASS"
