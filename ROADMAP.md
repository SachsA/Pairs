# Roadmap Pairs

> [`README.md`](./README.md) comprendre et installer · **`ROADMAP.md`** avancement · [`DEPLOY.md`](./DEPLOY.md) mise en ligne

Source unique de vérité sur l'avancement du projet. Toute tâche terminée est cochée ici, avec les fichiers qui l'implémentent.

- **Dernière mise à jour** : 16 juin 2026
- **Avancement** : 26 / 55 tâches — fondations, infra, emails, paiements et intégration continue terminés
- **État du site** : fonctionnel en local, jamais déployé, jamais testé avec de vrais paiements

> Comment lire : `[x]` = fait et présent dans le code · `[ ]` = à faire
> Pour lancer une tâche, référence son numéro (ex. « fais la tâche 26 »).

---

## Où on en est

| Phase | Sujet | État |
|---|---|---|
| 0 | Fondations du site | ✅ 11/11 |
| 1 | Infra, Docker, déploiement, sécurité | ✅ 8/8 |
| 2 | Emails transactionnels & paiements Stripe | ✅ 6/6 |
| 3 | Back-office & conformité légale | ⬜ 0/4 — **prochaine étape** |
| 4 | Bloquants avant ouverture publique | ⬜ 0/5 |
| 5 | Données réelles & démarches | ⬜ 0/3 |
| 6 | Qualité produit | ⬜ 0/5 |
| 7 | Leviers de croissance | ⬜ 0/6 |
| 8 | Robustesse & opérations | 🟨 1/4 |
| 9 | International | ⬜ 0/3 |

---

## Phase 0 — Fondations du site ✅

- [x] **1. Initialiser le projet Next.js 14** — App Router, TypeScript, ESLint
  `web/package.json`, `web/tsconfig.json`, `web/next.config.mjs`, `web/.eslintrc.json`
- [x] **2. Palette et design system premium** — beige/crème + vert sauge, Cormorant Garamond + Inter
  `web/tailwind.config.ts`, `web/src/app/globals.css`
- [x] **3. Schéma de base de données** — 9 modèles : User, Product, Ingredient, Review, Order, OrderItem, Subscription, NewsletterSubscriber, QuizResponse
  `web/prisma/schema.prisma`
- [x] **4. Jeu de données de démo** — 6 produits fictifs avec composition détaillée + 7 avis
  `web/prisma/seed.ts`
- [x] **5. Authentification** — NextAuth credentials, bcrypt, session JWT
  `web/src/lib/auth.ts`, `web/src/app/api/auth/[...nextauth]/`, `web/src/app/login/`, `web/src/app/register/`
- [x] **6. Layout, header, footer, logo, favicon** — logo SVG visible dans l'onglet
  `web/src/app/layout.tsx`, `web/src/components/Header.tsx`, `Footer.tsx`, `Logo.tsx`, `web/public/favicon.svg`
- [x] **7. Page d'accueil** — hero, best-sellers, valeurs, CTA diagnostic
  `web/src/app/page.tsx`
- [x] **8. Popup newsletter −10 %** — apparition après 4 s, code promo généré, refus mémorisé
  `web/src/components/NewsletterPopup.tsx`, `web/src/app/api/newsletter/route.ts`
- [x] **9. Pages produits** — liste avec filtres par catégorie, fiche détail avec composition (ingrédient / dosage / bénéfice) et avis clients
  `web/src/app/products/page.tsx`, `web/src/app/products/[slug]/page.tsx`
- [x] **10. Page « Qui sommes-nous »** — storytelling, convictions, équipe
  `web/src/app/about/page.tsx`
- [x] **11. Questionnaire de diagnostic** — 5 questions, recommandation de 3 produits, réponses enregistrées
  `web/src/app/quiz/page.tsx`, `web/src/app/api/quiz/route.ts`

## Phase 1 — Infra, Docker, déploiement, sécurité ✅

