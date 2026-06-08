import { test, expect } from '../base'

// The @datagouv/components-next config is installed once, from a Nuxt plugin.
// It used to be installed from BOTH app.vue and error.vue, and `app.use(plugin)`
// is idempotent: landing on an error page first let error.vue install an
// INCOMPLETE config (without metricsApiUrl), so app.vue's later install became a
// no-op. Navigating afterwards to a page using `useMetrics` (a dataset detail
// page) then threw "metricsApiUrl and apiBase must be configured", leaving the
// URL changed but the previous page still rendered.
//
// This test starts on a 404 (error.vue) and navigates, entirely client-side, all
// the way to a dataset detail page. assertNoConsoleErrors catches the thrown
// error; the heading assertions catch the "content stuck on the search page"
// symptom.
test('a dataset detail page renders after starting on the error page', async ({ page }) => {
  const response = await page.goto('/datasets/azerty')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Page non trouvée' })).toBeVisible()

  // SPA navigation: error page -> /datasets -> /datasets/search
  await page.getByRole('link', { name: 'Données', exact: true }).click()
  await expect(page).toHaveURL(/\/datasets$/)
  await page.getByRole('link', { name: 'Voir tous les jeux de données' }).click()
  await expect(page).toHaveURL(/\/datasets\/search/)

  // SPA navigation to the first result, a dataset detail page that uses useMetrics
  const firstResult = page.locator('.search-results ul > li').first().getByRole('link').first()
  const datasetTitle = (await firstResult.textContent())?.trim() ?? ''
  expect(datasetTitle).not.toBe('')
  await firstResult.click()

  // The detail page actually rendered: URL is a dataset slug and the heading is
  // the dataset title, not the search page heading.
  await expect(page).toHaveURL(/\/datasets\/[^/]+$/)
  await expect(page.getByRole('heading', { name: 'Recherche avancée d\'un jeu de données' })).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(datasetTitle)
})
