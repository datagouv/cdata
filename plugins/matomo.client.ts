import type { RouteLocationNormalizedGeneric } from 'vue-router'

export interface MatomoTracker {
  // https://developer.matomo.org/api-reference/tracking-javascript
  enableLinkTracking(bool: boolean): void
  setReferrerUrl(url: string): void
  trackPageView(title?: string): void
  trackEvent(category: string, action: string, name: string): void
  trackSiteSearch(keyword: string, category: string, resultsCount: number): void
  trackGoal(idGoal: number, revenue: number): void
  trackLink(url: string, linkType: string): void
  // More TODO
}

export default defineNuxtPlugin({
  async setup(nuxtApp) {
    const _paq = (window._paq = window._paq || [])
    let u = nuxtApp.$config.public.matomoHost
    const debug = nuxtApp.$config.public.matomoDebug
    const dryRun = nuxtApp.$config.public.matomoDryRun
    if (u) {
      u = u.endsWith('/') ? u : u + '/'
      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
      _paq.push(['setTrackerUrl', u + 'matomo.php'])
      _paq.push(['setSiteId', nuxtApp.$config.public.matomoSiteId])
      _paq.push(['enableLinkTracking'])
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
    }
    return {
      provide: {
        matomo: {
          trackPageView: (to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedGeneric) => trackPageView(to, from, debug, dryRun),
        },
      },
    }
  },
})

// inspired by https://github.com/AmazingDreams/vue-matomo/blob/master/src/index.js
function getMatomo() {
  return window?.Matomo?.getTracker() as MatomoTracker | undefined
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
