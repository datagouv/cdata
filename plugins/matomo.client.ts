import { useScriptEventPage, useScriptMatomoAnalytics } from '#imports'

const noopMatomo = {
  trackPageView: () => {},
  trackEvent: () => {},
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const router = useRouter()
  const matomoUrl = config.public.matomo.host
  const debug = config.public.matomo.debug
  const dryRun = config.public.matomo.dryRun
  if (!matomoUrl) return { provide: { matomo: noopMatomo } }

  const { proxy } = useScriptMatomoAnalytics({
    matomoUrl,
    siteId: config.public.matomo.siteId,
    enableLinkTracking: true,
    // Page views are tracked by our own useScriptEventPage callback below:
    // the built-in watcher cannot skip routes flagged with matomoIgnore.
    watch: false,
  })

  const trackPageView = () => {
    if (debug) console.debug('[matomo] tracking page view to ' + router.currentRoute.value.fullPath)
    if (dryRun) return
    proxy._paq.push(['trackPageView'])
  }

  // Registered in the plugin setup, before the initial page:finish, so the
  // landing page view is covered. The callback fires when the path or the
  // title changes: the lastPath guard filters out title-only updates.
  let lastPath: string | undefined
  useScriptEventPage((payload) => {
    const route = router.currentRoute.value
    if (route.meta.matomoIgnore) {
      if (debug) console.debug('[matomo] Ignoring ' + payload.path)
      lastPath = payload.path
      return
    }
    if (payload.path === lastPath) return
    lastPath = payload.path
    trackPageView()
  })

  return {
    provide: {
      matomo: {
        trackPageView: () => trackPageView(),
        trackEvent: (category: string, action: string, name?: string) => {
          if (debug) console.debug(`[matomo] tracking event ${category} ${action} ${name ? name : ''}`)
          if (dryRun) return
          proxy._paq.push(['trackEvent', category, action, name])
        },
      },
    },
  }
})
