import { test, expect } from '../base'

const DATASERVICE_SLUG = 'explore-api-v2-30'

test('page loads with correct title', async ({ page }) => {
  await page.goto(`/dataservices/${DATASERVICE_SLUG}`)

  await expect(page).toHaveTitle('API - Explore API v2 | data.gouv.fr')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('sidebar displays correct metadata values', async ({ page }) => {
  await page.goto(`/dataservices/${DATASERVICE_SLUG}`)

  // Producer + contact (no section title)
  await expect(page.getByText('Producteur')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Caisse des Dépôts' }).first()).toBeVisible()

  // New section titles
  await expect(page.getByRole('heading', { name: `Conditions d'accès` })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Caractéristiques techniques' })).toBeVisible()

  // Technical block
  await expect(page.getByText('Dernière mise à jour')).toBeVisible()
  await expect(page.getByText('30 juillet 2024')).toBeVisible()
  await expect(page.getByText('Date de création')).toBeVisible()
  await expect(page.getByText('Taux de disponibilité')).toBeVisible()
  await expect(page.getByText('Non communiqué')).toBeVisible()
})

test('sidebar Swagger button reveals the viewer', async ({ page }) => {
  await page.goto(`/dataservices/${DATASERVICE_SLUG}`)
  await page.waitForLoadState('networkidle')

  const sidebarSwagger = page.locator('aside').getByRole('button', { name: 'Swagger' })
  await expect(sidebarSwagger).toBeVisible()

  await sidebarSwagger.click()

  await expect(page.getByTestId('swagger-viewer')).toBeVisible()
})

test('discussions tab is accessible', async ({ page }) => {
  await page.goto(`/dataservices/${DATASERVICE_SLUG}`)
  // Wait for Vue hydration before clicking NuxtLink (fix flaky test on Firefox)
  await page.waitForLoadState('networkidle')

  const discussionsTab = page.getByRole('link', { name: /Discussions/ })
  await expect(discussionsTab).toBeVisible()

  await discussionsTab.click()

  await expect(page).toHaveURL(`/dataservices/${DATASERVICE_SLUG}/discussions`)
})

test('reuses tab is accessible', async ({ page }) => {
  await page.goto(`/dataservices/${DATASERVICE_SLUG}`)
  // Wait for Vue hydration before clicking NuxtLink (fix flaky test on Firefox)
  await page.waitForLoadState('networkidle')

  const reusesTab = page.locator(`a[href="/dataservices/${DATASERVICE_SLUG}/reuses"]`)
  await expect(reusesTab).toBeVisible()

  await reusesTab.click()

  await expect(page).toHaveURL(`/dataservices/${DATASERVICE_SLUG}/reuses`)
})
