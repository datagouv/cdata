import { test, expect } from '@playwright/test'

test('search launch without params', async ({ page }) => {
  await page.goto('/datasets/search/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Accueil — data.gouv.fr')
})
