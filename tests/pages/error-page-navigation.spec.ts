import { test, expect } from '../base'

// Following an in-app link from the error page must clear the error state and
// navigate normally, without crashing or leaving a blank/404 page.
// Two distinct code paths reach error.vue and must both work:
//   - /pages         -> empty slug, error thrown synchronously in setup
//   - /pages/<slug>  -> missing slug, error thrown after `await useFetch`
// The second used to stay stuck on the 404 because clearing the error re-ran the
// failing useFetch (see nuxt#27410). assertNoConsoleErrors also catches the
// "can't access property exposed" crash (see nuxt#22683).
const startUrls = [
  '/pages', // empty slug (sync throw)
  '/pages/this-page-does-not-exist-1932', // missing slug (throw after useFetch)
]

test.describe('Navigating away from the error page', () => {
  startUrls.forEach((startUrl) => {
    test(`from ${startUrl} reaches the target page`, async ({ page }) => {
      await page.goto(startUrl)
      await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()

      await page.getByRole('link', { name: 'Retour à l\'accueil' }).click()

      await expect(page).toHaveURL('/')
      await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeHidden()
      // The home page actually rendered (not a blank page).
      await expect(page.locator('h1').first()).toBeVisible()
    })
  })
})
