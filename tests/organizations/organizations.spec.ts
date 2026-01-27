import { test, expect } from '../base'

test('organizations page renders without errors', async ({ page }) => {
  const response = await page.goto('/organizations')
  expect(response?.status()).toBeLessThan(400)

  await expect(page).toHaveTitle(/Organisations/)
  await expect(page.getByRole('heading', { name: 'Organisations', level: 1 })).toBeVisible()

  await page.waitForLoadState('networkidle')
})
