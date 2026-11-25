import { test, expect } from './base'
import type { Page } from '@playwright/test'

// The matomo tracker script is replaced by an empty script, so the real
// matomo.js never processes the queue: asserting on window._paq shows exactly
// what the app queued for the tracker, synchronously and without any
// timing-dependent mock:
// - the landing page view is queued exactly once (the initial page:finish)
// - each in-app navigation queues exactly one more page view
// - no setReferrerUrl is ever queued: a path-only referrer is discarded by
//   Matomo as invalid, which used to reclassify every session as direct entry
// Requires NUXT_PUBLIC_MATOMO_HOST to be set on the server under test (CI
// workflow, or a locally started `pnpm run preview`) so the matomo plugin
// actually loads instead of the no-op fallback. Requires a production
// server: the dev server never fires the page load event (page.goto
// times out).
const paq = (page: Page) => page.evaluate(() => (window as unknown as { _paq?: unknown[][] })._paq ?? [])
const queuedCalls = (page: Page, method: string) =>
  paq(page).then(calls => calls.filter((call): call is unknown[] => Array.isArray(call) && call[0] === method))

// The plugin queues its config (setTrackerUrl/setSiteId) during setup:
// waiting for it guarantees the page watcher is registered too.
const waitForTracker = (page: Page) =>
  expect
    .poll(async () => (await queuedCalls(page, 'setSiteId')).length, {
      timeout: 15_000,
      message: 'Matomo plugin did not load. Is NUXT_PUBLIC_MATOMO_HOST set on the server under test?',
    })
    .toBeGreaterThan(0)

// Each page view queues setCustomUrl, setDocumentTitle then trackPageView in
// the same tick. The useScriptEventPage callback runs in a microtask after
// page:finish (up to ~100 ms later), so counts are polled rather than read
// right after the URL changes.
const expectPageViewCount = (page: Page, count: number) =>
  expect
    .poll(async () => {
      const [pageViews, customUrls, titles] = await Promise.all([
        queuedCalls(page, 'trackPageView'),
        queuedCalls(page, 'setCustomUrl'),
        queuedCalls(page, 'setDocumentTitle'),
      ])
      return { pageViews: pageViews.length, customUrls: customUrls.length, titles: titles.length }
    }, { timeout: 15_000 })
    .toEqual({ pageViews: count, customUrls: count, titles: count })

test.describe('Matomo tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/matomo.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: '/* mocked: never processed, tests assert on window._paq */',
    }))
  })

  test('queues the landing page view exactly once, without a referrer override', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await waitForTracker(page)

    await expectPageViewCount(page, 1)
    expect(await queuedCalls(page, 'setReferrerUrl')).toHaveLength(0)
  })

  test('queues one page view per in-app navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await waitForTracker(page)

    await page.getByRole('link', { name: 'Données' }).first().click()
    await expect(page).toHaveURL('/datasets')
    await expectPageViewCount(page, 2)

    await page.getByRole('link', { name: 'Réutilisations' }).first().click()
    await expect(page).toHaveURL('/reuses')
    await expectPageViewCount(page, 3)

    expect(await queuedCalls(page, 'setReferrerUrl')).toHaveLength(0)
  })

  test('does not track routes flagged with matomoIgnore', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await waitForTracker(page)
    // Give the page:finish callback (which skips this route) time to fire.
    await page.waitForTimeout(500)

    expect(await queuedCalls(page, 'trackPageView')).toHaveLength(0)
    expect(await queuedCalls(page, 'setCustomUrl')).toHaveLength(0)
    expect(await queuedCalls(page, 'setDocumentTitle')).toHaveLength(0)
  })
})
