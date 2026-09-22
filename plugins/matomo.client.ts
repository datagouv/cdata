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
    // No setCustomUrl/setDocumentTitle: the tracker reads window.location and
    // document.title when the queued call is processed, and no setReferrerUrl:
    // a wrong or path-only referrer would be discarded by Matomo and the
    // visit reclassified as direct entry.
    proxy._paq.push(['trackPageView'])
  }

  // Registered during the plugin setup, before the initial page:finish, so the
  // landing page view is covered. useScriptEventPage only fires when a page
  // finished rendering and skips same-path/same-title re-renders (the app
  // re-replaces the route at hydration without changing the URL).
  let lastPath: string | undefined
  useScriptEventPage((payload) => {
    const route = router.currentRoute.value
    if (route.meta.matomoIgnore) {
      if (debug) console.debug('[matomo] Ignoring ' + payload.path)
      lastPath = payload.path
      return
    }
    // The title can change on a same-path render (e.g. search results): not a
    // new page view.
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
