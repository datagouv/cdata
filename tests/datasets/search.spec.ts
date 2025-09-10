import { test, expect } from '@playwright/test'

test('search launch without params', async ({ page }) => {
  await page.goto('/datasets/search/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Recherche des jeux de données — data.gouv.fr')

  await expect(page.getByTestId('result-count')).toBeVisible()

  const results = page.getByTestId('results')
  await expect(results.locator('li')).toHaveCount(20)

  const url = new URL(page.url())
  await expect(url.searchParams.size).toBe(0)
})

test('search launch with label', async ({ page }) => {
  await page.goto('/datasets/search/')

  const filter = page.getByTestId('dataset-label-filter')

  // open filter
  await filter.locator('button').first().click()

  // click on first result
  await filter.locator('li').first().click()

  const url = new URL(page.url())
  await expect(url.searchParams.size).toBe(1)
  await expect(url.searchParams.has('badge')).toBeTruthy()
})
