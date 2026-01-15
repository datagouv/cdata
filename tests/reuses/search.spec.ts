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

  await expect(page).toHaveURL(/\/reuses\/search\?q=itineriz/)

  await expect(page.getByRole('link', { name: /itineriz/i })).toBeVisible()
})

test('topic filter works', async ({ page }) => {
  await page.goto('/reuses/search')

  const topicButton = page.getByRole('button', { name: 'Alimentation et agriculture' })
  await expect(topicButton).toBeVisible()

  await topicButton.click()

  await expect(page).toHaveURL(/\/reuses\/search\?topic=food_and_agriculture/)
})

test('clicking reuse navigates to detail', async ({ page }) => {
  await page.goto('/reuses/search')
  // Wait for Vue hydration before clicking NuxtLink (fix flaky test on Firefox)
  await page.waitForLoadState('networkidle')

  const reuseLink = page.getByRole('link', { name: /itineriz/i })
  await expect(reuseLink).toBeVisible()

  await reuseLink.click()

  await expect(page).toHaveURL(/\/reuses\/itineriz/)
})
