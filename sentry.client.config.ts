import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: useRuntimeConfig().public.sentry.dsn,
  environment: useRuntimeConfig().public.apiBase.replace(/https?:\/\//, ''),

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 0.1,
})
