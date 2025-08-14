# @datagouv/components

In this document, "the user" is the application using `@datagouv/components` (for example: `cdata` or `udata-front-kit`). For general project setup and development, see the [main project README](../README.md).

## Usage

### Config

`@datagouv/components` provides a [Vue](https://vuejs.org/) plugin to load the configuration.

```ts
import { datagouv } from '@datagouv/components-next'

app.use(datagouv, {
    name: 'data.gouv.fr', // Name of the site in some texts
    baseUrl: 'https://www.data.gouv.fr', // Used for redirects
    apiBase: 'https://www.data.gouv.fr', // Used for API calls (could default to `baseUrl`?)
})
```

### Special functions and components (only for Nuxt)

Nuxt is a special environment (both server and browser) and requires some special functions and components to work.

```ts
import { TextClamp } from '#components'
import CdataLink from './components/CdataLink.vue'
import { datagouv, type UseFetchFunction } from '@datagouv/components-next'

const runtimeConfig = useRuntimeConfig()

app.vueApp.use(datagouv, {
    // These are the same as above…
    name: runtimeConfig.public.title,
    baseUrl: runtimeConfig.public.i18n.baseUrl,
    apiBase: runtimeConfig.public.apiBase,
    devApiKey: runtimeConfig.public.devApiKey,

    // ----------------------------------------
    // --- Special functions and components ---

    // Tell `@datagouv/components` to use `useFetch` from Nuxt instead of custom built-in.
    customUseFetch: useFetch as UseFetchFunction, 

    // Nuxt doesn't like `TextClamp` in the server, provides the client only `TextClamp`
    textClamp: TextClamp,

    // Provide the component to create links inside the application
    // This component will receive the raw link (without i18n prefix)
    // and needs to add it.
    appLink: CdataLink,
})
```

### CSS

`@datagouv/components` is using [TailwindCSS](https://tailwindcss.com/docs) and some [DSFR](https://www.systeme-de-design.gouv.fr/) right now. The user needs to provide the correct version of the DSFR. Concerning TailwindCSS, there are two modes:

1. If the user is using TailwindCSS, it can import a full TailwindCSS config with `@import "@datagouv/components-next/assets/main.css";`, then build the CSS via TailwindCSS CLI or Vite plugin.
2. If the user is not using TailwindCSS, it can import an already built CSS file with `@import '@datagouv/components-next/dist/components.css';`. Note @dev, this file should be built before publishing the package to NPM with `npm run css`. For more details on the [technology stack](../README.md#-technology-stack), see the main README.

### I18n

`@datagouv/components` is using [`vue-i18n`](https://vue-i18n.intlify.dev/) to provide internationalisation. As always, there are two modes:

1. If the user is using Nuxt, it can simply add the locales files in the `nuxt.config.ts`

```ts
{
    code: 'fr',
    language: 'fr',
    files: ['fr-FR.json', '../../node_modules/@datagouv/components-next/src/locales/fr.json'],
},
```

Nuxt is responsible for building the JSON file to the correct `vue-i18n` JS format.

2. If the user is not using Nuxt, it should provide the i18n object to the `datagouv` Vue plugin. The plugin will then merge the already built messages's files.

### `Suspense`

To work with [Nuxt](https://nuxt.com/), some components are doing HTTP requests during the `setup` function (Nuxt can then do SSR for these requests: doing these requests server-side). These components need to be wrapped in a [`<Suspense>`](https://vuejs.org/guide/built-ins/suspense) wrapper (you can even provide a `#fallback`). You can either wrap individual components inside `<Suspense>` or wrap your entire application/layout in `<Suspense>`

```html
<Suspense>
    <DatasetInformationPanel v-if="dataset" :dataset="dataset" />
</Suspense>
```

## Development

For general development guidelines and contributing, see the [contributing section](../README.md#-contributing) in the main README.

### Code Linting and Formatting

This component library uses both ESLint and Prettier for code quality and formatting:

```bash
npm run lint    # Lint and auto-fix ESLint issues
npm run format  # Format code with Prettier
```

**Note:** Make sure to run both commands before submitting contributions to ensure consistent code style.

### Config

You can use the config with the composable `useComponentsConfig()`.

```ts
import { useComponentsConfig } from '../main'

const config = useComponentsConfig()
```

### Special functions and components (only for Nuxt)

> [!WARNING]  
> In `@datagouv/components` there are a few functions and components we cannot use directly:
> - `TextClamp` component
> - `useFetch` Nuxt function 

To use these, you need to get them from the config or via special wrappers.

#### `useFetch`

```ts
import { useFetch } from '../functions/api'

const { data: allLicenses } = await useFetch<Array<License>>('/api/1/datasets/licenses/')
```

This wrapper will use the provided `useFetch` function from Nuxt or a custom built-in replacement (should work in most of the case but is a really simplify version of the Nuxt one).

#### `TextClamp`

Use the component from the config (could add a wrapper in the future to simplify this).

```ts
import { useComponentsConfig } from '../main'

const config = useComponentsConfig()
```

```html
<component
    :is="config.textClamp"
    v-if="config && config.textClamp"
    class="fr-mx-1v"
    :auto-resize="true"
    :text="organization.name"
    :max-lines="1"
/>
```

> [!NOTE]  
> Nuxt doesn't even allow to load the `vue3-text-clamp` library in the server so we need to use dynamic import in the plugin config to be sure it's only loaded on non-Nuxt environment.

#### Links

To do links in the application you can use the `<AppLink>` component. Not sure why it's required. Maybe we could always use a `<RouterLink>` from [`vue-router`](https://router.vuejs.org/) since every user is using `vue-router`? I think it's useful to add lang prefix to links but it's not done yet? Need testing.

Maybe this component shouldn't be exposed too, because I don't know why a user should use this instead of their own component (`<RouterLink>` or `<CdataLink>`…)

## 📄 License

This component library is licensed under the **MIT License**, which is the same as the main project. This allows for permissive usage of the components in other projects.

For more details, see the [LICENSE](../LICENSE) file in the main project directory.
