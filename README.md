# Pairs

Marque de compléments alimentaires premium pour les femmes, sur abonnement ou à l'unité, dosés au juste en fonction du cycle et des objectifs.

## Structure du repo

```
Pairs/
├─ web/                         # App Next.js (le site)
├─ docker-compose.yml           # Stack prod : app + Postgres + Caddy
├─ docker-compose.dev.yml       # Stack dev : juste Postgres en local
├─ Caddyfile                    # Reverse proxy HTTPS auto
├─ .env.production.example      # Variables d'env prod (à copier en .env.production)
├─ scripts/
│  ├─ init-server.sh            # Provisioning d'un VPS Ubuntu fresh
│  ├─ deploy.sh                 # Pull + build + restart
│  ├─ backup.sh                 # Dump Postgres quotidien (cron)
│  └─ restore.sh                # Restauration d'un dump
├─ DEPLOY.md                    # Guide complet de mise en ligne
└─ README.md                    # Ce fichier
```

## Démarrer en local (dev)

```bash
# 1. Postgres local dans Docker
docker compose -f docker-compose.dev.yml up -d

# 2. App Next.js
cd web
npm install
cp .env.example .env            # Prisma lit .env (pas .env.local)
npx prisma migrate dev          # crée la base + migration
npm run db:seed                 # 6 produits + avis
npm run dev                     # http://localhost:3000
```

Détails dans [`web/README.md`](./web/README.md).

## Mettre en ligne

Tout est expliqué pas à pas dans [`DEPLOY.md`](./DEPLOY.md) :

1. Acheter un nom de domaine (~7 € / an chez Cloudflare ou OVH)
2. Acheter un VPS Hetzner CX22 (~4,5 € / mois)
3. Pointer le DNS vers l'IP du VPS
4. `bash scripts/init-server.sh` sur le serveur (Docker + UFW + fail2ban + user non-root)
5. `git clone` + remplir `.env.production` + `./scripts/deploy.sh`
6. Site en ligne en HTTPS, derrière un mot de passe global tant que `SITE_LOCK=1`

## Mode DEV (site bloqué)

Le site est protégé par un mot de passe global via `SITE_LOCK=1` dans l'env. Toute personne qui arrive sur le site tombe sur une page "Site en construction" avec un formulaire mot de passe. Pas d'accès aux produits, panier, ou API tant qu'on n'a pas validé.

Pour ouvrir au public : `SITE_LOCK=0` et redéploiement. Le `robots.txt` passe de `Disallow: /` à `Allow: /` automatiquement.
