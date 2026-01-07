import { test, expect } from '@playwright/test'

const ORG_SLUG = 'sobrana'

test('page loads with correct organization name', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}`)

  await expect(page).toHaveTitle('Organisation - SOBRANA | data.gouv.fr')

  // Verify organization name in heading
  await expect(page.getByRole('heading', { level: 1, name: /SOBRANA/i })).toBeVisible()
})

test('tabs display correct counts', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}`)

  await expect(page.getByRole('link', { name: 'Présentation' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Jeux de données 0' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'API 0' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Réutilisations 1' })).toBeVisible()
})

test('datasets tab shows organization datasets', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}/datasets`)

  await expect(page).toHaveURL(/\/organizations\/sobrana\/datasets/)
})
