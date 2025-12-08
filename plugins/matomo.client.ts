import { getMatomo } from '@datagouv/components-next'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

declare global {
  interface Window {
    _paq?: Array<unknown[]>
  }
}

export default defineNuxtPlugin({
  async setup(nuxtApp) {
    const _paq = (window._paq = window._paq || [])
    if (!_paq) return {}

    let u = nuxtApp.$config.public.matomo.host
    const debug = nuxtApp.$config.public.matomo.debug
    const dryRun = nuxtApp.$config.public.matomo.dryRun
    if (!u) return {}

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
      if (matomo) {
        const router = useRouter()
        router.afterEach((to, from) => {
          trackPageView(to, from, debug, dryRun)
          matomo.enableLinkTracking(true)
        })
      }
      return {
        provide: {
          matomo: {
            trackPageView: (to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedGeneric) => trackPageView(to, from, debug, dryRun),
            trackEvent: (category: string, action: string, name?: string) => trackEvent(category, action, name, debug, dryRun),
          },
        },
      }
    }
    catch {
      return {}
    }
  },
})

function trackEvent(category: string, action: string, name?: string, debug = false, dryRun = false) {
  const matomo = getMatomo()
  if (!matomo) {
    if (debug) console.debug('[matomo] No matomo tracker found')
    return
  }
  if (debug) console.debug(`[matomo] tracking event ${category} ${action} ${name ? name : ''}`)
  if (dryRun) {
    return
  }
  matomo.trackEvent(category, action, name)
}

function trackPageView(to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedGeneric, debug: boolean, dryRun: boolean) {
  const matomo = getMatomo()
  if (!matomo) {
    if (debug) console.debug('[matomo] No matomo tracker found')
    return
  }
  if (to.meta.matomoIgnore) {
    if (debug) console.debug('[matomo] Ignoring ' + to.fullPath)
    return
  }
  if (debug) console.debug('[matomo] tracking page view to ' + to.fullPath)
  if (dryRun) {
    return
  }
  if (from.fullPath) {
    matomo.setReferrerUrl(from.fullPath)
  }
  matomo.trackPageView((to.meta.title as string | undefined) || to.fullPath)
}

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
