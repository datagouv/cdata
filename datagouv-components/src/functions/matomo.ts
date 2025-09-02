export function trackEvent(values: Array<unknown>): void {
  // @ts-expect-error Matomo is not typed
  globalThis._paq?.push(['trackEvent', ...values])
}
