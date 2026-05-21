import { test, expect } from '../base'

// Non-existent slugs on /pages/ must return a clean HTTP 404 rendering the
// shared error page, not a soft 404 (HTTP 200) nor a 500.
// See https://github.com/datagouv/data.gouv.fr/issues/1932
const notFoundCases = [
  '/pages', // empty slug
  '/pages/404', // example from the issue
  '/pages/this-page-does-not-exist-1932', // arbitrary missing slug
]

test.describe('Pages not found', () => {
  notFoundCases.forEach((url) => {
    test(`${url} returns a clean 404`, async ({ page }) => {
      const response = await page.goto(url)
      expect(response?.status()).toBe(404)
      await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Page non trouvée' })).toBeVisible()
    })
  })

  // Following an in-app link from the error page must clear the error state and
  // navigate normally. Before the fix, the SPA navigation crashed and left a
  // blank page (see nuxt#22683). assertNoConsoleErrors catches the crash.
  test('navigating away from the error page does not crash', async ({ page }) => {
    await page.goto('/pages/this-page-does-not-exist-1932')
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()

    await page.getByRole('link', { name: 'Retour à l\'accueil' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeHidden()
    // The home page actually rendered (not a blank page).
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
