# Tests E2E avec Playwright

Ce document explique comment les tests E2E sont configurés pour tester l'intégration entre cdata (Nuxt.js) et udata (Flask).

## Configuration

### GitHub Actions

Deux workflows ont été créés :

1. **e2e-tests.yml** - Workflow complet qui installe tout manuellement
2. **e2e-simple.yml** - Workflow simplifié qui utilise Docker Compose

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

1. **Démarrer udata** :
```bash
cd ../udata
docker-compose up -d
pip install -e .
udata init
inv serve --port 5000
```

2. **Démarrer cdata** :
```bash
cd cdata
NUXT_PUBLIC_API_BASE=http://localhost:5000/api/1/ npm run dev
```

3. **Lancer les tests** :
```bash
npm run test:e2e
```

## Variables d'environnement

- `BASE_URL` : URL de base pour cdata (défaut: http://localhost:3000)
- `NUXT_PUBLIC_API_BASE` : URL de l'API udata (défaut: http://localhost:5000/api/1/)

## Scripts disponibles

- `npm run test:e2e` : Lance les tests E2E en mode headless
- `npm run test:e2e:ui` : Lance les tests avec l'interface Playwright
- `npm run test:e2e:headed` : Lance les tests en mode visible

## Gestion des erreurs

Le workflow inclut :
- Timeouts appropriés pour le démarrage des services
- Cleanup automatique des processus
- Upload des artefacts en cas d'échec
- Gestion robuste des processus en arrière-plan