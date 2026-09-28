import { test, expect } from '../base'

const redirectionCases = [
  { from: '/datasets?q=elections', to: '/datasets/search?q=elections' },
  { from: '/reuses?topic=transport', to: '/reuses/search?topic=transport' },
  { from: '/dataservices?q=sirene', to: '/dataservices/search?q=sirene' },
]

const noRedirectionCases = [
  '/datasets',
  '/reuses',
  '/dataservices',
  '/datasets?utm_source=test&random=value',
]

test.describe('Search redirections', () => {
  redirectionCases.forEach(({ from, to }) => {
    test(`${from} → ${to}`, async ({ page }) => {
      await page.goto(from)
      await expect(page).toHaveURL(to)
    })
  })

  noRedirectionCases.forEach((url) => {
    test(`${url} stays on landing page`, async ({ page }) => {
      await page.goto(url)
      await page.waitForTimeout(500)
      await expect(page).toHaveURL(url)
    })
  })

  // Those old search URLs are still indexed and linked from outside, so the redirect
  // has to happen over HTTP: a client that runs no JS never gets past the landing page.
  redirectionCases.forEach(({ from, to }) => {
    test(`${from} → ${to} without running any JS`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 })

      expect(response.status()).toBe(308)
      const location = new URL(response.headers()['location'], 'http://localhost')
      expect(location.pathname + location.search).toBe(to)
    })
  })

  noRedirectionCases.forEach((url) => {
    test(`${url} is served as-is without running any JS`, async ({ request }) => {
      const response = await request.get(url, { maxRedirects: 0 })

      expect(response.status()).toBe(200)
    })
  })
})
