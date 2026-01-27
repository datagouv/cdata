import { test, expect } from '@playwright/test'
import { setupConsoleTracking } from '../helpers'

test('organizations page renders without errors', async ({ page }) => {
  const { annotateAndCheck } = setupConsoleTracking(page)

  const response = await page.goto('/organizations')
  expect(response?.status()).toBeLessThan(400)

  await expect(page).toHaveTitle(/Organisations/)
  await expect(page.getByRole('heading', { name: 'Organisations', level: 1 })).toBeVisible()

  await page.waitForLoadState('networkidle')
  annotateAndCheck()
})
