import { test, expect } from '../base'
import { gotoHydrated } from '../helpers'

test('page loads with results', async ({ page }) => {
  await page.goto('/organizations')

  await expect(page).toHaveTitle(/Liste des organisations/)

  await expect(page.getByRole('heading', { name: 'Recherche d\'une organisation', level: 1 })).toBeVisible()

  await expect(page.getByTestId('search-result-count')).toBeVisible()

  const results = page.locator('.search-results ul')
  await expect(results.locator('li')).not.toHaveCount(0)

  // Verify known organization from seed data
  await expect(page.getByRole('link', { name: /sobrana/i })).toBeVisible()
})

test('search filters results', async ({ page }) => {
  // The search input is v-model controlled: typing before hydration completes gets wiped
  await gotoHydrated(page, '/organizations')

  const searchInput = page.getByRole('searchbox')
  await searchInput.fill('sobrana')

  await page.waitForURL(/\/organizations\?q=sobrana/)

  await expect(page.getByRole('link', { name: /sobrana/i })).toBeVisible()
})
