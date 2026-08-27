import type { Page } from '@playwright/test'
import { test, expect } from '../base'

// A `?page=` past the last page used to render the pagination with a current page
// that does not exist, building an array of negative length and answering a 500.
// Crawlers follow stale links to such pages, so they must get a clean 404 instead.

// An organization from the udata fixtures, so its listing holds real data.
const ORG = 'ademe'

async function expectCleanNotFound(page: Page, url: string) {
  const response = await page.goto(url)
  expect(response?.status(), url).toBe(404)
  await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
  // The heading is server rendered, so it shows up while the header is still
  // prefetching the admin layout and middleware through NuxtLink. Navigating away
  // then aborts those module requests, which Firefox reports as a console error.
  await page.waitForLoadState('networkidle')
}

test.describe('Organization listings pagination', () => {
  // The two search backends disagree on a page past the last one, and only one of them
  // reaches the guard:
  //
  // - with elasticsearch (production), the API answers 200 with the `total`, so the
  //   guard computes the page count and answers a 404. This is the Sentry case.
  // - without it (this e2e environment), the search falls back to mongo, whose
  //   paginator does `abort(404)` as soon as a page is empty and is not page 1
  //   (udata/flask_mongoengine/pagination.py). The listing then fails to load, the
  //   guard has no total to compare against, and the page stays a 200 showing a
  //   loading error.
  //
  // Re-enable once the two paths agree, either by making the API answer the same thing
  // in both or by running elasticsearch here. Until then the crash itself is covered by
  // the getVisiblePages unit tests.
  test.fixme('a page past the last one answers a clean 404', async ({ page }) => {
    // The listing must really load, otherwise there is no total to compare the page
    // against and the rest of this test would pass without exercising anything.
    const firstPage = await page.goto(`/organizations/${ORG}/datasets`)
    expect(firstPage?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: /DPE Logements/ })).toBeVisible()

    await expectCleanNotFound(page, `/organizations/${ORG}/datasets?page=2`)
    await expectCleanNotFound(page, `/organizations/${ORG}/datasets?page=127`)
  })

  test('a malformed page answers a clean 404', async ({ page }) => {
    // These never depend on the listing having loaded: no page count can make them valid.
    for (const query of ['?page=abc', '?page=-5', '?page=1.5', '?page=0']) {
      for (const tab of ['datasets', 'reuses', 'dataservices']) {
        await expectCleanNotFound(page, `/organizations/${ORG}/${tab}${query}`)
      }
    }
  })
})
