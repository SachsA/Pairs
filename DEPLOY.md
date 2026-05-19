# Guide de déploiement Pairs

Ce guide te conduit d'un repo fraîchement cloné jusqu'à un site en ligne sur ton propre domaine, sécurisé, sauvegardé, et bloqué en mode DEV par mot de passe le temps que ton ami valide le produit.

**Stack déployée** : Next.js standalone (Docker) + Postgres 16 (Docker) + Caddy (reverse proxy + HTTPS auto via Let's Encrypt) + UFW + fail2ban.

**Coût attendu** : 5–10 €/mois pour le VPS, 10–15 €/an pour le nom de domaine. Tout le reste est gratuit (Let's Encrypt, Docker, etc.).

---

## 1. Acheter un nom de domaine

**Où ?** Trois bons registrars :

| Registrar | Prix .fr (1ère année) | Avantages |
|---|---|---|
| **OVH** | ~6 € | FR, support FR, DNS rapide |
| **Gandi** | ~16 € | FR, sérieux, mais plus cher |
| **Cloudflare Registrar** | prix coûtant (~7 €) | Le moins cher au long cours, DNS Cloudflare inclus (rapide + protection DDoS) |

**Ma reco** : **Cloudflare Registrar** si tu veux le meilleur rapport qualité/prix, ou **OVH** si tu préfères une interface française et payer un peu plus pour le confort.

**Quel nom ?** `pairs.fr` (si dispo), `pairs.co`, `pairs.shop`, `pairs-paris.fr`… À vérifier sur le registrar. Évite les `.com` génériques s'ils sont à plusieurs centaines d'euros.

---

## 2. Acheter un VPS

**Reco principale : Hetzner Cloud** — le meilleur rapport qualité/prix d'Europe.

| Fournisseur | Modèle | RAM | CPU | Disque | Prix/mois | DC FR |
|---|---|---|---|---|---|---|
| **Hetzner** | CX22 | 4 Go | 2 vCPU | 40 Go | ~4,5 € | non (Allemagne / Finlande) |
| **Hetzner** | CX32 | 8 Go | 4 vCPU | 80 Go | ~7 € | non |
| **OVH** | VPS Starter | 2 Go | 1 vCPU | 40 Go | ~4 € | oui (Gravelines) |
| **OVH** | VPS Value | 4 Go | 2 vCPU | 80 Go | ~7 € | oui |
| **Scaleway** | DEV1-S | 2 Go | 2 vCPU | 20 Go | ~6 € | oui (Paris) |

Pour Pairs au démarrage : **CX22 chez Hetzner** ou **VPS Value chez OVH** font largement le job. Tu pourras upgrader plus tard.

**OS à installer** : **Ubuntu 24.04 LTS** (c'est ce que vise le script d'init).

**Au moment de la création du VPS** :
- Ajoute ta clé SSH publique (si tu n'en as pas : `ssh-keygen -t ed25519` dans ton terminal, puis colle le contenu de `~/.ssh/id_ed25519.pub`).
- Active IPv6 si proposé (c'est gratuit).
- Note bien l'IP publique fournie.

---

## 3. Pointer le DNS vers ton VPS

Sur l'interface de ton registrar (Cloudflare, OVH, etc.), ajoute deux enregistrements DNS :

| Type | Nom | Valeur | TTL |
|---|---|---|---|
| A | `@` | `<IP_DE_TON_VPS>` | 300 |
| A | `www` | `<IP_DE_TON_VPS>` | 300 |
| AAAA (optionnel) | `@` | `<IPv6_VPS>` | 300 |

> **Cloudflare** : laisse le **proxy désactivé** (nuage gris, pas orange) pour ton premier déploiement. Caddy a besoin de joindre Let's Encrypt directement pour obtenir le certificat. Tu pourras activer le proxy Cloudflare ensuite si tu veux.

La propagation prend de 5 min à 1 h. Tu peux vérifier avec `dig pairs.fr +short` ou [whatsmydns.net](https://whatsmydns.net).

---

## 4. Préparer le serveur (5 min)

Une fois le VPS prêt et le DNS qui pointe :

```bash
ssh root@<IP_DE_TON_VPS>
```

Lance le script d'init (il installe Docker, configure UFW, fail2ban, crée un utilisateur non-root, désactive le login root) :

```bash
curl -fsSL https://raw.githubusercontent.com/<ton-user>/<ton-repo>/main/scripts/init-server.sh | bash
```

> Si ton repo n'est pas encore sur GitHub, copie-colle simplement le contenu de `scripts/init-server.sh` dans un fichier `init.sh` sur le serveur et lance `bash init.sh`.

À la fin, **le login root est désactivé**. Reconnecte-toi en tant que `pairs` :

```bash
ssh pairs@<IP_DE_TON_VPS>
```

---

## 5. Déposer le code sur le serveur

```bash
cd /opt/pairs
git clone <url-de-ton-repo> .
# (ou : scp -r ~/Pairs/* pairs@<IP>:/opt/pairs/  si tu n'as pas encore de repo git)
```

Configure les variables d'environnement de production :

```bash
cp .env.production.example .env.production
nano .env.production
```

À remplir absolument :
- `DOMAIN=ton-domaine.fr`
- `ACME_EMAIL=ton@email.com` (pour Let's Encrypt — utilisé pour les notifs d'expiration)
- `NEXTAUTH_URL=https://ton-domaine.fr`
- `NEXT_PUBLIC_SITE_URL=https://ton-domaine.fr`
- `POSTGRES_PASSWORD=` ← **générer** : `openssl rand -base64 32`
- `NEXTAUTH_SECRET=` ← **générer** : `openssl rand -base64 32`
- `SITE_LOCK=1` (laisse ce 1 tant que tu n'es pas prêt à ouvrir au public)
- `SITE_LOCK_PASSWORD=` ← un mot de passe que tu partageras à ton ami / ses partenaires
- Stripe : laisse les `_placeholder` si tu n'as pas encore de compte Stripe. Le checkout passera en mode démo (pas de vrai paiement). Tu remplaceras par les vraies clés `sk_live_…` quand le compte Stripe sera ouvert.

> ⚠ `chmod 600 .env.production` — pour que seul l'user `pairs` puisse le lire.

---

## 6. Lancer le déploiement

```bash
./scripts/deploy.sh
```

Le script :
1. Build l'image Docker de l'app (~2–3 min la première fois).
2. Démarre Postgres, attend qu'il soit prêt.
3. Lance les migrations Prisma (`prisma migrate deploy`).
4. Démarre l'app et Caddy.
5. Caddy demande automatiquement un certificat HTTPS à Let's Encrypt (~30 s).

Vérifie que tout tourne :

```bash
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs -f app
```

Ouvre `https://ton-domaine.fr` dans le navigateur. Tu dois tomber sur la page **"Site en construction"** avec le formulaire mot de passe. ✓

---

## 7. Initialiser les données (1ère fois uniquement)

Quand le site tourne, lance le seed pour avoir les 6 produits + avis :

```bash
docker compose --env-file .env.production exec app npx tsx prisma/seed.ts
```

> Note : le seed dépend de `tsx` qui n'est pas embarqué dans l'image standalone. Si la commande échoue, alternative : connecte-toi à Postgres et exécute le SQL équivalent, ou exécute le seed via `docker compose exec app sh -c "npx prisma db seed"` après avoir ajouté un script `seed` dans `package.json` sous `prisma.seed`. Pour simplifier, je te recommande de lancer le seed une fois en local connecté à la BDD prod via tunnel SSH.

---

## 8. Activer les sauvegardes automatiques

```bash
crontab -e
```

Ajoute :

```cron
# Backup Postgres tous les jours à 3h du matin
0 3 * * * /opt/pairs/scripts/backup.sh >> /var/log/pairs-backup.log 2>&1
```

Les dumps `.sql.gz` arrivent dans `/opt/pairs/backups/`. Les fichiers de plus de 14 jours sont supprimés automatiquement.

**Recommandation forte** : envoie aussi une copie chez un fournisseur externe (Hetzner Storage Box ~3 €/mois, Backblaze B2, ou simplement `rclone` vers ton Google Drive personnel). En cas de compromission du serveur, tu auras encore tes données.

---

## 9. Passer du mode DEV au mode public

Quand tu veux ouvrir le site :

```bash
nano .env.production       # passe SITE_LOCK à 0
./scripts/deploy.sh        # redémarre avec les nouvelles variables
```

L'inverse marche aussi : remettre `SITE_LOCK=1` re-bloque l'accès instantanément.

> Note : le `robots.txt` change automatiquement. En mode DEV, il dit `Disallow: /` (les moteurs de recherche ne t'indexeront pas). En mode public, il ouvre tout.

---

## 10. Mettre à jour le site (déploiements suivants)

```bash
ssh pairs@<IP>
cd /opt/pairs
./scripts/deploy.sh
```

Le script fait `git pull` + rebuild + redémarrage. Zero downtime sur les nouvelles requêtes (Docker remplace le container progressivement).

---

## Architecture déployée

```
Internet (HTTPS)
       │
       ▼
   ┌────────────┐
   │   Caddy    │  ←─ Let's Encrypt (cert auto)
   │  :80 :443  │  ←─ Headers de sécurité, gzip, cache
   └─────┬──────┘
         │ http://app:3000
         ▼
   ┌────────────┐
   │  Next.js   │  ←─ user nextjs (uid 1001, non-root)
   │ standalone │  ←─ Healthcheck /api/health
   │   :3000    │
   └─────┬──────┘
         │ postgresql://postgres:5432
         ▼
   ┌────────────┐
   │ Postgres   │  ←─ Volume persistant
   │     16     │  ←─ Pas exposé en dehors du réseau Docker
   └────────────┘
```

**Sécurité en place** :

- 🔒 **Firewall UFW** : seuls 22 (SSH), 80, 443 ouverts. Postgres n'est PAS accessible depuis l'internet.
- 🔒 **fail2ban** : bloque les IPs qui font du brute force SSH.
- 🔒 **SSH** : login root désactivé, password désactivé (clé SSH uniquement).
- 🔒 **HTTPS auto** : Let's Encrypt via Caddy, certif renouvelé automatiquement tous les 60 jours.
- 🔒 **Headers HTTP** : HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Permissions-Policy strict.
- 🔒 **Container non-root** : l'app tourne en uid 1001.
- 🔒 **Postgres réseau interne uniquement** : aucun port exposé sur l'hôte.
- 🔒 **DEV gate** : mot de passe global avec cookie HMAC signé (impossible à forger).
- 🔒 **Rate limiting** : 5 inscriptions / 15 min / IP, 10 newsletters / heure / IP, 8 tentatives DEV gate / 10 min / IP.
- 🔒 **Cookies** : HttpOnly + Secure + SameSite=Lax.
- 🔒 **Secrets dans .env.production** : non commités, lisibles uniquement par le user `pairs` (chmod 600).
- 🔒 **Mises à jour de sécurité automatiques** : `unattended-upgrades` actif.

---

## Domaines & questions courantes

### Le HTTPS, je dois acheter un certificat ?

Non. Caddy gère ça tout seul via Let's Encrypt, gratuitement, à vie. Dès que ton DNS pointe vers le serveur et que Caddy démarre, il négocie un certificat. C'est valide 90 jours et renouvelé automatiquement.

### Faut-il un Cloudflare devant ?

**Pas indispensable**, mais utile si :
- Tu veux protéger contre le DDoS (Cloudflare est gratuit pour ça).
- Tu veux du cache global pour servir les pages statiques plus vite à l'international.

Si tu actives Cloudflare en mode "proxied" (nuage orange), Caddy ne pourra plus valider le certificat via HTTP-01. Solution : utiliser le challenge DNS-01 (un peu plus compliqué) ou laisser Cloudflare générer son propre certificat origin et utiliser le mode "Full (strict)".

**Ma reco au démarrage** : pas de Cloudflare proxy, juste Caddy + Let's Encrypt. Tu rajouteras Cloudflare quand tu auras du trafic.

### Quel email professionnel ?

Pour `contact@ton-domaine.fr` et autres adresses, tu ne peux pas envoyer/recevoir avec juste un domaine. Solutions :
- **Google Workspace** : ~5 €/utilisateur/mois, le plus simple.
- **Fastmail** : ~3,5 €/utilisateur/mois, très bon rapport qualité/prix.
- **OVH MX Plan** : 1 €/mois pour 5 Go.
- **Cloudflare Email Routing** : gratuit, permet de **rediriger** `contact@pairs.fr` → ton Gmail. Pas d'envoi depuis l'adresse, juste la réception. Bien pour démarrer.

### Emails transactionnels (Resend)

L'app envoie 4 emails automatiquement via [Resend](https://resend.com) :

| Événement | Email envoyé |
|---|---|
| Inscription newsletter (popup -10%) | `NewsletterWelcomeEmail` avec le code promo |
| Création de compte | `AccountWelcomeEmail` |
| Commande payée (mock) | `OrderConfirmationEmail` avec récap |
| Quiz terminé + email fourni | `QuizResultsEmail` avec les 3 recommandations |

**Mode mock** : si `RESEND_API_KEY` est vide, les emails sont loggés dans la console au lieu d'être envoyés. Aucune erreur, aucun crash. Utile en dev.

**Setup en prod** :

1. Créer un compte sur [resend.com](https://resend.com) (3000 emails/mois gratuits).
2. **Vérifier ton domaine** (étape critique pour la délivrabilité) :
   - Dashboard Resend → Domains → Add Domain → `pairs.fr`.
   - Resend te donne 3 enregistrements DNS à ajouter chez ton registrar :
     - 1 `TXT` racine (SPF)
     - 1 `TXT` sur `resend._domainkey` (DKIM)
     - 1 `MX` (optionnel mais recommandé)
   - Attendre 5-30 min, cliquer "Verify".
3. Récupérer la clé API : Dashboard → API Keys → Create.
4. Mettre dans `.env.production` :
   ```
   RESEND_API_KEY=re_xxxxxxxxxxx
   EMAIL_FROM="Pairs <hello@pairs.fr>"
   ```
5. `./scripts/deploy.sh` pour redéployer.

**Tester sans domaine vérifié** : tu peux laisser `EMAIL_FROM="Pairs <onboarding@resend.dev>"`. Resend limite alors les envois à TON propre email (celui du compte) — utile pour vérifier que ça marche avant de configurer le DNS.

**Bons pour info** : les emails sont envoyés en **fire-and-forget** (non-bloquant). Si Resend est down, la commande/inscription réussit quand même, juste sans email. Pour de la prod sérieuse, mettre une queue (BullMQ + Redis) plus tard.

### Autres providers d'envoi

Si tu préfères Brevo (ex-Sendinblue, FR, 300 emails/jour gratuits à vie) ou Postmark : l'interface `sendEmail()` dans `web/src/lib/email.ts` est isolée — tu peux remplacer l'appel Resend par n'importe quelle autre API sans toucher au reste.

### Monitoring ?

Pour surveiller que ton site est en ligne :
- **UptimeRobot** (gratuit) — ping ton URL toutes les 5 min, alerte par email/SMS si down.
- **BetterStack** — interface plus moderne, gratuit jusqu'à 10 monitors.

Pour les logs : `docker compose --env-file .env.production logs -f app caddy` te suffit au début.

### Et si je veux un staging séparé ?

Crée un sous-domaine `staging.pairs.fr` qui pointe vers une autre VM (ou même le même serveur avec un second compose et un autre port). Garde-le toujours en `SITE_LOCK=1`.

---

## Troubleshooting

**Caddy renvoie "no certificate"** → le DNS ne pointe pas encore vers le serveur, ou tu as Cloudflare en mode proxied. `dig ton-domaine.fr +short` doit retourner ton IP serveur.

**`docker compose up` échoue avec "POSTGRES_PASSWORD requis"** → ton `.env.production` manque cette variable ou tu n'as pas passé `--env-file .env.production`.

**Le site charge mais montre une erreur 500** → `docker compose logs app`. Souvent c'est `DATABASE_URL` invalide ou Prisma qui n'arrive pas à se connecter (Postgres pas encore prêt — réessaye dans 30 s).

**Mot de passe DEV oublié** → édite `.env.production` puis `./scripts/deploy.sh`.

**Disque plein** → `docker system prune -a -f --volumes` (attention, supprime les volumes non utilisés). Pour les backups, ajuste la rétention dans `backup.sh`.

---

## Stripe : paiements, abonnements, codes promo

L'app gère les achats uniques, les abonnements mensuels, le portail client, les codes promo et la livraison (offerte dès 40 €, sinon 4,90 €).

### 1. Créer le compte

1. [stripe.com](https://stripe.com) → créer un compte.
2. Compléter les informations légales (SIRET, IBAN, RIB). Tant que le compte n'est pas activé, tu peux utiliser le **mode Test** (clés `sk_test_…` / `pk_test_…`).

### 2. Récupérer les clés API

Dashboard → Developers → API keys.

| Clé | Variable d'env |
|---|---|
| Publishable key (`pk_…`) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Secret key (`sk_…`) | `STRIPE_SECRET_KEY` |

### 3. Configurer le webhook (CRITIQUE)

Sans webhook, les commandes restent en statut `pending` même après paiement.

Dashboard → Developers → Webhooks → **Add endpoint**.

- **Endpoint URL** : `https://ton-domaine.fr/api/stripe/webhook`
- **Events à écouter** :
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Cliquer **Add endpoint** puis copier le **Signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET` dans `.env.production`.

> **Test en local** : `stripe listen --forward-to localhost:3000/api/stripe/webhook` (via le [Stripe CLI](https://stripe.com/docs/stripe-cli)). Le CLI te donne un `whsec_…` de test à mettre dans ton `.env`.

### 4. Activer le Customer Portal

Dashboard → Settings → **Customer portal** → **Activate**.

- Cocher les fonctionnalités : annulation, mise à jour du moyen de paiement, factures.
- Sauver. Désormais le bouton "Gérer mes abonnements" sur `/account` mène à un portail Stripe complet.

### 5. Créer les codes promo

Dashboard → Products → **Coupons** → **New coupon**.

Exemple pour le code popup newsletter -10% :
- Type : Percentage
- Percent off : 10
- Duration : Once
- Cliquer **Create coupon** → puis **Create promotion code** → code `BIENVENUE10` (visible par le client).

Les codes sont automatiquement proposés sur le Stripe Checkout grâce à `allow_promotion_codes: true`.

### 6. Tester un paiement

En mode test, utilise les [cartes de test Stripe](https://stripe.com/docs/testing) :
- ✅ Succès : `4242 4242 4242 4242` — n'importe quelle date future / CVC.
- ⚠ 3D Secure : `4000 0027 6000 3184`.
- ❌ Refusée : `4000 0000 0000 9995`.

Sur la page de confirmation, tu dois voir le statut **Payée** et recevoir l'email de confirmation.

### 7. Passer en LIVE

Quand ton compte Stripe est activé (KYC validé) :
- Récupérer les clés `sk_live_…` / `pk_live_…` dans le dashboard (toggle "View test data" en haut à droite).
- Refaire un webhook en mode live (URL identique, secret différent).
- Mettre à jour `.env.production` et redéployer.

### Architecture flux paiement

```
Client clique "Passer au paiement"
   │
   ▼
POST /api/checkout
   - charge produits depuis BDD (prix font foi)
   - calcule shipping (gratuit ≥40€, sinon 4,90€)
   - crée Order (status=pending)
   - crée/réutilise Stripe Customer (si user loggé)
   - crée Stripe Checkout Session (mode payment ou subscription)
   - renvoie l'URL Stripe
   │
   ▼
Client redirigé vers Stripe Checkout
   - paie en CB, applique éventuellement un code promo
   - Stripe envoie un webhook checkout.session.completed
   │
   ▼
POST /api/stripe/webhook
   - vérifie la signature Stripe
   - met Order en status=paid
   - si subscription → crée/sync row Subscription
   - envoie email de confirmation
   │
   ▼
Client redirigé vers /checkout/success
   - voit le récap (Order chargée depuis BDD)
   - panier vidé
```

---

## Checklist avant d'ouvrir au public

- [ ] Compte Stripe activé (KYC validé), clés `sk_live_…` mises dans `.env.production`
- [ ] Webhook Stripe configuré en mode live (URL + secret + 5 events)
- [ ] Customer Portal activé dans Stripe Settings
- [ ] Codes promo créés dans Stripe (au moins `BIENVENUE10`)
- [ ] CGV, Mentions légales, Politique de confidentialité rédigées
- [ ] Service d'envoi d'emails (Resend) branché pour les confirmations
- [ ] Tests de paiement réels effectués (un petit montant en CB perso)
- [ ] Backups vérifiés (restaurer un dump dans un environnement test)
- [ ] Monitoring UptimeRobot actif
- [ ] `SITE_LOCK=0` activé
- [ ] Annonce publique 🎉

Phase 1 — Tes 3 tâches initiales (back-office d'abord, parce que les pages légales en dépendent)
1. Back-office admin produits. Page /admin protégée par rôle ADMIN, CRUD produits + ingrédients + photos (upload), gestion stocks, modération des avis. Ton ami se connecte avec un compte marqué admin et gère tout depuis une UI.
2. Bannière cookies RGPD + Cookies tracking-aware. Bannière qui bloque les cookies non-essentiels tant que le client n'a pas consenti. Pré-requis pour l'analytics (sinon illégal en Europe).
3. Analytics. Plausible (RGPD-friendly, pas besoin de bannière dans certains cas) ou GA4 (gratuit, plus complet). Tracking : pages vues, événements (ajout panier, checkout, achat, inscription newsletter, quiz complété).
4. Pages légales. CGV, mentions légales, politique de confidentialité, politique de cookies, droit de rétractation 14 jours, mentions sanitaires obligatoires pour les compléments alimentaires. Liens en footer.
Phase 2 — Bloquants pour ouvrir au public (ordre opérationnel)
5. Gestion des stocks. Champ stockQuantity + stockStatus (in_stock, low_stock, out_of_stock) sur Product. Décrément automatique à chaque commande payée (dans le webhook Stripe). Affichage "Plus que X en stock" sur la fiche produit. Désactivation auto du bouton "Ajouter au panier" si rupture.
6. Notification commande à l'équipe. Email à commandes@pairs.fr à chaque nouvelle commande payée, + webhook Slack/Discord optionnel. Sans ça personne ne sait qu'il y a un colis à préparer.
7. Suivi de commande côté admin. Dans le back-office : voir toutes les commandes, changer le statut (paid → preparing → shipped → delivered), ajouter un numéro de suivi (Colissimo / Mondial Relay / Chronopost). Email automatique au client à chaque changement.
8. Sentry pour le monitoring d'erreurs. 10 min à brancher, te sauve quand un bug passe en prod (typiquement les premiers webhooks Stripe foireux).
9. Politique de retour + droit de rétractation opérationnel. Adresse de retour, formulaire type, processus côté admin pour rembourser via Stripe.
Phase 3 — Vraies données (côté ton ami, pas côté dev)
10. Vraies photos produits + descriptions définitives. 3-5 photos par produit (face, dos avec composition lisible, lifestyle), hébergées sur S3/Cloudflare R2 plutôt que Unsplash. Descriptions et compositions définitives validées par la formulation.
11. Compte Stripe live activé (KYC). SIRET, RIB, justificatifs. Compte créé, business validé par Stripe, clés sk_live_… en place. Test de paiement avec une vraie CB pour de vrai.
12. Domaine pro + emails pros. pairs.fr + contact@pairs.fr, commandes@pairs.fr, hello@pairs.fr. Configuration SPF/DKIM/DMARC pour la délivrabilité Resend.
Phase 4 — Qualité produit (avant ou juste après ouverture)
13. Adresses de livraison persistantes. Stocker l'adresse de l'utilisateur (récupérée depuis Stripe ou saisie dans /account). Pré-remplissage au prochain checkout.
14. Factures PDF pour les paiements uniques. Stripe les fait pour les abos, mais pas pour les one-shot. Génération + lien de téléchargement dans /account.
15. Recherche produit + tri. Champ de recherche sur /products. Tri par prix, nouveauté, popularité.
16. Avis clients vérifiés. Système qui permet aux acheteurs réels de laisser un avis (un email post-livraison "Comment évalueriez-vous ce produit ?"). Modération côté admin. Anti-fake-reviews.
17. Page contact + FAQ. Formulaire de contact qui envoie à contact@pairs.fr. FAQ couvrant : livraison, retours, abonnement, posologie, ingrédients, allergies.
Phase 5 — Levers de croissance (post-lancement)
18. Récupération de paniers abandonnés. Email 24h après ajout au panier sans paiement. +10-30% de conversion typiquement.
19. Tracking événements analytics avancé. Conversions, entonnoirs, attribution canal (organique vs payant).
20. Programme de parrainage / fidélité. "Parraine une amie = 10 € pour toi et elle". Très efficace dans le wellness.
21. Marketing email (Klaviyo ou Brevo). Campagnes segmentées (clients abos vs one-shot, dormants, gros panier moyen…). Welcome series, ré-engagement.
22. Cartes cadeaux. Format classique pour ce type de produit.
23. Chat live. Crisp gratuit pour démarrer. Améliore la conversion en levant les blocages temps réel.
Phase 6 — Robustesse / opérations (en parallèle)
24. Tests automatisés. Tests d'intégration sur les flows critiques (checkout, webhook Stripe, inscription, panier). Pour pouvoir livrer sans casser.
25. CI/CD GitHub Actions. Push sur main → build → tests → deploy auto sur VPS. Fini le git pull manuel.
26. Compta / export commandes. Export CSV mensuel des commandes pour la compta, ou intégration Pennylane/Tiime/Sellsy.
27. Optimisations performance + SEO. Sitemap.xml dynamique, schema.org Product + AggregateRating + Offer, meta descriptions par page produit, formats images AVIF/WebP, optimisation Core Web Vitals.
Phase 7 — Si tu vises l'international
28. Multi-langue (EN minimum). i18n via next-intl ou next-translate.
29. Multi-devise + Stripe Tax. Pour vendre en Suisse, UK, US. Stripe Tax gère la TVA par pays automatiquement (1,5%/transaction).
30. Multi-pays livraison. Élargir au-delà de FR/BE/CH/LU/MC, négocier tarifs transporteurs internationaux.
