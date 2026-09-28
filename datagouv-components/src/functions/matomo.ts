import { resolveMatomo } from '../config.js'

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

export function trackEvent(category: string, action: string, name?: string): void {
  resolveMatomo()?.trackEvent(category, action, name)
}

export function trackSiteSearch(keyword: string, category: string, resultsCount: number): void {
  resolveMatomo()?.trackSiteSearch(keyword, category, resultsCount)
}
