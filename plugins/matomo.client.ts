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

      // matomo.js tracks the initial page view itself when it loads, so hook
      // the router only once the initial navigation has completed: in-app
      // navigations are tracked exactly once, without a duplicate landing hit.
      const trackAfterEachNavigation = () => {
        useRouter().afterEach((to, from) => {
          trackPageView(to, from)
        })
      }
      if (nuxtApp.isHydrating) {
        nuxtApp.hook('app:mounted', trackAfterEachNavigation)
      }
      else {
        trackAfterEachNavigation()
      }

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
