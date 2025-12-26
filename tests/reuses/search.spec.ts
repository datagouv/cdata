import { test, expect } from '@playwright/test'

test('page loads with results', async ({ page }) => {
  await page.goto('/reuses/search')

  await expect(page).toHaveTitle(/Réutilisations/)

  await expect(page.getByText(/\d+ résultat/)).toBeVisible()

  // Verify a known reuse from seed data is displayed
  await expect(page.getByRole('link', { name: /itineriz/i })).toBeVisible()
})

test('search filters results', async ({ page }) => {
  await page.goto('/reuses/search')

  const searchInput = page.getByPlaceholder('Rechercher...')
  await searchInput.fill('itineriz')

  await page.waitForURL('**/reuses/search?q=itineriz**')

  await expect(page.getByRole('link', { name: /itineriz/i })).toBeVisible()
})

test('topic filter works', async ({ page }) => {
  await page.goto('/reuses/search')

  const topicButton = page.getByRole('button', { name: 'Alimentation et agriculture' })
  await expect(topicButton).toBeVisible()

  await topicButton.click()

  await page.waitForURL('**/reuses/search?topic=food_and_agriculture**')
})

test('clicking reuse navigates to detail', async ({ page }) => {
  await page.goto('/reuses/search')

  const reuseLink = page.getByRole('link', { name: /itineriz/i })
  await expect(reuseLink).toBeVisible()

  await reuseLink.click()

  await page.waitForURL('**/reuses/itineriz**')
})
