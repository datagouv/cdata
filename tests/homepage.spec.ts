import { test, expect } from '@playwright/test'

test('homepage is working', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Accueil — data.gouv.fr')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ mask: [page.getByTestId('user-avatar')] })
})
