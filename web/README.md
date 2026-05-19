# Pairs — Site e-commerce premium

Compléments alimentaires pour femmes, sur abonnement ou à l'unité, dosés au juste pour chaque phase du cycle.

Stack : **Next.js 14 (App Router) · TypeScript · Tailwind · Prisma + Postgres · NextAuth · Stripe · Zustand**.

Pour la mise en ligne (Docker, VPS, HTTPS, DEV gate), voir [`../DEPLOY.md`](../DEPLOY.md).

## Démarrage rapide (dev local)

```bash
# Depuis la racine du repo :
docker compose -f docker-compose.dev.yml up -d   # Postgres local

# Puis dans ce dossier :
cd web
npm install
cp .env.example .env              # Prisma lit .env (pas .env.local)
npx prisma migrate dev            # applique le schéma à Postgres
npm run db:seed                   # 6 produits + avis
npm run dev                       # http://localhost:3000
```

> Si `npm install` échoue sur le téléchargement des engines Prisma (sandbox/proxy), exporter `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`.

## Variables d'environnement

Voir `.env.example`. Variables clés :

| Var | Rôle |
| --- | --- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?schema=public` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL publique du site |
| `STRIPE_SECRET_KEY` | clé secrète Stripe (`sk_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | clé publique Stripe (`pk_…`) |
| `NEXT_PUBLIC_SITE_URL` | URL pour les redirections post-paiement |
| `SITE_LOCK` | `1` = site bloqué par mot de passe (mode DEV), `0` = public |
| `SITE_LOCK_PASSWORD` | mot de passe du DEV gate |

**Mode dev sans Stripe** : si `STRIPE_SECRET_KEY` contient `placeholder`, le checkout simule un paiement réussi (utile pour tester sans compte Stripe).

## Structure

```
web/
├─ prisma/
│  ├─ schema.prisma         # modèles (User, Product, Review, Order, etc.)
│  └─ seed.ts               # 6 produits + avis
├─ src/
│  ├─ app/                  # routing App Router
│  │  ├─ page.tsx           # home
│  │  ├─ products/          # liste + détail produit
│  │  ├─ cart/              # panier
│  │  ├─ checkout/success/  # confirmation
│  │  ├─ quiz/              # diagnostic 5 questions
│  │  ├─ about/             # qui sommes-nous
│  │  ├─ login/ register/ account/
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/  # NextAuth credentials
│  │     ├─ register/             # création compte (bcrypt)
│  │     ├─ newsletter/           # popup -10%, génère un code
│  │     ├─ checkout/             # Stripe Checkout
│  │     └─ quiz/                 # sauvegarde réponses
│  ├─ components/
│  │  ├─ Header.tsx Footer.tsx Logo.tsx
│  │  ├─ NewsletterPopup.tsx      # popup auto après 4s
│  │  ├─ AuthProvider.tsx
│  │  ├─ ProductCard.tsx AddToCart.tsx Stars.tsx
│  └─ lib/
│     ├─ prisma.ts auth.ts stripe.ts cart.ts format.ts
└─ public/favicon.svg
```

## Fonctionnalités livrées

- Popup newsletter (auto après 4s, dismiss persistant via `localStorage`) qui retourne un code promo `BIENVENUE10-XXXXXX`.
- Création de compte / connexion par email + mot de passe (bcrypt + JWT).
- Panier persistant (`zustand` + `persist`), mode achat unique ou abonnement.
- Checkout via Stripe Checkout (avec fallback démo en l'absence de clé valide).
- 6 produits seedés avec composition détaillée (ingrédient, dosage, bénéfice) + avis clients.
- Filtres par catégorie sur `/products`.
- Page « Qui sommes-nous » avec storytelling, valeurs, équipe.
- Quiz 5 questions (cycle, objectif, stress, immunité, format) → recommandations produits + sauvegarde en BDD.
- Logo + favicon SVG visible dans l'onglet.
- Palette premium beige/crème + sage (vert sauge) inspirée Firn × Aime.

## Avant la prod

1. ~~Migrer SQLite → Postgres~~ → fait. Postgres est dans `docker-compose.yml`.
2. Ajouter le webhook Stripe `/api/webhook` pour confirmer les paiements de manière fiable.
3. Configurer un vrai service d'envoi d'emails (Resend, Postmark) pour la confirmation de commande et les codes promo newsletter.
4. Politique de confidentialité, CGV, mentions légales.
5. Tracking Plausible / GA, optimisation SEO.

## Commandes utiles

```bash
npm run dev          # serveur de dev
npm run build        # build prod
npm run start        # serveur prod
npm run db:push      # applique le schéma à la BDD
npm run db:seed      # remplit avec produits + avis
npm run db:studio    # Prisma Studio (UI BDD)
```
