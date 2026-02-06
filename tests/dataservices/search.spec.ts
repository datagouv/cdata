import { test, expect } from '../base'

test('page loads with results', async ({ page }) => {
  await page.goto('/dataservices/search')

  await expect(page).toHaveTitle(/API/)

  await expect(page.getByRole('heading', { name: /Rechercher sur/, level: 1 })).toBeVisible()

  await expect(page.getByText(/\d+ résultat/)).toBeVisible()

  // Verify known API from seed data
  await expect(page.getByRole('link', { name: /Explore API/i })).toBeVisible()
})

test('search filters results', async ({ page }) => {
  await page.goto('/dataservices/search')

  const searchInput = page.getByPlaceholder(/élection présidentielle/)
  await searchInput.fill('explore')

  await expect(page).toHaveURL(/\/dataservices\/search\?q=explore/)

  await expect(page.getByRole('link', { name: /Explore API/i })).toBeVisible()
})

test('clicking dataservice navigates to detail', async ({ page }) => {
  await page.goto('/dataservices/search')
  // Wait for Vue hydration before clicking NuxtLink (fix flaky test on Firefox)
  await page.waitForLoadState('networkidle')

  const dataserviceLink = page.getByRole('link', { name: /Explore API/i })
  await expect(dataserviceLink).toBeVisible()

  await dataserviceLink.click()

  await expect(page).toHaveURL(/\/dataservices\/explore-api/)
})
