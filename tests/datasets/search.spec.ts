import { test, expect } from '../base'

test('search launch without params', async ({ page }) => {
  await page.goto('/datasets/search/')

  await expect(page).toHaveTitle(
    'Recherche des jeux de données — data.gouv.fr',
  )

  // Result count is displayed with role="status"
  await expect(page.getByRole('status')).toBeVisible()

  // Results are displayed in a list
  const results = page.locator('.search-results ul')
  await expect(results.locator('li')).not.toHaveCount(0)

  const url = new URL(page.url())
  expect(url.searchParams.size).toBe(0)
})

test('dataset label filter is available and functional', async ({ page }) => {
  await page.goto('/datasets/search/')

  // BadgeSelect uses data-testid based on slugified label
  const filterButton = page.getByTestId('searchable-select-label-de-donn-es')
  await filterButton.scrollIntoViewIfNeeded()
  await expect(filterButton).toBeVisible()

  // Open filter dropdown
  await filterButton.click()

  // Check that options are available in the listbox
  const listbox = page.getByRole('listbox')
  const options = listbox.getByRole('option')
  await expect(options).not.toHaveCount(0)

  // Get first option text for later verification
  const firstOptionText = await options.first().textContent()
  expect(firstOptionText).toBeTruthy()

  // Click on first option
  await options.first().click()

  // Verify URL is updated with badge parameter
  await page.waitForURL(/badge=/)
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeTruthy()
})

test('search results update when badge filter is applied', async ({ page }) => {
  await page.goto('/datasets/search/')

  // Wait for initial results to load
  await expect(page.getByRole('status')).toBeVisible()

  // Open badge filter
  const filterButton = page.getByTestId('searchable-select-label-de-donn-es')
  await filterButton.scrollIntoViewIfNeeded()
  await filterButton.click()

  // Select a badge filter (pick the first option)
  const listbox = page.getByRole('listbox')
  await listbox.getByRole('option').first().click()

  // Wait for URL to update with badge parameter
  await page.waitForURL(/badge=/)

  // Either results are shown with a count, or "no results" message is displayed
  const hasResults = await page.getByRole('status').isVisible().catch(() => false)
  const hasNoResultsMessage = await page.getByText('Vous n\'avez pas trouvé ce que vous cherchez').isVisible().catch(() => false)

  expect(hasResults || hasNoResultsMessage).toBeTruthy()
})

test('badge filter can be cleared', async ({ page }) => {
  // Start with a badge filter applied
  await page.goto('/datasets/search/?badge=hvd')

  // Find the reset filters button in the sidebar (first one)
  const resetButton = page.getByRole('button', { name: 'Réinitialiser les filtres' }).first()
  await resetButton.scrollIntoViewIfNeeded()

  // Click reset filters button
  await resetButton.click()

  // Verify URL parameter is removed
  await page.waitForURL(url => !url.searchParams.has('badge'))
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeFalsy()
})

test('badge filter persists on page reload', async ({ page }) => {
  await page.goto('/datasets/search/')

  // Open badge filter
  const filterButton = page.getByTestId('searchable-select-label-de-donn-es')
  await filterButton.scrollIntoViewIfNeeded()
  await filterButton.click()

  // Get and select the first badge option
  const listbox = page.getByRole('listbox')
  const firstOption = listbox.getByRole('option').first()
  await firstOption.click()

  // Wait for URL to update
  await page.waitForURL(/badge=/)
  const badgeValue = new URL(page.url()).searchParams.get('badge')

  // Reload the page
  await page.reload()

  // Verify URL still has the badge parameter with same value
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeTruthy()
  expect(url.searchParams.get('badge')).toBe(badgeValue)
})

test('clicking dataset navigates to detail', async ({ page }) => {
  await page.goto('/datasets/search/')
  // Wait for Vue hydration before clicking NuxtLink (fix flaky test on Firefox)
  await page.waitForLoadState('networkidle')

  const datasetLink = page.getByRole('link', { name: /SIRENE/i }).first()
  await expect(datasetLink).toBeVisible()

  await datasetLink.click()

  await expect(page).toHaveURL(/\/datasets\/base-sirene/)
})
