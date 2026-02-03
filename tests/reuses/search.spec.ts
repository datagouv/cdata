import { test, expect } from '../base'

test('page loads with results', async ({ page }) => {
  await page.goto('/reuses/search')

  await expect(page).toHaveTitle(/Réutilisations/)

  // Result count is displayed with role="status"
  await expect(page.getByRole('status')).toBeVisible()

  // Verify a known reuse from seed data is displayed
  await expect(page.getByRole('link', { name: /itineriz/i })).toBeVisible()
})

test('search filters results', async ({ page }) => {
  await page.goto('/reuses/search')

  const searchInput = page.getByPlaceholder('Ex : élection présidentielle 2022')
  await searchInput.fill('itineriz')
  await searchInput.press('Enter')

  await expect(page).toHaveURL(/\/reuses\/search\?q=itineriz/)

  await expect(page.getByRole('link', { name: /itineriz/i })).toBeVisible()
})

test('topic filter works', async ({ page }) => {
  await page.goto('/reuses/search')

  // Topic filter uses SearchableSelect with label "Thématique"
  const filterButton = page.getByTestId('searchable-select-th-matique')
  await filterButton.scrollIntoViewIfNeeded()
  await filterButton.click()

  // Select "Alimentation et agriculture" from the listbox
  const listbox = page.getByRole('listbox')
  await listbox.getByRole('option', { name: 'Alimentation et agriculture' }).click()

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
