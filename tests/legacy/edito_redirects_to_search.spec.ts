import { test, expect } from '@playwright/test'

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
      // Listen for all console logs
      page.on('console', msg => console.log(msg.text()))
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
