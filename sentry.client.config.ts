import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: useRuntimeConfig().public.sentry.dsn,
  release: useAppConfig().commitId,
  environment: useRuntimeConfig().public.apiBase.replace(/https?:\/\//, ''),
  tracesSampleRate: 0.1, // Adjust this value in production or use tracesSampler for finer control
  profilesSampleRate: 0.1, // Adjust this value in production
})
