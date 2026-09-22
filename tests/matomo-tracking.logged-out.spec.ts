import { test, expect } from './base'
import type { Page } from '@playwright/test'

type MatomoCall = [method: string, ...args: unknown[]]

declare global {
  interface Window {
    __matomoCalls: MatomoCall[]
    __navigations: Array<[method: string, url: string]>
    Matomo: {
      getTracker: () => {
        setReferrerUrl: (url: string) => void
        trackPageView: (title: string) => void
        trackEvent: (category: string, action: string, name?: string) => void
        enableLinkTracking: () => void
      }
    }
  }
}

// The matomo tracker script is replaced by a mock recording every tracker call,
// so the test can assert exactly what plugins/matomo.client.ts sends:
// - the landing page view is queued for matomo.js (_paq), which sends it on
//   load with the genuine landing referrer — the plugin must not also track it
// - in-app navigations are tracked once, with the full previous page URL as
//   referrer (a path-only referrer is discarded by Matomo as invalid, which
//   used to reclassify every session as direct entry)
// Requires NUXT_PUBLIC_MATOMO_HOST to be set on the webServer (see playwright.config.ts)
// so the matomo plugin actually loads instead of the no-op fallback.
const mockMatomo = () => {
  window.__matomoCalls = []
  // Record every history navigation so CI failures show exactly which
  // navigations the router committed (the initial one is not a history op).
  window.__navigations = []
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = history[method].bind(history)
    history[method] = (state: unknown, unused: string, url?: string | URL | null) => {
      window.__navigations.push([method, String(url ?? location.pathname + location.search)])
      return original(state, unused, url)
    }
  }
  window.Matomo = {
    getTracker: () => ({
      setReferrerUrl: url => window.__matomoCalls.push(['setReferrerUrl', url]),
      trackPageView: title => window.__matomoCalls.push(['trackPageView', title]),
      trackEvent: (category, action, name) => window.__matomoCalls.push(['trackEvent', category, action, name]),
      enableLinkTracking: () => window.__matomoCalls.push(['enableLinkTracking']),
    }),
  }
}

const matomoCalls = (page: Page) => page.evaluate(() => window.__matomoCalls)
const navigations = (page: Page) => page.evaluate(() => window.__navigations ?? [])

// The plugin pushes its single initial enableLinkTracking once it has loaded
// matomo.js: waiting for it guarantees the router hook is registered before
// any navigation is triggered.
const waitForTracker = (page: Page) =>
  expect
    .poll(async () => (await matomoCalls(page)).length, {
      timeout: 15_000,
      message: 'Matomo plugin did not load. Is NUXT_PUBLIC_MATOMO_HOST set on the server under test? '
        + 'Playwright only applies webServer.env when it boots the server itself; '
        + 'a pre-started server (CI workflow, manual preview) needs the variable in its own environment.',
    })
    .toBeGreaterThan(0)

test.describe('Matomo tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(mockMatomo)
    await page.route('**/matomo.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: '/* mocked by tests/matomo-tracking.logged-out.spec.ts */',
    }))
  })

  test('queues the landing page view for matomo.js, without tracking it through the plugin', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await waitForTracker(page)

    // The landing hit goes through the _paq queue so the real matomo.js sends
    // it on load. The mock does not process the queue, so the plugin must not
    // call the tracker API for it either, or the landing page would be tracked
    // twice (and bounces would vanish if the queue push were missing).
    const queuedCalls = await page.evaluate(() => (window as unknown as { _paq: unknown[][] })._paq ?? [])
    expect(queuedCalls).toContainEqual(['trackPageView'])

    const calls = await matomoCalls(page)
    const navs = await navigations(page)
    expect(calls.filter(([method]) => method === 'trackPageView'), `history navigations: ${JSON.stringify(navs)}`).toHaveLength(0)
    expect(calls.filter(([method]) => method === 'setReferrerUrl'), `history navigations: ${JSON.stringify(navs)}`).toHaveLength(0)
  })

  test('tracks each in-app navigation once, with the full previous page URL as referrer', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await waitForTracker(page)

    await page.getByRole('link', { name: 'Données' }).first().click()
    await expect(page).toHaveURL('/datasets')

    let calls = await matomoCalls(page)
    const pageViews = calls.filter(([method]) => method === 'trackPageView')
    expect(pageViews, `history navigations: ${JSON.stringify(await navigations(page))}`).toHaveLength(1)
    const referrers = calls.filter(([method]) => method === 'setReferrerUrl').map(([, url]) => url as string)
    expect(referrers).toEqual([`${new URL(page.url()).origin}/`])

    await page.getByRole('link', { name: 'Réutilisations' }).first().click()
    await expect(page).toHaveURL('/reuses')

    calls = await matomoCalls(page)
    expect(calls.filter(([method]) => method === 'trackPageView')).toHaveLength(2)
    const referrersAfterSecondNav = calls.filter(([method]) => method === 'setReferrerUrl').map(([, url]) => url as string)
    expect(referrersAfterSecondNav).toEqual([
      `${new URL(page.url()).origin}/`,
      `${new URL(page.url()).origin}/datasets`,
    ])
  })
})