- [x] **12. Migration SQLite → PostgreSQL**
  `web/prisma/schema.prisma`, `docker-compose.dev.yml`
- [x] **13. Mode DEV en ligne (mot de passe global)** — page « Site en construction », cookie HMAC signé 30 j, `SITE_LOCK=1`
  `web/src/middleware.ts`, `web/src/app/dev-login/`, `web/src/app/api/dev-login/route.ts`
- [x] **14. Dockerfile de production** — multi-stage, sortie standalone, utilisateur non-root, healthcheck
  `web/Dockerfile`, `web/.dockerignore`, `web/src/app/api/health/route.ts`
- [x] **15. Stack docker-compose** — app + Postgres (volume persistant) + Caddy, réseaux séparés, Postgres non exposé
  `docker-compose.yml`, `docker-compose.dev.yml`
- [x] **16. Reverse proxy HTTPS automatique** — Caddy + Let's Encrypt, gzip, cache assets
  `Caddyfile`
- [x] **17. Durcissement sécurité** — CSP, HSTS, X-Frame-Options, rate limiting, robots.txt noindex en mode DEV
  `Caddyfile`, `web/next.config.mjs`, `web/src/lib/rate-limit.ts`, `web/src/app/robots.txt/route.ts`
- [x] **18. Scripts d'exploitation** — provisioning VPS (Docker + UFW + fail2ban + SSH durci), déploiement, sauvegarde et restauration Postgres
  `scripts/init-server.sh`, `deploy.sh`, `backup.sh`, `restore.sh`
- [x] **19. Guide de mise en ligne** — VPS, nom de domaine, DNS, pare-feu, déploiement, sauvegardes, dépannage
  `DEPLOY.md`

## Phase 2 — Emails transactionnels & paiements ✅

- [x] **20. Socle d'envoi d'emails** — Resend, mode mock si pas de clé API, envoi non bloquant
  `web/src/lib/email.ts`
- [x] **21. Quatre emails transactionnels** — bienvenue newsletter (code promo), bienvenue compte, confirmation de commande, résultats du quiz
  `web/src/emails/` (BaseLayout + 4 templates), branchés dans les 4 routes API
- [x] **22. Checkout Stripe complet** — achat unique et abonnement mensuel, prix recalculés côté serveur
  `web/src/app/api/checkout/route.ts`
- [x] **23. Frais de livraison** — offerte dès 40 €, sinon 4,90 €, incitation affichée dans le panier
  `web/src/lib/pricing.ts`, `web/src/app/cart/page.tsx`
- [x] **24. Webhook Stripe** — signature vérifiée, idempotent, 5 événements écoutés, synchronisation des abonnements
  `web/src/app/api/stripe/webhook/route.ts`
- [x] **25. Portail client Stripe** — annulation d'abonnement, changement de carte, factures PDF, depuis `/account`
  `web/src/app/api/account/portal/route.ts`, `web/src/app/account/page.tsx`

---

## Phase 3 — Back-office & conformité légale ⬜ **PROCHAINE ÉTAPE**

- [ ] **26. Back-office produits**
  Espace `/admin` réservé aux comptes administrateurs (rôle `ADMIN` sur User). Création, modification et suppression de produits et de leurs ingrédients. Upload de photos. Gestion des stocks. Modération des avis. Objectif : ton ami gère le catalogue seul, sans toucher au code.
