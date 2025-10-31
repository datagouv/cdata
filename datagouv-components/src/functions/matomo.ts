export type MatomoTracker = {
  // https://developer.matomo.org/api-reference/tracking-javascript
  enableLinkTracking(bool: boolean): void
  setReferrerUrl(url: string): void
  trackPageView(title?: string): void
  trackEvent(category: string, action: string, name?: string): void
  trackSiteSearch(keyword: string, category: string, resultsCount: number): void
  trackLink(url: string, linkType: string): void
  // More TODO
}

// inspired by https://github.com/AmazingDreams/vue-matomo/blob/master/src/index.js
export function getMatomo() {
  // @ts-expect-error Matomo might be defined by project
  return window?.Matomo?.getTracker() as MatomoTracker | undefined
}

export function trackEvent(category: string, action: string, name?: string): void {
  const matomo = getMatomo()
  if (matomo) {
    matomo.trackEvent(category, action, name)
  }
}
