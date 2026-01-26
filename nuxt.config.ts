import tailwindcss from '@tailwindcss/vite'
import toml from './rollup-plugin-smol-toml'

const nbSitemapsDatasets = 10
// const swrDuration = process.env.NUXT_TEMPLATE_CACHE_DURATION ? parseInt(process.env.NUXT_TEMPLATE_CACHE_DURATION) : 60
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@sentry/nuxt/module',
    '@nuxtjs/sitemap',
  ],
  devtools: { enabled: false, componentInspector: false },

  app: {
    head: {
      bodyAttrs: {
        class: 'datagouv-components font-marianne',
      },
      link: [
        { rel: 'shortcut icon', href: '/nuxt_images/favicon.svg', type: 'image/svg+xml' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],

  vue: {
    runtimeCompiler: true,
  },

  site: {
    url: 'https://www.data.gouv.fr',
    name: 'data.gouv.fr',
    trailingSlash: false,
  },

  appConfig: {
    isFrenchGovernment: true,
    commitId: process.env.NUXT_APP_COMMIT_ID || 'unknown',
  },

  runtimeConfig: {
    crispIdentifier: '',
    crispKey: '',
    crispWebsiteId: '',
    pagesGhRepoName: 'datagouv/datagouvfr-pages',
    pagesGhRepoBranch: 'master',
    albertApiBaseUrl: 'https://albert.api.etalab.gouv.fr/',
    albertApiKey: '',
    public: {
      baseUrl: 'https://www.data.gouv.fr/',
      banner: undefined,

      title: 'data.gouv.fr',
      description: 'Plateforme ouverte des données publiques françaises : téléchargez, partagez et réutilisez les données ouvertes de l\'État et des collectivités',
      apiBase: 'http://dev.local:7000',
      frontBase: 'http://dev.local:3000',
      metricsApi: 'https://metric-api.data.gouv.fr',
      metricsSince: '2022-07-01',
      devApiKey: undefined,
      staticUrl: 'https://static.data.gouv.fr/static/',
      maxJsonPreviewCharSize: 1000000, // (~1MB)
      maxPdfPreviewByteSize: 10000000, // (10 MB)
      maxXmlPreviewCharSize: 100000, // (~100KB)
      schemaValidataUrl: 'https://validata.fr',
      tabularApiUrl: 'https://tabular-api.data.gouv.fr',
      tabularApiDataserviceId: undefined,

      qualityDescriptionLength: 100,
      searchDebounce: 300,
      searchSirenUrl: 'https://recherche-entreprises.api.gouv.fr/search',
      csvDatasetId: undefined,

      // Without www/demo/dev
      baseDomain: 'data.gouv.fr',

      demoServer: {
        url: 'https://demo.data.gouv.fr',
        name: 'demo.data.gouv.fr',
      },
      schemaPublishingUrl: 'https://publier.etalab.studio/fr',
      enableStructuredDatasetForm: true,
      schemasSite: {
        url: 'https://schema.data.gouv.fr/',
        name: 'schema.data.gouv.fr',
      },
      apiDocExternalLink: 'https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/api/reference',
      guidesUrl: 'https://guides.data.gouv.fr/',
      guidesCreateAccount: 'https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/creer-un-compte-utilisateur-et-rejoindre-une-organisation',
      guidesHarvestingUrl: 'https://guides.data.gouv.fr/guide-data.gouv.fr/moissonnage',
      guidesLabelsUrl: undefined, // TODO: add guide when created
      guidesCommunityResources: 'https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/ressource-communautaire',
      supportUrl: 'https://support.data.gouv.fr/',
      catalogUrl: 'https://guides.data.gouv.fr/autres-ressources-utiles/catalogage-de-donnees-grist',

      guideDatasets: 'https://guides.data.gouv.fr/guide-data.gouv.fr/jeux-de-donnees',
      guideReuses: 'https://guides.data.gouv.fr/guide-data.gouv.fr/reutilisations',
      guideDataservices: 'https://guides.data.gouv.fr/guide-data.gouv.fr/api',
      reusesOnboardingUsecases: 'https://www.data.gouv.fr/pages/onboarding/liste_cas_usage/',
      dataservicesOnboarding: 'https://guides.data.gouv.fr/guide-data.gouv.fr/api/outils-pour-les-administrations',

      homepagePublishDatasetOnboarding: '/producteurs',
      homepagePublishReuseOnboarding: '/reutilisateurs',
      homepageAboutUs: '/a-propos',
      homepageExplore: 'https://explore.data.gouv.fr',
      homepageRightNow: {
        title: 'Données relatives aux Énergies',
        url: '/pages/donnees-energie',
      },
      homepageHeroImages: [
        'hero_1.png', 'hero_2.png', 'hero_3.png', 'hero_4.png', 'hero_5.png',
        'hero_6.png', 'hero_7.png', 'hero_8.png', 'hero_9.png', 'hero_10.png',
        'hero_11.png', 'hero_12.png', 'hero_13.png', 'hero_14.png', 'hero_15.png',
      ],

      proconnect: {
        homepage: 'https://agentconnect.gouv.fr/',
      },

      datasetPublishingGuideUrl: 'https://guides.data.gouv.fr/publier-des-donnees/guide-qualite/ameliorer-la-qualite-dun-jeu-de-donnees-en-continu/ameliorer-le-score-de-qualite-des-metadonnees',
      datasetQualityGuideUrl: 'https://guides.data.gouv.fr/guides-open-data/guide-qualite/ameliorer-la-qualite-dun-jeu-de-donnees-en-continu/ameliorer-le-score-de-qualite-des-metadonnees',
      datasetRestrictedGuideUrl: 'https://guides.data.gouv.fr/guides-open-data/guide-juridique/producteurs-de-donnees/quelles-sont-les-obligations',
      dataSearchFeedbackFormUrl: 'https://tally.so/r/mDKv1N',
      forumUrl: 'https://forum.data.gouv.fr/',
      generateShortDescriptionFeedbackUrl: 'https://tally.so/r/wbbRxo',
      generateTagsFeedbackUrl: 'https://tally.so/r/w80JNP',
      publishingDatasetFeedbackUrl: 'https://tally.so/r/nGo0yO',
      publishingDataserviceFeedbackUrl: 'https://tally.so/r/w2J7lL',
      publishingReuseFeedbackUrl: 'https://tally.so/r/mV98y6',
      publishingHarvesterFeedbackUrl: 'https://tally.so/r/3NMLOQ',
      reuseGuideUrl: 'https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/reutilisations',
      harvesterRequestValidationUrl: 'https://support.data.gouv.fr/help/datagouv/moissonnage#support-tree',
      harvesterPreviewMaxItems: 20, // Should be the same as `HARVEST_PREVIEW_MAX_ITEMS` in udata
      harvestEnableManualRun: false,
      harvestBackendsForHidingQuality: ['CSW-ISO-19139'],

      newsletterSubscriptionUrl: 'https://qvo970cr.sibpages.com/',

      maxNumberOfResourcesToUploadInParallel: 3,
      resourceFileUploadChunk: 2 * 1000 * 1000,
      maxSortableFiles: 50,

      maxNumberOfDatasetsForDataserviceUpdate: 200,

      captcheta: {
        enabled: true,
        style: 'captchaFR',
      },

      licenses: {
        'Autorités administratives': [
          { value: 'lov2', recommended: true, code: 'etalab-2.0' },
          { value: 'odc-odbl', description: 'License avec obligation de partage à l’identique', code: 'ODbL-1.0' },
          { value: 'notspecified', description: 'Le Code des relations entre le public et l’administration s’applique' },
        ],
        'Tous producteurs': [
          { value: 'lov2', recommended: true },
          { value: 'cc-by', code: 'CC-BY' },
          { value: 'cc-by-sa', code: 'CC-BY-SA' },
          { value: 'cc-zero', code: 'CC0-1.0' },
          { value: 'fr-lo', code: 'etalab-2.0' },
          { value: 'odc-by', code: 'ODC-By-1.0' },
          { value: 'odc-odbl', code: 'ODbL-1.0' },
          { value: 'odc-pddl', code: 'PDDL-1.0' },
          { value: 'other-at' },
          { value: 'other-open' },
          { value: 'other-pd' },
          { value: 'notspecified' },
        ],
      },

      // A corresponding SVG at `datagouv-components/assets/labels` will be shown before the badge label
      datasetBadges: ['spd', 'inspire', 'hvd', 'sl', 'sr'],

      enableCdataSecurityViews: false,
      requireEmailConfirmation: true,
      changeEmailPage: 'change-email',
      changePasswordPage: 'change',

      readOnlyMode: false,

      allowDiscussionsInPosts: false,

      sentry: {
        dsn: '',
      },

      matomo: {
        // URL of your matomo host.
        host: undefined,
        // Matomo ID of your site. Check the Matomo backend for it
        siteId: 1,
        debug: false,
        dryRun: false,
      },
    },
  },

  routeRules: {
    '/nuxt-api/oembed': { cors: true },
    // @ts-expect-error ssr option is valid but not in Nuxt types (see https://github.com/nuxt/nuxt/issues/15199)
    '/*/organizations/': { ssr: true },
    // @ts-expect-error ssr option is valid but not in Nuxt types
    '/*/posts/': { ssr: true },
    // @ts-expect-error ssr option is valid but not in Nuxt types
    '/*/posts/**': { ssr: true },
    // Admin dashboard renders only on server-side
    // @ts-expect-error ssr option is valid but not in Nuxt types
    '/*/admin/**': { ssr: true },
  },

  sourcemap: { client: 'hidden' },

  devServer: {
    port: 3000,
    host: 'dev.local',
  },

  features: {
    inlineStyles: false,
  },
  compatibilityDate: '2024-04-03',

  nitro: {
    compressPublicAssets: true,
  },

  vite: {
    assetsInclude: ['**/*.md'],
    resolve: {
      dedupe: ['vue', 'vue-router'],
    },
    optimizeDeps: {
      // Some `@datagouv/components-next` dependencies aren't scanned by Vite dev server.
      // It must optimized them to be able to handle commonjs dependencies.
      // See https://vite.dev/guide/dep-pre-bundling.html#customizing-the-behavior
      include: [
        'debug',
        'extend',
        'highlight.js',
        'rehype-highlight',
        'swagger-ui-dist',
        'unist-util-find',
        'unist-util-find-all-between',
        'vue',
        'vue-router',
        'maplibre-gl',
        'geopf-extensions-openlayers',
        'vue3-xml-viewer',
      ],
      // `@datagouv/components-next` shouldn't be optimize otherwise its vue instance is not the same
      // as the one used in udata-front-kit. This cause errors with the `provide` / `inject` functions
      // used for the components configuration.
      exclude: ['@datagouv/components-next'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          // @ts-expect-error api option is valid for sass-embedded but not in Vite types
          api: 'modern-compiler',
        },
      },
    },
    plugins: [toml(), tailwindcss()],
    server: {
      allowedHosts: ['dev.local'],
    },
  },

  typescript: {
    typeCheck: false,
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  image: {
    screens: {
      xs: 320,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1248,
    },
  },

  sentry: {
    sourceMapsUploadOptions: {
      // disable sourcemaps upload from build, it's done later during the release with sentry-cli
      enabled: false,
    },
  },

  sitemap: {
    cacheMaxAgeSeconds: 3600, // 1 hour
    sitemaps: {
      content: {
        includeAppSources: true,
        exclude: ['/admin/**'],
      },
      dataservices: {
        sources: [
          '/nuxt-api/sitemaps/urls?type=dataservice',
        ],
      },
      organizations: {
        sources: [
          '/nuxt-api/sitemaps/urls?type=organization',
        ],
      },
      posts: {
        sources: [
          '/nuxt-api/sitemaps/urls?type=post',
        ],
      },
      reuses: {
        sources: [
          '/nuxt-api/sitemaps/urls?type=reuse',
        ],
      },
      // split datasets between nbSitemapsDatasets sections
      ...Array.from({ length: nbSitemapsDatasets }, (_, i) => i + 1).map(section => ({
        [`datasets_${section}`]: {
          sources: [
            `/nuxt-api/sitemaps/urls?type=dataset&section=${section}&nbSitemapSections=${nbSitemapsDatasets}`,
          ],
        },
      })).reduce((acc, obj) => ({ ...acc, ...obj }), {}),
      pages: {
        sources: [
          '/nuxt-api/sitemaps/pages',
        ],
      },
      // TODO: add support
    },
  },
  // TODO: add sentry config for stack traces based on source maps
  // https://docs.sentry.io/platforms/javascript/guides/nuxt/#add-readable-stack-traces-to-errors
})
