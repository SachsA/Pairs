#!/usr/bin/env bash
# Restauration d'une sauvegarde Postgres.
# Utilisation : ./scripts/restore.sh backups/pairs-20260512-030000.sql.gz

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage : $0 <fichier.sql.gz>"
  exit 1
fi

FILE="$1"
if [ ! -f "$FILE" ]; then
  echo "❌ Fichier introuvable : $FILE"
  exit 1
fi

cd "$(dirname "$0")/.."

set -a
source .env.production
set +a

read -p "⚠ Cette opération va ÉCRASER la base $POSTGRES_DB. Confirmer ? (yes/no) " confirm
if [ "$confirm" != "yes" ]; then
  echo "Annulé."
  exit 0
fi

echo "▶ Arrêt de l'app pour éviter les écritures concurrentes…"
docker compose --env-file .env.production stop app

echo "▶ Restauration depuis $FILE…"
gunzip -c "$FILE" | docker compose --env-file .env.production exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "▶ Redémarrage de l'app…"
docker compose --env-file .env.production start app

echo "✅ Restauration terminée."
