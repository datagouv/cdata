import { test, expect } from '../base'

const DATASERVICE_SLUG = 'explore-api-v2-30'

test('page loads with correct title', async ({ page }) => {
  await page.goto(`/dataservices/${DATASERVICE_SLUG}`)

  await expect(page).toHaveTitle('API - Explore API v2 | data.gouv.fr')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('sidebar displays correct metadata values', async ({ page }) => {
  await page.goto(`/dataservices/${DATASERVICE_SLUG}`)

  // Verify producer
  await expect(page.getByText('Producteur')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Caisse des Dépôts' }).first()).toBeVisible()

  // Verify other metadata
  await expect(page.getByText('Dernière mise à jour')).toBeVisible()
  await expect(page.getByText('30 juillet 2024')).toBeVisible()

  await expect(page.getByText('Taux de disponibilité')).toBeVisible()
  await expect(page.getByText('Non communiqué')).toBeVisible()
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
