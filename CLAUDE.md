# Instructions permanentes — projet Pairs

Ce fichier est lu au démarrage de chaque session. Il contient le contexte du projet et les règles de travail à appliquer **systématiquement**, sans qu'Alex ait à les redemander.

---

## Le projet en dix lignes

Pairs est une boutique en ligne de compléments alimentaires premium pour les femmes, à l'unité ou sur abonnement mensuel. Alex développe le site ; son ami porte la marque et gérera le catalogue.

- **Stack** : Next.js 14 (App Router) · TypeScript · Tailwind · PostgreSQL + Prisma · NextAuth · Stripe · Resend · Docker + Caddy
- **État** : fonctionne en local, **jamais déployé**, **aucun paiement réel testé**, **aucun email réellement envoyé**
- **Documentation** : `README.md` (comprendre et installer) · `ROADMAP.md` (avancement, 55 tâches numérotées) · `DEPLOY.md` (mise en ligne)
- **Langue** : toute la documentation, les commentaires de code et les échanges sont en **français**

---

## Règle 1 — Après CHAQUE modification, propager partout

Toute modification de code a des répercussions ailleurs dans le dépôt. Avant de dire qu'une tâche est terminée, parcourir **l'intégralité** de la matrice ci-dessous et corriger tout ce qui est devenu faux.

### Matrice d'impact

