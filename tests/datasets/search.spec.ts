import { test, expect } from '@playwright/test'

test('search launch without params', async ({ page }) => {
  await page.goto('/datasets/search/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(
    'Recherche des jeux de données — data.gouv.fr',
  )

  await expect(page.getByTestId('result-count')).toBeVisible()

  const results = page.getByTestId('results')
  await expect(results.locator('li')).not.toHaveCount(0)

  const url = new URL(page.url())
  expect(url.searchParams.size).toBe(0)
})

test('dataset label filter is available and functional', async ({ page }) => {
  await page.goto('/datasets/search/')

  const filter = page.getByTestId('dataset-label-filter')
  await expect(filter).toBeVisible()

  // Check that filter has placeholder text
  await expect(filter.getByPlaceholder('Tous les badges')).toBeVisible()

  // Open filter dropdown
  await filter.locator('button').first().click()

  // Check that options are available
  const options = filter.locator('li')
  await expect(options).not.toHaveCount(0)

  // Get first option text for later verification
  const firstOptionText = await options.first().textContent()
  expect(firstOptionText).toBeTruthy()

  // Click on first option
  await options.first().click()

  // Verify URL is updated with badge parameter
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeTruthy()

  // Verify filter shows selected value
  await expect(filter.locator('input').first()).toHaveValue(
    firstOptionText!,
  )
})

test('search results update when badge filter is applied', async ({ page }) => {
  await page.goto('/datasets/search/')

  // Get initial results count
  const initialResultCount = await page
    .getByTestId('result-count')
    .textContent()
  expect(initialResultCount).toBeTruthy()

  const filter = page.getByTestId('dataset-label-filter')
  await filter.locator('button').first().click()

  // Select a badge filter
  await filter.locator('li').nth(3).click()

  // Wait for results to update
  await page.waitForTimeout(3000) // Allow for API call and re-render

  // Get updated results count
  const filteredResultCount = await page
    .getByTestId('result-count')
    .textContent()
  expect(filteredResultCount).toBeTruthy()

  // Results should either be different count or show "0 résultats" if no datasets have this badge
  expect(filteredResultCount).not.toBe(initialResultCount)
})

test('badge filter can be cleared', async ({ page }) => {
  // Start with a badge filter applied
  await page.goto('/datasets/search/?badge=hvd')

  const filter = page.getByTestId('dataset-label-filter')
  const filterInput = filter.locator('input').first()

  // Wait for results to update
  await page.waitForTimeout(3000) // Allow for API call and re-render

  // Verify badge is selected
  await expect(filterInput).toHaveValue('Données de forte valeur')

  // Open dropdown and select "Tous les badges" (first option is usually "clear")
  await filter.locator('button').first().click()
  await filter.getByTitle('Clear').first().click()

  // Verify filter is cleared
  await expect(filterInput).toHaveValue('')

  // Verify URL parameter is removed
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeFalsy()
})

test('badge filter persists on page reload', async ({ page }) => {
  await page.goto('/datasets/search/')

  const filter = page.getByTestId('dataset-label-filter')
  await filter.locator('button').first().click()

  // Get and select the first badge option
  const firstOption = filter.locator('li').first()
  const optionText = await firstOption.textContent()
  await firstOption.click()

  // Reload the page
  await page.reload()

  // Verify the filter is still applied
  const filterInput = page
    .getByTestId('dataset-label-filter')
    .locator('input')
    .first()
  await expect(filterInput).toHaveValue(optionText!)

  // Verify URL still has the badge parameter
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeTruthy()
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
