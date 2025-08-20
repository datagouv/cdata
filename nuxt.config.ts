import tailwindcss from '@tailwindcss/vite'
import toml from './rollup-plugin-smol-toml'

const nbSitemapsDatasets = 10
// const swrDuration = process.env.NUXT_TEMPLATE_CACHE_DURATION ? parseInt(process.env.NUXT_TEMPLATE_CACHE_DURATION) : 60
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@sentry/nuxt/module',
    '@nuxtjs/sitemap',
  ],
  devtools: { enabled: false, componentInspector: false },

  app: {
    head: {
      bodyAttrs: {
        class: 'datagouv-components',
      },
      link: [
        // Cannot use `/public/favicon.png` because the reverse proxy is calling udata-front for `/`
        // When the migration is over we can remove this static path.
        // :AfterMigration
        { rel: 'shortcut icon', href: 'https://static.data.gouv.fr/_themes/gouvfr/img/favicon.png' },
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
  },

  runtimeConfig: {
    crispIdentifier: '',
    crispKey: '',
    crispWebsiteId: '',
    pagesGhRepoName: 'datagouv/datagouvfr-pages',
    pagesGhRepoBranch: 'master',
    public: {
      i18n: {
        baseUrl: 'https://www.data.gouv.fr/', // NUXT_PUBLIC_I18N_BASE_URL
      },

      commitId: undefined,
      banner: undefined,

      title: 'data.gouv.fr',
      apiBase: 'http://dev.local:7000',
      frontBase: 'http://dev.local:3000',
      metricsApi: 'https://metric-api.data.gouv.fr',
      devApiKey: undefined,
      staticUrl: 'https://static.data.gouv.fr/static/',
      maxJsonPreviewCharSize: 1000000, // (~1MB)
      maxPdfPreviewByteSize: 10000000, // (10 MB)
      maxXmlPreviewCharSize: 100000, // (~100KB)
      schemaValidataUrl: 'https://validata.fr',
      tabularApiUrl: 'https://tabular-api.data.gouv.fr',
      tabularApiDataserviceId: undefined,

      qualityDescriptionLength: 100,
      searchAutocompleteDebounce: 200,
      searchSirenUrl: 'https://recherche-entreprises.api.gouv.fr/search',
      csvDatasetId: undefined,

      // Without www/demo/dev
      baseDomain: 'data.gouv.fr',

      demoServer: {
        url: 'https://demo.data.gouv.fr',
        name: 'demo.data.gouv.fr',
      },
      schemaPublishingUrl: 'https://publier.etalab.studio/fr',
      schemasSite: {
        url: 'https://schema.data.gouv.fr/',
        name: 'schema.data.gouv.fr',
      },
      apiDocExternalLink: 'https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/api/reference',
      guidesUrl: 'https://guides.data.gouv.fr/',
      guidesCreateAccount: 'https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/creer-un-compte-utilisateur-et-rejoindre-une-organisation',
      guidesHarvestingUrl: 'https://guides.data.gouv.fr/guide-data.gouv.fr/moissonnage',
      guidesCommunityResources: 'https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/ressource-communautaire',
      supportUrl: 'https://support.data.gouv.fr/',
      catalogUrl: 'https://guides.data.gouv.fr/autres-ressources-utiles/catalogage-de-donnees-grist',

      homepagePublishDatasetOnboarding: '/pages/onboarding/producteurs',
      homepagePublishReuseOnboarding: '/pages/onboarding/reutilisateurs',
      homepageAboutUs: '/pages/about/a-propos_data-gouv',
      homepageExplore: 'https://explore.data.gouv.fr',
      homepageRightNow: {
        title: 'Données relatives aux Énergies',
        url: '/pages/donnees-energie',
      },

      proconnect: {
        homepage: 'https://agentconnect.gouv.fr/',
      },

      datasetPublishingGuideUrl: 'https://guides.data.gouv.fr/publier-des-donnees/guide-qualite/ameliorer-la-qualite-dun-jeu-de-donnees-en-continu/ameliorer-le-score-de-qualite-des-metadonnees',
      datasetQualityGuideUrl: 'https://guides.data.gouv.fr/guides-open-data/guide-qualite/ameliorer-la-qualite-dun-jeu-de-donnees-en-continu/ameliorer-le-score-de-qualite-des-metadonnees',
      dataSearchFeedbackFormUrl: 'https://tally.so/r/mDKv1N',
      forumUrl: 'https://forum.data.gouv.fr/',
      feedbackFormUrl: 'https://tally.so/r/mOld5R',
      betaAdminFeedbackUrl: 'https://tally.so/r/nP25OB',
      publishingDatasetFeedbackUrl: 'https://tally.so/r/nGo0yO',
      publishingDataserviceFeedbackUrl: 'https://tally.so/r/w2J7lL',
      publishingReuseFeedbackUrl: 'https://tally.so/r/mV98y6',
      publishingHarvesterFeedbackUrl: 'https://tally.so/r/3NMLOQ',
      reuseGuideUrl: 'https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/reutilisations',
      harvesterRequestValidationUrl: 'https://support.data.gouv.fr/help/datagouv/moissonnage#support-tree',
      harvesterPreviewMaxItems: 20, // SHould be the same as `HARVEST_PREVIEW_MAX_ITEMS` in udata
      harvestEnableManualRun: false,
      harvestBackendsForHidingQuality: ['CSW-ISO-19139'],

      newsletterSubscriptionUrl: 'https://qvo970cr.sibpages.com/',

      maxNumberOfResourcesToUploadInParallel: 3,
      resourceFileUploadChunk: 2 * 1000 * 1000,
      maxSortableFiles: 50,

      captcheta: {
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

      enableCdataSecurityViews: false,
      requireEmailConfirmation: true,
      changeEmailPage: 'change-email',
      changePasswordPage: 'change',

      readOnlyMode: false,

      allowDiscussionsInPosts: false,

      sentry: {
        dsn: '',
      },

      // URL of your matomo host.
      matomoHost: undefined,

      // Matomo ID of your site. Check the Matomo backend for it
      matomoSiteId: 1,
    },
  },

  routeRules: {
    '/*/organizations/': { ssr: true },
    '/*/posts/': { ssr: true },
    '/*/posts/**': { ssr: true },
    // Admin dashboard renders only on server-side
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
    css: {
      preprocessorOptions: {
        scss: {
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
  i18n: {
    baseUrl: '',
    locales: [
      {
        code: 'fr',
        language: 'fr',
      },
      {
        code: 'en',
        language: 'en',
      },
      {
        code: 'es',
        language: 'es',
      },
    ],
    lazy: true,
    detectBrowserLanguage: false,
    strategy: 'no_prefix',
    trailingSlash: true,
    defaultLocale: 'fr',
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
        includeGlobalSources: true,
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
