# cdata

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

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

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

### Working without `udata` backend

You can work on `cdata` without a local `udata` backend by pointing to https://demo.data.gouv.fr directly. To do this, create a `.env` file at the root of the project:

```
NUXT_PUBLIC_API_BASE=https://demo.data.gouv.fr  # Or your dedicated development platform
NUXT_PUBLIC_DEV_API_KEY=your_api_key_from_dev
```

### Troubleshooting

If you encounter `ENOSPC` errors, you may want to increase the system limit of file watchers :

```bash
# linux 
sudo sysctl fs.inotify.max_user_watches=131070

# macos
sudo sysctl -w kern.maxfiles=131070
sudo sysctl -w kern.maxfilesperproc=131070
```

If you encounter `EBADF` errors, you are probably affected by [this chokidar issue](https://github.com/paulmillr/chokidar/issues/1385).
You can try to :
1. disable devtools
2. add `overrides` to the package.json and lock `"chokidar": "^3.6.0"`

## 🧹 Code Linting and Formatting

This project uses ESLint for code linting and formatting. You can run these tools manually or they will run automatically before each commit.

### Manual Linting and Formatting

```bash
# Check for issues
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Pre-commit Hooks

The project uses [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to run linting before each commit:

- **Automatic linting**: ESLint runs on all staged `.js`, `.ts`, `.vue`, `.jsx`, `.tsx` files
- **Auto-fix**: Fixable issues are automatically corrected
- **Commit blocking**: Unfixable errors prevent the commit until resolved

### Configuration

The pre-commit setup is configured in:
- `package.json`: lint-staged configuration
- `.husky/pre-commit`: Git hook script

## 🤝 Contributing

Before contributing, please ensure your code follows our quality standards. See the [Linting and Formatting](#-linting-and-formatting) section above for details on running ESLint and the pre-commit hooks.

## Production

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
