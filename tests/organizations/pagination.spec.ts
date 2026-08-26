import type { Page } from '@playwright/test'
import { test, expect } from '../base'

// A `?page=` past the last page used to render the pagination with a current page
// that does not exist, building an array of negative length and answering a 500.
// Crawlers follow stale links to such pages, so they must get a clean 404 instead.

// An organization from the udata fixtures: it holds a single dataset, so page 2 is
// already past the end. A freshly created organization would not do — its listing
// does not load on the e2e backend, and the guard cannot tell a page is out of range
// without a total.
const ORG = 'ademe'

async function expectCleanNotFound(page: Page, url: string) {
  const response = await page.goto(url)
  expect(response?.status(), url).toBe(404)
  await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
}

test.describe('Organization listings pagination', () => {
  test('a page past the last one answers a clean 404', async ({ page }) => {
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
