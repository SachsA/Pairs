# Pairs

> **`README.md`** comprendre et installer · [`ROADMAP.md`](./ROADMAP.md) avancement · [`DEPLOY.md`](./DEPLOY.md) mise en ligne

Boutique en ligne de compléments alimentaires premium pour les femmes, à l'unité ou sur abonnement mensuel, avec des formules ajustées au cycle et aux objectifs.

| | |
|---|---|
| **Avancement** | Voir [`ROADMAP.md`](./ROADMAP.md) — 25 / 55 tâches |
| **Mise en ligne** | Voir [`DEPLOY.md`](./DEPLOY.md) |
| **État** | Fonctionne en local · jamais déployé · paiements jamais testés en réel |

---

## Ce que le site sait faire aujourd'hui

- **Catalogue** — 6 produits avec composition détaillée (ingrédient, dosage, bénéfice), posologie, avis clients, filtres par catégorie
- **Diagnostic** — questionnaire de 5 questions qui recommande 3 produits adaptés
- **Comptes clients** — inscription, connexion, historique de commandes, abonnements en cours
- **Panier et paiement** — achat unique ou abonnement mensuel, carte bancaire via Stripe, codes promo, livraison offerte dès 40 €
- **Abonnements** — prélèvement mensuel, portail client Stripe pour annuler ou changer de carte
- **Emails automatiques** — bienvenue newsletter avec code −10 %, bienvenue compte, confirmation de commande, résultats du diagnostic
- **Mode « site en construction »** — le site entier peut être verrouillé derrière un mot de passe unique, le temps de la mise au point

Ce qu'il **ne sait pas encore** faire (back-office, pages légales, mesure d'audience, stocks…) : voir [`ROADMAP.md`](./ROADMAP.md).

---

## Stack technique

| Domaine | Technologie |
|---|---|
| Langage | TypeScript |
| Framework | Next.js 14 (App Router, React 18, Server Components) |
| Styles | Tailwind CSS 3 |
| Base de données | PostgreSQL 16 |
| ORM | Prisma 5 |
| Authentification | NextAuth 4 (email + mot de passe, bcrypt, JWT) |
| Paiements | Stripe (Checkout, Subscriptions, Customer Portal, webhooks) |
| Emails | Resend + React Email |
| État côté client | Zustand (panier persistant) |
| Validation | Zod |
| Conteneurisation | Docker, Docker Compose |
| Reverse proxy | Caddy (HTTPS automatique via Let's Encrypt) |
| Hébergement visé | VPS Ubuntu (Hetzner ou OVH) |

---

## Structure du dépôt

```
Pairs/
├─ README.md                  ← vous êtes ici : comprendre et installer
├─ ROADMAP.md                 ← avancement, tâches faites et à faire
├─ DEPLOY.md                  ← mettre le site en ligne pas à pas
│
├─ docker-compose.yml         production : app + Postgres + Caddy
├─ docker-compose.dev.yml     développement : Postgres seul
├─ Caddyfile                  reverse proxy, HTTPS, en-têtes de sécurité
├─ .env.production.example    variables d'environnement de production
│
├─ scripts/
│  ├─ init-server.sh          prépare un VPS Ubuntu vierge
│  ├─ deploy.sh               met à jour et redémarre la production
│  ├─ backup.sh               sauvegarde Postgres (à mettre en cron)
│  └─ restore.sh              restaure une sauvegarde
│
└─ web/                       l'application Next.js
   ├─ prisma/
   │  ├─ schema.prisma        9 modèles de données
   │  └─ seed.ts              6 produits de démonstration + avis
   ├─ public/favicon.svg
   ├─ Dockerfile
   └─ src/
      ├─ middleware.ts        verrouillage du site en mode construction
      ├─ app/
      │  ├─ page.tsx                    accueil
      │  ├─ products/                   catalogue et fiches produits
      │  ├─ quiz/                       diagnostic personnalisé
      │  ├─ cart/                       panier
      │  ├─ checkout/success/           confirmation de commande
      │  ├─ about/                      qui sommes-nous
      │  ├─ login/ register/ account/   espace client
      │  ├─ dev-login/                  page « site en construction »
      │  └─ api/
      │     ├─ auth/[...nextauth]/      connexion
      │     ├─ register/                création de compte
      │     ├─ newsletter/              inscription + code promo
      │     ├─ quiz/                    enregistrement des réponses
      │     ├─ checkout/                création de la session Stripe
      │     ├─ stripe/webhook/          confirmation des paiements
      │     ├─ account/portal/          portail client Stripe
      │     ├─ dev-login/               vérification du mot de passe
      │     ├─ health/                  sonde pour Docker
      │     └─ robots.txt/              noindex en mode construction
      ├─ components/          Header, Footer, Logo, popup newsletter, carte produit…
      ├─ emails/              gabarits React Email (4 emails)
      └─ lib/                 prisma, auth, stripe, email, panier, tarifs, rate limiting
```

---

## Installation en local

**Prérequis** : Node.js 20 ou plus, Docker, et Git.

```bash
# 1. Base de données PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# 2. Application
cd web
npm install
cp .env.example .env          # Prisma lit .env, pas .env.local
npx prisma migrate dev        # crée les tables
npm run db:seed               # insère 6 produits + avis
npm run dev                   # http://localhost:3000
```

Le site tourne sans compte Stripe ni Resend : les paiements passent en mode démonstration et les emails s'affichent dans la console au lieu d'être envoyés.

> Si `npm install` échoue sur le téléchargement des moteurs Prisma (proxy ou environnement restreint), exporter `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`.

### Variables d'environnement

Tout est dans `web/.env.example`. Les essentielles :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | connexion PostgreSQL |
| `NEXTAUTH_SECRET` | secret de session — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL du site |
| `NEXT_PUBLIC_SITE_URL` | URL publique (redirections Stripe, liens emails) |
| `STRIPE_SECRET_KEY` | clé Stripe — mode démo si absente ou `placeholder` |
| `STRIPE_WEBHOOK_SECRET` | signature du webhook Stripe |
| `RESEND_API_KEY` | envoi d'emails — mode console si absente |
| `EMAIL_FROM` | expéditeur des emails |
| `SITE_LOCK` | `1` verrouille le site derrière un mot de passe, `0` l'ouvre |
| `SITE_LOCK_PASSWORD` | mot de passe d'accès en mode construction |

### Commandes utiles

```bash
npm run dev              # serveur de développement
npm run build            # build de production
npm run lint             # ESLint
npm run db:seed          # réinsère les produits de démonstration
npm run db:studio        # interface graphique de la base
npx prisma migrate dev   # nouvelle migration après modification du schéma
node scripts/preview-emails.mjs   # aperçu HTML des 4 emails
```

### Tester les paiements en local

```bash
# Terminal séparé, nécessite le Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Cartes de test : `4242 4242 4242 4242` (succès), `4000 0027 6000 3184` (3D Secure), `4000 0000 0000 9995` (refusée).

---

## Mode « site en construction »

Avec `SITE_LOCK=1`, tout visiteur tombe sur une page sobre avec un champ mot de passe. Aucun accès au catalogue, au panier ni aux API. Le `robots.txt` bascule automatiquement en `Disallow: /` pour éviter tout référencement prématuré.

Pour ouvrir au public : `SITE_LOCK=0` puis redéploiement.

---

## Documentation

- [`ROADMAP.md`](./ROADMAP.md) — ce qui est fait, ce qui reste, les limites connues
- [`DEPLOY.md`](./DEPLOY.md) — nom de domaine, VPS, DNS, pare-feu, HTTPS, Stripe, Resend, sauvegardes, dépannage
