import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

// A `?page=` past the last page used to render the pagination with a current page
// that does not exist, building an array of negative length and answering a 500.
// Crawlers follow stale links to such pages, so they must get a clean 404 instead.
const outOfRangeQueries = [
  '?page=127', // the page reported by Sentry, far past the end
  '?page=2', // the first page that does not exist on an empty organization
  '?page=abc', // not a number
  '?page=-5', // below the first page
  '?page=1.5', // not a whole page
]

test.describe('Organization listings pagination', () => {
  test('an out of range page answers a clean 404', async ({ page }) => {
    const createResp = await page.request.post(`${API_BASE}/api/1/organizations/`, {
      data: {
        name: `Pagination test ${Date.now()}`,
        description: 'Organization used to test out of range pagination.',
      },
    })
    const org = await createResp.json()

    try {
      // The organization has no dataset at all, so only page 1 exists.
      const firstPage = await page.goto(`/organizations/${org.slug}/datasets?page=1`)
      expect(firstPage?.status()).toBe(200)

      for (const query of outOfRangeQueries) {
        for (const tab of ['datasets', 'reuses', 'dataservices']) {
          const response = await page.goto(`/organizations/${org.slug}/${tab}${query}`)
          expect(response?.status(), `${tab}${query}`).toBe(404)
          await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
        }
      }
    }
    finally {
      await page.request.delete(`${API_BASE}/api/1/organizations/${org.id}/`)
    }
  })
})