- [ ] **27. Bandeau cookies RGPD**
  Consentement granulaire (essentiels / mesure d'audience / marketing), refus aussi simple que l'acceptation, choix mémorisé. Aucun script de tracking chargé avant consentement. Prérequis légal de la tâche 28.
- [ ] **28. Mesure d'audience**
  Plausible (respectueux du RGPD, hébergeable) ou GA4. Suivi des pages vues et des événements clés : ajout au panier, checkout démarré, achat, inscription newsletter, quiz terminé.
- [ ] **29. Pages légales**
  CGV, mentions légales, politique de confidentialité, politique de cookies, droit de rétractation de 14 jours. Mentions sanitaires obligatoires pour les compléments alimentaires (« ne se substitue pas à une alimentation variée », avertissements grossesse et allaitement). Liens dans le pied de page.

## Phase 4 — Bloquants avant ouverture publique ⬜

- [ ] **30. Gestion des stocks**
  Quantité en stock par produit, décrément automatique à chaque commande payée (dans le webhook), affichage « plus que X en stock », bouton d'ajout désactivé en rupture.
- [ ] **31. Notification des commandes à l'équipe**
  Email à `commandes@pairs.fr` à chaque commande payée, plus webhook Slack ou Discord en option. Sans ça, personne ne sait qu'il y a un colis à préparer.
- [ ] **32. Suivi de commande**
  Statuts `payée → en préparation → expédiée → livrée` pilotables depuis le back-office, numéro de suivi transporteur, email automatique au client à chaque étape.
- [ ] **33. Supervision des erreurs**
  Sentry (gratuit jusqu'à 5 000 événements par mois). Sans ça, une erreur 500 au checkout passe inaperçue.
- [ ] **34. Politique de retour opérationnelle**
  Adresse de retour, formulaire de rétractation type, procédure de remboursement via Stripe depuis le back-office.

## Phase 5 — Données réelles & démarches ⬜ *(côté toi et ton ami, peu ou pas de code)*

- [ ] **35. Photos et textes définitifs**
  3 à 5 photos par produit (face, dos avec composition lisible, mise en situation), hébergées sur S3 ou Cloudflare R2 plutôt qu'Unsplash. Descriptions et compositions validées.
- [ ] **36. Compte Stripe activé**
  SIRET, RIB, justificatifs, validation KYC. Clés `sk_live_…` en place, webhook en mode live, test avec une vraie carte.
- [ ] **37. Nom de domaine et emails professionnels**
  `pairs.fr` plus `contact@`, `commandes@`, `hello@`. Configuration SPF, DKIM et DMARC pour la délivrabilité Resend.

## Phase 6 — Qualité produit ⬜

- [ ] **38. Adresses de livraison enregistrées**
  Stockage de l'adresse du client, pré-remplissage aux commandes suivantes.
- [ ] **39. Factures PDF pour les achats uniques**
  Stripe les génère pour les abonnements seulement. Génération et téléchargement depuis `/account`.
- [ ] **40. Recherche et tri des produits**
  Champ de recherche, tri par prix, nouveauté et popularité.
- [ ] **41. Avis clients vérifiés**
  Seuls les acheteurs réels peuvent déposer un avis, sollicités par email après livraison. Modération depuis le back-office. Alternative : Trustpilot ou Avis Vérifiés.
- [ ] **42. Page contact et FAQ**
  Formulaire de contact, FAQ sur la livraison, les retours, l'abonnement, la posologie et les allergènes.

## Phase 7 — Leviers de croissance ⬜

- [ ] **43. Relance des paniers abandonnés**
  Email 24 h après un ajout au panier sans paiement. Levier de conversion parmi les plus rentables.
- [ ] **44. Mesure d'audience avancée**
  Tunnels de conversion, attribution par canal, valeur vie client.
- [ ] **45. Programme de parrainage**
  « Parraine une amie : 10 € pour toi et pour elle ». Très efficace sur ce marché.
- [ ] **46. Emailing marketing**
  Klaviyo ou Brevo. Segmentation abonnés / acheteurs ponctuels / inactifs, séquence de bienvenue, réengagement.
- [ ] **47. Cartes cadeaux**
  Format classique pour ce type de produit, géré via Stripe.
- [ ] **48. Chat en direct**
  Crisp en version gratuite pour démarrer.

## Phase 8 — Robustesse & opérations ⬜

- [ ] **49. Tests automatisés**
  Tests d'intégration sur les parcours critiques : checkout, webhook Stripe, inscription, panier.
- [x] **50. Intégration continue** — GitHub Actions sur chaque push et chaque PR : lint, vérification des types, build (avec un Postgres de service, nécessaire car `generateStaticParams` interroge la base), et contrôle qu'aucun secret n'est versionné
  `.github/workflows/ci.yml`
  *Reste à faire, plus tard : le déploiement automatique sur le VPS.*
- [ ] **51. Export comptable**
  Export CSV mensuel des commandes, ou intégration Pennylane / Tiime / Sellsy.
- [ ] **52. Performance et référencement**
  Sitemap dynamique — et ajouter au même moment la ligne `Sitemap:` dans `robots.txt`, retirée tant que le sitemap n'existe pas. Données structurées schema.org (Product, Offer, AggregateRating), meta descriptions par produit, images AVIF/WebP, Core Web Vitals.

## Phase 9 — International ⬜

- [ ] **53. Multilingue** — anglais au minimum, via next-intl
- [ ] **54. Multidevise et TVA** — Stripe Tax gère la TVA par pays (1,5 % par transaction)
- [ ] **55. Livraison hors zone actuelle** — au-delà de FR, BE, CH, LU, MC

---

## Limites connues et dette technique

À garder en tête, ce sont des angles morts réels :

- **Rien n'a jamais tourné en production.** Le déploiement Docker n'a jamais été exécuté sur un vrai serveur. Le premier `deploy.sh` révélera probablement des ajustements.
- **Aucun paiement réel n'a été testé.** Le webhook Stripe est écrit et relu, mais n'a jamais reçu un vrai événement. À valider avec le Stripe CLI (`stripe listen`) avant d'ouvrir.
- **Aucun email n'a réellement été envoyé.** Le mode mock a été validé (rendu HTML correct), mais l'envoi via Resend n'a jamais été effectué faute de clé API.
- **Le build de l'image Docker n'a jamais été exécuté.** `next build` est désormais vérifié à chaque push par l'intégration continue, mais la construction de l'image (`web/Dockerfile`) et le démarrage de la pile complète n'ont jamais été testés. Le premier `deploy.sh` fera office de test.
- **Le build dépend du réseau.** `next/font` télécharge les polices Google au moment du build. Un incident réseau fait échouer le build (observé en CI, rattrapé par les tentatives automatiques). Si cela devient gênant, basculer sur des polices auto-hébergées.
- **Aucun test automatisé** (tâche 49). Toute modification peut casser un parcours sans qu'on le voie.
- **Panier mixte non géré.** Si le panier contient à la fois un achat unique et un abonnement, tout bascule en abonnement — Stripe ne permet pas de mélanger les deux dans une même session. À traiter le jour où ça se présente (deux sessions successives, ou blocage explicite côté panier).
- **Le rate limiting est en mémoire.** Il ne tient pas si l'application tourne en plusieurs instances. Migrer vers Redis le jour où on scale.
- **Les avis produits sont fictifs** (issus du seed) tant que la tâche 41 n'est pas faite.

---

## Journal des sessions

| Session | Livré |
|---|---|
| 1 | Tâches 1 à 11 — site complet en local avec SQLite |
| 2 | Tâches 12 à 19 — Postgres, Docker, Caddy, sécurité, mode DEV, guide de déploiement |
| 3 | Tâches 20 et 21 — emails transactionnels Resend |
| 4 | Tâches 22 à 25 — paiements et abonnements Stripe, portail client |
| 5 | Réorganisation de la documentation, création de cette roadmap |
| 6 | `CLAUDE.md` (consignes permanentes, matrice de propagation, format des commits) · correction de sécurité : `.env.production` et `backups/` n'étaient pas ignorés par git |
| 7 | Audit complet du dépôt : tâche 50 (intégration continue), `LICENSE`, `.nvmrc`, `.editorconfig`, scripts npm normalisés, nettoyage des résidus (base SQLite, `next-env.d.ts`, variable Stripe inutilisée), migration renommée |
