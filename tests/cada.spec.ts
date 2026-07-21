import { test, expect } from './base'

test('CADA homepage loads with search bar and table', async ({ page }) => {
  await page.goto('/explore/cada')
  await page.waitForLoadState('networkidle')

  // Page title
  await expect(page).toHaveTitle(/CADA/)

  // Search bar is visible
  await expect(page.getByPlaceholder('Rechercher par objet, administration, thème, mots-clés…')).toBeVisible()

  // TabularExplorer renders with column selector and row count after data loads
  await expect(page.getByRole('button', { name: /Colonnes/ })).toBeVisible({ timeout: 30000 })
  await expect(page.getByText('Lignes').first()).toBeVisible({ timeout: 30000 })
})

test('CADA detail page shows advice content', async ({ page }) => {
  await page.goto('/explore/cada/20237028')
  await page.waitForLoadState('networkidle')

  // Detail page shows the advice number
  await expect(page.getByRole('heading', { name: /20237028/ })).toBeVisible({ timeout: 30000 })
  // Breadcrumb is present
  await expect(page.getByText('Avis et conseils de la CADA')).toBeVisible()
})

test('CADA about section exists on index page', async ({ page }) => {
  await page.goto('/explore/cada')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Codifiées dans le')).toBeVisible()
})

test('clicking the Numéro de dossier link navigates to the CADA detail page', async ({ page }) => {
  await page.goto('/explore/cada')
  await page.waitForLoadState('networkidle')

  // Wait for rows to load
  await expect(page.getByText('Lignes').first()).toBeVisible({ timeout: 30000 })

  // Click the first Numéro de dossier link (rendered as an <a> by rowHref)
  const dossierLink = page.locator('table a.link').first()
  await dossierLink.waitFor({ timeout: 30000 })
  await dossierLink.click()

  // Should navigate to /explore/cada/<numero>
  await page.waitForURL(/\/explore\/cada\/\d+/, { timeout: 30000 })

  // Confirm detail page content loaded
  await expect(page.locator('h1').first()).toBeVisible()
})

test.describe('global search', () => {
  test('searching by exact dossier number finds the correct row', async ({ page }) => {
    await page.goto('/explore/cada')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await expect(page.getByText('Lignes').first()).toBeVisible({ timeout: 30000 })

    // Search by a known dossier number
    const searchInput = page.getByPlaceholder('Rechercher par objet, administration, thème, mots-clés…')
    await searchInput.fill('20112327')
    await searchInput.press('Enter')

    // Wait for results to reload
    await page.waitForTimeout(2000)

    // The exact dossier should be in the results
    await expect(page.locator('table').getByText('20 112 327').first()).toBeVisible()
  })

  test('searching by a non-numeric term does not cause API errors', async ({ page }) => {
    await page.goto('/explore/cada')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await expect(page.getByText('Lignes').first()).toBeVisible({ timeout: 30000 })

    // Search with a word — if __exact were incorrectly applied to number columns
    // the Tabular API would return a 500 error. The base test fixture catches console errors.
    const searchInput = page.getByPlaceholder('Rechercher par objet, administration, thème, mots-clés…')
    await searchInput.fill('cheval')
    await searchInput.press('Enter')

    // Wait for the query to complete — no console error = no API crash
    await page.waitForTimeout(2000)

    // Results may appear (text/categorical matches) — that's fine
    const hasRows = page.locator('table a.link').first()
    await expect(hasRows).toBeVisible({ timeout: 10000 })
  })
})
