# Tests E2E avec Playwright

Ce document explique comment les tests E2E sont configurés pour tester l'intégration entre cdata (Nuxt.js) et udata (Flask).

## Configuration

### GitHub Actions

Voir **e2e.yml**.

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
```
3. **Lancer les tests** :
```bash
pnpm run test:e2e
```

## Scripts disponibles

- `pnpm run test:e2e` : Lance les tests E2E en mode headless
- `pnpm run test:e2e:ui` : Lance les tests avec l'interface Playwright
- `pnpm run test:e2e:headed` : Lance les tests en mode visible