| Ce que je viens de faire | Ce que je dois vérifier et mettre à jour |
|---|---|
| **Terminé une tâche de la roadmap** | `ROADMAP.md` : cocher `[x]`, ajouter les fichiers créés, mettre à jour le compteur d'avancement en tête, le tableau des phases, et le journal des sessions |
| **Ajouté une page** | Liens dans `Footer.tsx` et/ou `Header.tsx` · arborescence dans `README.md` · sitemap · `ROADMAP.md` |
| **Ajouté une route API** | `middleware.ts` → `PUBLIC_PATHS` si elle doit contourner le verrou du mode construction (webhooks, sondes) · rate limiting si elle est publique · arborescence `README.md` |
| **Ajouté une variable d'environnement** | `web/.env.example` · `.env.production.example` · `docker-compose.yml` (bloc `environment` du service `app`) · tableau des variables dans `README.md` · `DEPLOY.md` si elle demande une action de configuration |
| **Ajouté une dépendance npm** | `web/package.json` · `web/Dockerfile` si elle exige une bibliothèque système · tableau de la stack dans `README.md` |
| **Modifié `schema.prisma`** | Créer la migration · mettre à jour `prisma/seed.ts` pour les nouveaux champs · nombre de modèles annoncé dans `README.md` · vérifier les routes qui lisent ces champs |
| **Branché un service externe** (analytics, Sentry, stockage d'images…) | **`Caddyfile` → la CSP**, sinon le script sera bloqué en production · `next.config.mjs` → `images.remotePatterns` si ce sont des images · variables d'environnement (voir ligne dédiée) · section dédiée dans `DEPLOY.md` |
| **Ajouté un script npm** | Section « commandes utiles » de `README.md` · `.github/workflows/ci.yml` si le script doit tourner en intégration continue |
| **Ajouté un fichier à la racine** | Arborescence commentée du `README.md` |
| **Modifié les étapes de vérification** | `.github/workflows/ci.yml` et la règle 2 de ce fichier doivent rester alignés |
| **Ajouté un fichier généré, un secret ou des données** | `.gitignore` racine ou `web/.gitignore` · vérifier avec `git check-ignore -v <fichier>` |
| **Ajouté un email transactionnel** | `web/src/emails/` · brancher dans la route concernée · `scripts/preview-emails.mjs` · `DEPLOY.md` section Resend |
| **Modifié le processus de déploiement** | `DEPLOY.md` · `scripts/*.sh` · `docker-compose.yml` |
| **Découvert une limite ou une dette** | Section « limites connues » de `ROADMAP.md` — ne jamais la passer sous silence |

### Points de vigilance récurrents

- **La CSP du `Caddyfile` casse silencieusement les services tiers.** Tout nouveau domaine de script, de police, d'image ou d'appel réseau doit y être déclaré. L'oubli ne se voit qu'en production.
- **Le middleware bloque tout par défaut** quand `SITE_LOCK=1`. Une nouvelle route appelée par une machine (webhook Stripe, sonde de supervision) doit être ajoutée à `PUBLIC_PATHS`, sinon elle reçoit une redirection 307.
- **Les prix se recalculent toujours côté serveur.** Ne jamais faire confiance aux montants envoyés par le client.
- **Les secrets ne sont jamais versionnés.** Seuls les fichiers `*.example` le sont.

---

## Règle 2 — Vérifier avant d'annoncer

Ne jamais présenter un travail comme terminé sans avoir lancé ce qui est vérifiable :

```bash
cd web && npm run lint                  # doit sortir « No ESLint warnings or errors »
cd web && npm run typecheck             # erreurs Prisma acceptables si le client n'est pas généré
cd web && npm run build                 # quand l'environnement le permet
python3 -c "import yaml,sys; [yaml.safe_load(open(f)) for f in ['docker-compose.yml','docker-compose.dev.yml','.github/workflows/ci.yml']]"
git check-ignore -v .env.production     # les secrets restent bloqués
```

Ce sont les mêmes contrôles que ceux exécutés par l'intégration continue (`.github/workflows/ci.yml`) : si ça passe en local, ça passe sur GitHub.

Distinguer explicitement, dans le compte rendu, **ce qui a été vérifié** de **ce qui est seulement écrit**. Une erreur due à l'environnement (moteurs Prisma inaccessibles, réseau restreint) doit être annoncée comme telle, pas masquée.

---

## Règle 3 — Toujours fournir les messages de commit

Terminer **chaque** réponse comportant des modifications par la commande complète, prête à copier-coller d'un bloc :

```bash
git add -A && git commit -m "<type>(<portée>): <description courte>" && git push
```

**Un seul commit par intervention**, qui couvre l'ensemble des modifications. **Rester court** : 70 caractères maximum, en français, à l'impératif, jamais de corps de message.

**Types** : `feat` fonctionnalité · `fix` correction · `docs` documentation · `refactor` réécriture sans changement de comportement · `chore` outillage et configuration · `perf` performance · `test` tests · `security` correction de sécurité

**Portées** : `admin` `products` `cart` `checkout` `stripe` `auth` `emails` `quiz` `legal` `analytics` `docker` `deploy` `db` `seo` `docs`

Exemples :

```bash
git add -A && git commit -m "feat(admin): ajouter le back-office produits" && git push
git add -A && git commit -m "fix(cart): corriger le calcul des frais de port" && git push
```

---

## Règle 4 — Tenir la roadmap à jour

`ROADMAP.md` est la source unique de vérité sur l'avancement. Les 55 tâches sont numérotées de façon stable : **ne jamais renuméroter**. Une tâche nouvelle s'ajoute à la fin de sa phase avec le numéro suivant.

À chaque tâche terminée, quatre endroits changent dans ce fichier : la case à cocher, le compteur d'avancement en tête, le tableau des phases, le journal des sessions.

---

## Conventions de code

- Composants serveur par défaut ; `"use client"` uniquement si état, effet ou événement
- Validation des entrées API avec Zod, systématiquement
- Montants en **centimes** (entiers), formatés à l'affichage via `lib/format.ts`
- Les envois d'email ne bloquent jamais un parcours métier : `sendEmailAsync`, erreurs journalisées
- L'application doit tourner **sans** clé Stripe ni Resend : mode démonstration et mode console
- Textes en français, apostrophes typographiques dans l'interface

---

## Ce qu'il ne faut pas faire

- Écrire un secret réel dans un fichier versionné
- Marquer une tâche terminée alors qu'elle est partielle ou non vérifiée
- Dupliquer une information de documentation à deux endroits — préférer un lien, la duplication finit toujours par diverger
- Renuméroter les tâches de la roadmap
- Laisser une information périmée dans un document parce qu'elle sort du périmètre demandé
