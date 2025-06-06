# cdata

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install datagouv-components and cdata dependencies:

There is two installations paths, one is working on some machine and one on another, we recommand to try both for the time being. But we would like to fix these problems.

```bash
npm install
cd ./datagouv-components
npm run i18n
```

If this first option is not working on your local environment, try the second one (maybe delete and re-clone the repository to be sure)

```bash
cd ./datagouv-components
npm install 
npm run i18n

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
