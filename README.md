![cdata](banner.png)

# cdata

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/datagouv/cdata/create-deploy-release.yml?branch=main)](https://github.com/datagouv/cdata/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**cdata** is the frontend application for [data.gouv.fr](https://www.data.gouv.fr), France's Open Data platform.

## Legal

cdata uses the Official french government's design system ([DSFR](https://github.com/GouvernementFR/dsfr)). Some of its content is only available for French public services.
If you aren't a French public service, you must not use :
- the marianne font, it isn't an open-source font
- the identity elements provided by the DSFR, colors, logos, etc.
You can find more details in the [DSFR README](https://github.com/GouvernementFR/dsfr/tree/main?tab=readme-ov-file#licence-et-droit-dutilisation).

These elements are removed from cdata when the global configuration `isFrenchGovernment` is `false`.

cdata includes its own set of private illustrations and images. They aren't available with the MIT license and shouldn't be used by other entities.
They are located in the `public` directory.

If you want to fork cdata, you must :
- set `isFrenchGovernment` in `nuxt.config.ts` to false
- replace the illustration and images used in your fork
- use a different color scheme of the one used by data.gouv.fr
- remove all reference to French public services 

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

You can check your versions with:
```bash
node --version
npm --version
```

## ⚙️ Setup

Make sure to install cdata dependencies:

```bash
npm ci
```

> **Note:** If you encounter issues, try deleting `node_modules` folders and `package-lock.json` files, then reinstall.

## 🚀 Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check for code style violations
npm run lint:fix     # Automatically fix ESLint issues and format code
```

## 🛠️ Technology Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DSFR](https://www.systeme-de-design.gouv.fr/)
- **State Management**: Vue 3 Composition API
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Linting**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

### 🔧 Environment Variables

**Key variables:**
- `NUXT_PUBLIC_API_BASE`: Base URL for API calls
- `NUXT_PUBLIC_DEV_API_KEY`: API key for development environment  
- `NUXT_PUBLIC_COMMIT_ID`: Git commit ID (auto-generated in dev mode)
- `NUXT_PUBLIC_SENTRY_DSN`: Sentry DSN for error tracking
- `NUXT_TEMPLATE_CACHE_DURATION`: Duration for template caching
- `NUXT_PUBLIC_BASE_URL`: Base URL

You can work on `cdata` without a local `udata` backend by pointing to https://demo.data.gouv.fr directly. Create a `.env` file at the root of the project:

```env
# API Configuration
NUXT_PUBLIC_API_BASE=https://demo.data.gouv.fr  # Or your dedicated development platform
NUXT_PUBLIC_DEV_API_KEY=your_api_key_from_dev

# Optional: Override default configuration
NUXT_PUBLIC_COMMIT_ID=your_commit_id
```

### 🔧 Troubleshooting

#### File Watcher Limits (`ENOSPC` errors)
If you encounter `ENOSPC` errors, increase the system limit of file watchers:

```bash
# Linux
sudo sysctl fs.inotify.max_user_watches=131070

# macOS
sudo sysctl -w kern.maxfiles=131070
sudo sysctl -w kern.maxfilesperproc=131070
```

#### Chokidar Issues (`EBADF` errors)
If you encounter `EBADF` errors, you may be affected by [this chokidar issue](https://github.com/paulmillr/chokidar/issues/1385). Try these solutions:

1. **Disable devtools** in `nuxt.config.ts`:
   ```ts
   devtools: { enabled: false }
   ```

2. **Add chokidar override** to `package.json`:
   ```json
   {
     "overrides": {
       "chokidar": "^3.6.0"
     }
   }
   ```

### Analytics

cdata uses Matomo to track page visits. It can be disable on a per-page basis with the meta `matomoIgnore`.

```ts
definePageMeta({
  matomoIgnore: true,
})
```

## 🏭 Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 🐳 Docker

You can also run the application using Docker:

```bash
# Build the Docker image
docker build -t cdata .

# Run the container
docker run -p 3000:3000 cdata
```

The application will be available at `http://localhost:3000`.

## 🤝 Contributing

### Development Guidelines
- Use TypeScript for all code
- Follow [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) patterns
- Use `<script setup>` syntax for components
- Follow [DSFR design system](https://www.systeme-de-design.gouv.fr/) guidelines
- Maintain [accessibility standards](https://www.w3.org/WAI/WCAG21/AA/) (WCAG 2.1 AA)
- Follow [linting and formatting](#linting-and-formatting) guidelines
- Write clear commit messages using [conventional commits](https://www.conventionalcommits.org/)

### 🧹 Code Linting and Formatting
The project uses [ESLint](https://eslint.org/) for code linting and formatting to maintain consistent code style. **Running these commands is required before submitting contributions.**

```bash
npm run lint          # Check for code style violations and potential issues
npm run lint:fix      # Automatically fix ESLint issues and format code
```

**Note:** Prettier is only used in the `datagouv-components` subdirectory. The main project relies on ESLint's built-in formatting capabilities.

> **TODO:** Consider adding Prettier to the main project for more consistent code formatting across the entire codebase.

#### Pre-commit Hooks

The project uses [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to run linting before each commit:

- **Automatic linting**: ESLint runs on all staged `.js`, `.ts`, `.vue`, `.jsx`, `.tsx` files
- **Auto-fix**: Fixable issues are automatically corrected
- **Commit blocking**: Unfixable errors prevent the commit until resolved

The pre-commit setup is configured in:
- `package.json`: lint-staged configuration
- `.husky/pre-commit`: Git hook script

## 🧪 Testing

The project includes some test data and test IDs for component testing, but formal testing framework setup is not yet implemented. When contributing, ensure your components work correctly and consider adding tests in the future.

## 📚 Additional Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs/getting-started/introduction)
- [Vue 3 Documentation](https://vuejs.org/)
- [DSFR Documentation](https://www.systeme-de-design.gouv.fr/)
- [data.gouv.fr API Documentation](https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/api/reference)
- [data.gouv.fr Guides](https://guides.data.gouv.fr/)

### 📦 Component Library
- [@datagouv/components Documentation](./datagouv-components/README.md) - Documentation for the shared component library used by this project. This library provides reusable Vue components, utilities, and configurations that are shared across multiple data.gouv.fr applications. It includes components for datasets, organizations, resources, and other common UI elements used throughout the platform.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [data.gouv.fr Guides](https://guides.data.gouv.fr/)
- **API Documentation**: [data.gouv.fr API Reference](https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/api/reference)
- **Community Forum**: [data.gouv.fr Forum](https://forum.data.gouv.fr/)
- **Support Portal**: [data.gouv.fr Support](https://support.data.gouv.fr/)

---

For more information about data.gouv.fr, visit [www.data.gouv.fr](https://www.data.gouv.fr).
