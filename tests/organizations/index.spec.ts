import { test, expect } from '../base'

test('page loads with results', async ({ page }) => {
  await page.goto('/organizations')

  await expect(page).toHaveTitle(/Organisations/)

  await expect(page.getByRole('heading', { name: 'Organisations', level: 1 })).toBeVisible()

  await expect(page.getByText(/\d+ résultat/)).toBeVisible()

  // Verify known organization from seed data
  await expect(page.getByRole('link', { name: /sobrana/i })).toBeVisible()
})

test('search filters results', async ({ page }) => {
  await page.goto('/organizations')

  const searchInput = page.getByPlaceholder(/Rechercher/)
  await searchInput.fill('sobrana')

  await expect(page).toHaveURL(/\/organizations\?q=sobrana/)

  await expect(page.getByRole('link', { name: /sobrana/i })).toBeVisible()
})
