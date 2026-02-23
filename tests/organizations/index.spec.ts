import { test, expect } from '../base'

test('page loads with results', async ({ page }) => {
  await page.goto('/organizations')

  await expect(page).toHaveTitle(/Organisations/)

  await expect(page.getByRole('heading', { name: 'Organisations', level: 1 })).toBeVisible()

  await expect(page.getByRole('status')).toBeVisible()

  const results = page.locator('.search-results ul')
  await expect(results.locator('li')).not.toHaveCount(0)

  // Verify known organization from seed data
  await expect(page.getByRole('link', { name: /sobrana/i })).toBeVisible()
})

test('search filters results', async ({ page }) => {
  await page.goto('/organizations')

  const searchInput = page.getByRole('searchbox')
  await searchInput.fill('sobrana')

  await page.waitForURL(/\/organizations\?q=sobrana/)

  await expect(page.getByRole('link', { name: /sobrana/i })).toBeVisible()
})
