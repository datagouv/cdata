import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: useRuntimeConfig().public.sentry.dsn,
  release: useAppConfig().commitId,
  environment: useRuntimeConfig().public.apiBase.replace(/https?:\/\//, ''),
  tracesSampleRate: 0.1, // Adjust this value in production or use tracesSampler for finer control
  profilesSampleRate: 0.1, // Adjust this value in production
  integrations: [
    // Browsers (Chrome on iOS for its translation, extensions…) inject scripts that WebKit
    // attributes to the page URL, so their crashes show up as ours, one issue per route.
    // An error that never goes through a chunk marked with our `applicationKey` is not ours.
    Sentry.thirdPartyErrorFilterIntegration({
      filterKeys: ['cdata'],
      behaviour: 'drop-error-if-exclusively-contains-third-party-frames',
      ignoreSentryInternalFrames: true,
    }),
  ],
})
