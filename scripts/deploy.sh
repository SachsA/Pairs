#!/usr/bin/env bash
# Déploiement zero-downtime sur le serveur.
# Utilisation : ./scripts/deploy.sh
# Prérequis : Docker + Docker Compose installés, .env.production présent, git clone fait.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "▶ Pull du code…"
git pull --ff-only

echo "▶ Vérification de .env.production…"
if [ ! -f .env.production ]; then
  echo "❌ .env.production introuvable. Copie .env.production.example et remplis-le."
  exit 1
fi

echo "▶ Build de l'image app…"
docker compose --env-file .env.production build app

echo "▶ Migrations + démarrage…"
docker compose --env-file .env.production up -d

echo "▶ Nettoyage des anciennes images…"
docker image prune -f

echo "▶ État des services :"
docker compose --env-file .env.production ps

echo "✅ Déploiement terminé."
