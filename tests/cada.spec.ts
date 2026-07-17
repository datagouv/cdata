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
