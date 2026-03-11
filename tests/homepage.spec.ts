import { test, expect } from './base'

test('homepage is working', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('data.gouv.fr : Plateforme ouverte des données publiques françaises')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({ mask: [page.getByTestId('user-avatar')] })
})
