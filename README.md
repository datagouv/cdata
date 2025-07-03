# cdata

**cdata** is the frontend application for [data.gouv.fr](https://www.data.gouv.fr), France's open data platform.

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

Make sure to install datagouv-components and cdata dependencies:

There is two installations paths, one is working on some machine and one on another, we recommand to try both for the time being. But we would like to fix these problems.

```bash
npm install
cd ./datagouv-components
```

If this first option is not working on your local environment, try the second one (maybe delete and re-clone the repository to be sure)

```bash
cd ./datagouv-components
npm install

cd ..
npm install
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
- **Internationalization**: [@nuxtjs/i18n](https://i18n.nuxtjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Linting**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

### 🔧 Environment Variables

**Key variables:**
- `NUXT_PUBLIC_API_BASE`: Base URL for API calls
- `NUXT_PUBLIC_DEV_API_KEY`: API key for development environment  
- `NUXT_PUBLIC_COMMIT_ID`: Git commit ID (auto-generated in dev mode)
- `NUXT_PUBLIC_SENTRY_DSN`: Sentry DSN for error tracking
- `NUXT_TEMPLATE_CACHE_DURATION`: Duration for template caching
- `NUXT_PUBLIC_I18N_BASE_URL`: Base URL for internationalization

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

### Linting and Formatting
The project uses [ESLint](https://eslint.org/) for code linting and [Prettier](https://prettier.io/) for code formatting to maintain consistent code style. **Running these commands is required before submitting contributions.**

```bash
npm run lint          # Check for code style violations and potential issues
npm run lint:fix      # Automatically fix ESLint issues and format code with Prettier
```

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
