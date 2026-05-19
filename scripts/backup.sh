#!/usr/bin/env bash
# Sauvegarde quotidienne de la base Postgres.
# À mettre en cron : `0 3 * * * /opt/pairs/scripts/backup.sh >> /var/log/pairs-backup.log 2>&1`

set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Charger les variables (sans les exporter dans l'env courant)
set -a
source .env.production
set +a

TS=$(date +%Y%m%d-%H%M%S)
FILE="$BACKUP_DIR/pairs-${TS}.sql.gz"

echo "▶ Dump Postgres → $FILE"
docker compose --env-file .env.production exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$FILE"

# Conserver les 14 derniers jours
echo "▶ Purge des sauvegardes > 14 jours"
find "$BACKUP_DIR" -name "pairs-*.sql.gz" -mtime +14 -delete

echo "✅ Backup OK : $FILE ($(du -h "$FILE" | cut -f1))"
