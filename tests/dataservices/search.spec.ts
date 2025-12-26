import { test, expect } from '@playwright/test'

test('page loads with results', async ({ page }) => {
  await page.goto('/dataservices/search')

  await expect(page).toHaveTitle(/API/)

  await expect(page.getByRole('heading', { name: 'API', level: 1 })).toBeVisible()

  await expect(page.getByText(/\d+ résultat/)).toBeVisible()

  // Verify known API from seed data
  await expect(page.getByRole('link', { name: /Explore API/i })).toBeVisible()
})

test('search filters results', async ({ page }) => {
  await page.goto('/dataservices/search')

  const searchInput = page.getByPlaceholder(/élection présidentielle/)
  await searchInput.fill('explore')

  await page.waitForURL('**/dataservices/search?q=explore**')

  await expect(page.getByRole('link', { name: /Explore API/i })).toBeVisible()
})

test('clicking dataservice navigates to detail', async ({ page }) => {
  await page.goto('/dataservices/search')

  const dataserviceLink = page.getByRole('link', { name: /Explore API/i })
  await expect(dataserviceLink).toBeVisible()

  await dataserviceLink.click()

  await page.waitForURL('**/dataservices/explore-api**')
})
