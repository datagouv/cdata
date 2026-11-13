# Tests E2E avec Playwright

Ce document explique comment les tests E2E sont configurés pour tester l'intégration entre cdata (Nuxt.js) et udata (Flask).

## Configuration

### GitHub Actions

Voir **.github/workflows/ci.yml**.

### Architecture des tests

Les tests E2E simulent un environnement complet avec :
- **Base de données** : MongoDB (via Docker)
- **Cache/Queue** : Redis (via Docker)
- **Backend API** : udata (Flask) qui fournit l'API
- **Frontend** : cdata (Nuxt.js) qui consomme l'API

### Workflow détaillé

1. **Setup de l'environnement**
   - Checkout des deux repositories (cdata et udata)
   - Installation de Node.js et Python
   - Installation des dépendances

2. **Services de données**
   - Démarrage de MongoDB et Redis via Docker Compose
   - Attente que les services soient prêts

3. **Backend (udata)**
   - Installation des dépendances Python et udata avec `pip install -e .`
   - Configuration avec un fichier `udata.cfg` pour les tests
   - Initialisation avec la commande `udata init`
   - Démarrage du serveur avec `inv serve --port=5000`

4. **Frontend (cdata)**
   - Build de l'application Nuxt.js
   - Configuration pour pointer vers l'API udata locale
   - Démarrage du serveur sur le port 3000

5. **Tests Playwright**
   - Exécution des tests E2E
   - Upload des rapports et artefacts

## Configuration locale

Pour tester localement :

1. **Démarrer udata**
2. **Rajouter les variables d'environnement nécessaires dans `.env`**:
```
NUXT_PUBLIC_HOMEPAGE_HERO_IMAGES="hero_15.png"  #  to avoid homepage image randomness
UDATA_WORKING_DIR="/path/to/udata/"  # to allow for udata commands execution (ex: in 2FA flow tests cleanup)
NUXT_PUBLIC_TABULAR_API_PREVIEW_RESOURCES_ID="982d9dd0-365a-4c4b-8a83-75dec40c36bb"  # preview dashboard E2E tests
NUXT_PUBLIC_TABULAR_API_PREVIEW_STATS_ID="33cf9a65-3f77-4d88-acd1-bca420d83e60"  # preview dashboard E2E tests
```
3. **Lancer les tests** :
```bash
pnpm run test:e2e
```

## Scripts disponibles

- `pnpm run test:e2e` : Lance les tests E2E en mode headless
- `pnpm run test:e2e:ui` : Lance les tests avec l'interface Playwright
- `pnpm run test:e2e:headed` : Lance les tests en mode visible

## Paramètres fréquemment utilisés
- `--project firefox`: Lance uniquement les tests pour firefox (existe aussi avec `--project chromium`)
- `--only-changed`: Lance uniquement les tests modifiés depuis le dernier commit, et les tests qui importent un fichier modifié

## Assistant factice

Les tests du configurateur de graphiques (`tests/visualizations/chart-configurator.spec.ts`, `chart-assistant.spec.ts`) ne parlent jamais à un vrai assistant : `tests/fake-services.ts` sert `POST /api/1/assistant/chat/` en flux Vercel AI (`tests/assistantApi.ts`).

- **Scénario par défaut** (fake-services) : au premier message de l'utilisateur, un appel `create_chart` (dep / max `n_cum_dose1`, histogramme, tri `axis_y-desc`, limite 5, sur la ressource de la requête) ; aux messages suivants, un appel `update_chart` (`y_axis.unit = "doses"`).
- **Scénario propre à un test** : `routeAssistantStream(page, stream)` (`tests/assistantApi.ts`) intercepte la requête du chat dans la page. `stream` est un flux (`createChartStream(resourceId, output)`, `updateChartStream()`) ou une fonction du corps de la requête. `chart-assistant.spec.ts` s'en sert pour scripter un graphique sur les colonnes du profil de la ressource mockée (`tests/visualizations/profile.json`).
- Les données tabulaires sont mockées par `mockTabular` ; `setupChart` l'appelle, donc une route `/data/` propre à un test doit être déclarée **après** `setupChart` pour être prise en compte.

### Pièges

- **Port des faux services** : Playwright démarre les faux services en local sur le port 3100 par défaut. Si ce port est occupé (par exemple par un frontend de démo), définir `FAKE_SERVICES_URL` (ex. `FAKE_SERVICES_URL=http://localhost:3109`) : le port de cette URL est utilisé pour le serveur.
- **Serveur déjà lancé** : `reuseExistingServer` est actif. Un `pnpm dev` déjà lancé ne reçoit pas l'environnement du `webServer` (`NUXT_PUBLIC_ASSISTANT_API_BASE`) : les tests de l'assistant visent alors la vraie `apiBase`. Lancer le serveur avec `NUXT_PUBLIC_ASSISTANT_API_BASE=<FAKE_SERVICES_URL>` (en CI, c'est l'étape « Start cdata server »).
