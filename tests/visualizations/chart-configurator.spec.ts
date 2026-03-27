import { test, expect } from '../base'

test('title input updates form value with debounce', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Titre').fill('Nouveau titre de graphique')

  // Wait for debounce (300ms as per component)
  await page.waitForTimeout(400)

  // The chart viewer should reflect the new title
  await expect(page).not.toContainText('Mon graphique')
})
