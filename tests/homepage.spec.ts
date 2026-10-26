import { test, expect } from './base'

test('homepage is working', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('data.gouv.fr : Plateforme ouverte des données publiques françaises')
  // Links chosen by the team keep helping the sites they point to
  await expect(page.locator('a[href="https://ecologie.data.gouv.fr"]').first()).not.toHaveAttribute('rel', /nofollow/)
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot({
    mask: [page.getByTestId('user-avatar'), page.getByTestId('commit-version'), page.getByTestId('udata-version')],
    fullPage: true,
    maxDiffPixelRatio: 0.01, // Allow 1% pixel difference for minor rendering variations (same as the edito spec)
  })
})
