import { test, expect } from '@playwright/test'

const redirectionCases = [
  { from: '/datasets/', to: '/datasets' },
  { from: '/datasets/slug/', to: '/datasets/slug' },
  { from: '/datasets/slug/information/', to: '/datasets/slug/information' },
  { from: '/datasets/slug/#/resources/4d741143-8331-4b59-95c2-3b24a7bdbe3c', to: '/datasets/slug#/resources/4d741143-8331-4b59-95c2-3b24a7bdbe3c' },
  { from: '/datasets/slug/#/discussions/66d703e3c41540053101328e', to: '/datasets/slug#/discussions/66d703e3c41540053101328e' },
  // Do the same for reuses, dataservices, organizations, api, posts, pages
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
})
