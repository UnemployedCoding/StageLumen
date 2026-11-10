#!/usr/bin/env bash
set -euo pipefail
umask 077

# Set SUPABASE_DB_URL to a direct or session-pooler connection string.
# Set BACKUP_AGE_RECIPIENT to your age public encryption recipient.
# Keep the matching private identity in your password manager, off the laptop.
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL privately; do not paste it into chat}"
: "${BACKUP_AGE_RECIPIENT:?Set BACKUP_AGE_RECIPIENT to your age public recipient}"
command -v docker >/dev/null || { echo 'Docker is required by Supabase db dump.' >&2; exit 1; }
command -v age >/dev/null || { echo 'Install age before creating a confidential backup.' >&2; exit 1; }
command -v npx >/dev/null
docker info >/dev/null

backup_root="$(git rev-parse --show-toplevel)/backups"
mkdir -p "$backup_root"
backup_dir="$(mktemp -d "$backup_root/database-XXXXXXXX")"
echo "Creating database backup in $backup_dir"

# No live database changes are made. pipefail prevents failed dumps being marked complete.
npx --yes supabase@2.122.1 db dump --db-url "$SUPABASE_DB_URL" --role-only \
  | age -r "$BACKUP_AGE_RECIPIENT" -o "$backup_dir/roles.sql.age"
npx --yes supabase@2.122.1 db dump --db-url "$SUPABASE_DB_URL" \
  | age -r "$BACKUP_AGE_RECIPIENT" -o "$backup_dir/schema.sql.age"
npx --yes supabase@2.122.1 db dump --db-url "$SUPABASE_DB_URL" --data-only --use-copy \
  | age -r "$BACKUP_AGE_RECIPIENT" -o "$backup_dir/data.sql.age"
touch "$backup_dir/COMPLETE"
echo "Encrypted SQL backup complete. Copy $backup_dir to private off-device storage."
echo 'Storage objects, provider settings, and API secrets require separate backups; see RECOVERY.md.'
