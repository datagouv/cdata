import { getMatomo } from '@datagouv/components-next'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

declare global {
  interface Window {
    _paq?: Array<unknown[]>
  }
}

const noopMatomo = {
  trackPageView: () => {},
  trackEvent: () => {},
}

export default defineNuxtPlugin({
  async setup(nuxtApp) {
    const _paq = (window._paq = window._paq || [])

    let u = nuxtApp.$config.public.matomo.host
    const debug = nuxtApp.$config.public.matomo.debug
    const dryRun = nuxtApp.$config.public.matomo.dryRun
    if (!u) return { provide: { matomo: noopMatomo } }

    u = u.endsWith('/') ? u : u + '/'
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['setTrackerUrl', u + 'matomo.php'])
    _paq.push(['setSiteId', nuxtApp.$config.public.matomo.siteId])
    // matomo.js sends the landing page view when it loads, with the genuine
    // landing referrer (a path-only referrer set later would be discarded by
    // Matomo as invalid and the visit reclassified as direct entry).
    _paq.push(['trackPageView'])
    _paq.push(['enableLinkTracking'])

    try {
      // loadScript could crash on AdBloc.
      await loadScript(u + 'matomo.js')
      const matomo = getMatomo()
      if (debug) {
        console.log(matomo)
      }
      if (!matomo) {
        return { provide: { matomo: noopMatomo } }
      }

      const trackEvent = (category: string, action: string, name?: string) => {
        if (debug) console.debug(`[matomo] tracking event ${category} ${action} ${name ? name : ''}`)
        if (dryRun) return
        matomo.trackEvent(category, action, name)
      }

      const trackPageView = (to: RouteLocationNormalizedGeneric, from?: RouteLocationNormalizedGeneric) => {
        if (to.meta.matomoIgnore) {
          if (debug) console.debug('[matomo] Ignoring ' + to.fullPath)
          return
        }
        if (debug) console.debug('[matomo] tracking page view to ' + to.fullPath)
        if (dryRun) return
        if (from?.fullPath) {
          // Send the full previous page URL: the tracker keeps the landing
          // referrer forever otherwise, and a path-only value would be
          // discarded by Matomo as an invalid referrer URL.
          matomo.setReferrerUrl(window.location.origin + from.fullPath)
        }
        matomo.trackPageView((to.meta.title as string | undefined) || to.fullPath)
        matomo.enableLinkTracking(true)
      }

      matomo.enableLinkTracking(true)

      // The landing hit is sent by matomo.js from the _paq queue, so skip the
      // initial navigation here: in-app navigations are tracked exactly once,
      // without a duplicate landing hit nor a setReferrerUrl clobbering the
      // genuine landing referrer with an internal URL (which Matomo discards,
      // reclassifying the visit as direct entry). The initial navigation is
      // detected structurally: its `from` is START_LOCATION, the only location
      // with no matched routes. Identity comparison with the START_LOCATION
      // export is unreliable (Nuxt can use a different vue-router instance
      // than the plugin's import), and the router.isReady() promise can
      // resolve before the initial navigation's afterEach hooks run.
      useRouter().afterEach((to, from) => {
        if (from.matched.length === 0) return
        trackPageView(to, from)
      })

      return {
        provide: {
          matomo: {
            trackPageView: (to: RouteLocationNormalizedGeneric) => trackPageView(to),
            trackEvent,
          },
        },
      }
    }
    catch {
      return { provide: { matomo: noopMatomo } }
    }
  },
})

// from https://github.com/AmazingDreams/vue-matomo/blob/master/src/utils.js#L5
function loadScript(trackerScript: string, crossOrigin = undefined) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = trackerScript

    if (crossOrigin && ['anonymous', 'use-credentials'].includes(crossOrigin)) {
      script.crossOrigin = crossOrigin
    }

    const head = document.head || document.getElementsByTagName('head')[0]
    head.appendChild(script)

    script.onload = resolve
    script.onerror = reject
  })
}
