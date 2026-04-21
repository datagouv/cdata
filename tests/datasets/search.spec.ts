import { test, expect } from '../base'

test('search launch without params', async ({ page }) => {
  await page.goto('/datasets/search/')

  await expect(page).toHaveTitle(
    'Moteur de recherche des jeux de données - data.gouv.fr',
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

  // Badge filter is now a RadioGroup with legend "Label de donnée"
  const badgeFieldset = page.locator('fieldset').filter({ hasText: 'Label de donnée' })
  await badgeFieldset.scrollIntoViewIfNeeded()
  await expect(badgeFieldset).toBeVisible()

  // Check that radio options are available
  const radioOptions = badgeFieldset.locator('input[type="radio"]')
  await expect(radioOptions).not.toHaveCount(0)

  // Click on first non-default option (skip "Tous")
  const firstBadgeOption = badgeFieldset.getByText('Données de forte valeur')
  await firstBadgeOption.click()

  // Verify URL is updated with badge parameter
  await page.waitForURL(/badge=/)
  const url = new URL(page.url())
  expect(url.searchParams.has('badge')).toBeTruthy()
})

test('search results update when badge filter is applied', async ({ page }) => {
  await page.goto('/datasets/search/')

  // Wait for initial results to load
  await expect(page.getByRole('status')).toBeVisible()

  // Badge filter is now a RadioGroup
  const badgeFieldset = page.locator('fieldset').filter({ hasText: 'Label de donnée' })
  await badgeFieldset.scrollIntoViewIfNeeded()

  // Click on a badge option
  await badgeFieldset.getByText('Données de forte valeur').click()

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

  // Badge filter is now a RadioGroup
  const badgeFieldset = page.locator('fieldset').filter({ hasText: 'Label de donnée' })
  await badgeFieldset.scrollIntoViewIfNeeded()

  // Click on a badge option
  await badgeFieldset.getByText('Données de forte valeur').click()

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

test('custom theme filter is visible on design search page', async ({ page }) => {
  await page.goto('/design/dataset-search')

  const themeSelect = page.locator('#theme-filter')
  await themeSelect.scrollIntoViewIfNeeded()
  await expect(themeSelect).toBeVisible()
})

test('custom theme filter updates URL', async ({ page }) => {
  await page.goto('/design/dataset-search')

  const themeSelect = page.locator('#theme-filter')
  await themeSelect.scrollIntoViewIfNeeded()
  await themeSelect.selectOption('environnement')

  await page.waitForURL(/theme=environnement/)
  const url = new URL(page.url())
  expect(url.searchParams.get('theme')).toBe('environnement')
})

test('custom theme filter persists on reload', async ({ page }) => {
  await page.goto('/design/dataset-search?theme=transport')

  const themeSelect = page.locator('#theme-filter')
  await expect(themeSelect).toHaveValue('transport')

  await page.reload()

  await expect(page.locator('#theme-filter')).toHaveValue('transport')
  const url = new URL(page.url())
  expect(url.searchParams.get('theme')).toBe('transport')
})

test('custom theme filter is cleared by reset button', async ({ page }) => {
  await page.goto('/design/dataset-search?theme=sante')

  await expect(page.locator('#theme-filter')).toHaveValue('sante')

  const resetButton = page.getByRole('button', { name: 'Réinitialiser les filtres' }).first()
  await resetButton.scrollIntoViewIfNeeded()
  await resetButton.click()

  await page.waitForURL(url => !url.searchParams.has('theme'))
  await expect(page.locator('#theme-filter')).not.toHaveValue('sante')
})

test('custom theme filter is hidden on non-dataset types', async ({ page }) => {
  await page.goto('/design/dataset-search')

  await expect(page.locator('#theme-filter')).toBeVisible()

  const reusesRadio = page.getByRole('radio', { name: 'Réutilisations' })
  await reusesRadio.click({ force: true })

  await expect(page.locator('#theme-filter')).not.toBeVisible()
})

test('custom theme filter resets page to 1 on change', async ({ page }) => {
  await page.goto('/design/dataset-search?page=2')

  const themeSelect = page.locator('#theme-filter')
  await themeSelect.scrollIntoViewIfNeeded()
  await themeSelect.selectOption('education')

  await page.waitForURL(/theme=education/)
  const url = new URL(page.url())
  expect(url.searchParams.get('page')).toBeNull()
})

test('custom theme filter preserves page param on initial load', async ({ page }) => {
  await page.goto('/design/dataset-search?theme=transport&page=2')

  await expect(page.locator('#theme-filter')).toHaveValue('transport')

  // Give the client a chance to hydrate and any stray watchers to fire.
  await page.waitForLoadState('networkidle')

  const url = new URL(page.url())
  expect(url.searchParams.get('theme')).toBe('transport')
  expect(url.searchParams.get('page')).toBe('2')
})

test('custom theme filter applies its apiParam mapping to the results', async ({ page }) => {
  await page.goto('/design/dataset-search')

  const results = page.locator('.search-results ul')
  await expect(results.locator('li')).not.toHaveCount(0)

  // The UI param is `theme` but useSearchFilter maps it to `tag` for the API.
  // Assert both: the outgoing request uses `tag`, and the results reflect it.
  const themeSelect = page.locator('#theme-filter')
  await themeSelect.scrollIntoViewIfNeeded()

  const apiRequest = page.waitForRequest(req =>
    req.url().includes('/api/2/datasets/search/')
    && new URL(req.url()).searchParams.get('tag') === 'transport',
  )
  await themeSelect.selectOption('transport')
  await apiRequest

  await expect(
    results.getByText('Réseau de transport en commun Trans\'Agglo de DLVA'),
  ).toBeVisible()
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
