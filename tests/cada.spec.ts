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
