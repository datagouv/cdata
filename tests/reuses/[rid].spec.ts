import { test, expect } from '@playwright/test'

const REUSE_SLUG = 'itineriz-deplacements-professionnels-jop-paris-2024'

test('page loads with correct title', async ({ page }) => {
  await page.goto(`/reuses/${REUSE_SLUG}`)

  await expect(page).toHaveTitle('Réutilisation - Itineriz - Déplacements professionnels JOP Paris 2024 | data.gouv.fr')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('description section displays correct metadata values', async ({ page }) => {
  await page.goto(`/reuses/${REUSE_SLUG}`)

  await expect(page.getByRole('heading', { name: 'Description' })).toBeVisible()

  // Verify metadata values in the sidebar
  await expect(page.getByText('Transports et mobilité')).toBeVisible()
  await expect(page.getByRole('definition').filter({ hasText: 'Application' })).toBeVisible()

  // Verify organization
  await expect(page.getByRole('link', { name: 'ALLOHOUSTON' }).first()).toBeVisible()
})

test('external link button is visible', async ({ page }) => {
  await page.goto(`/reuses/${REUSE_SLUG}`)

  const externalLink = page.getByRole('link', { name: 'Voir la réutilisation' }).first()
  await expect(externalLink).toBeVisible()
})

test('discussions tab is accessible', async ({ page }) => {
  await page.goto(`/reuses/${REUSE_SLUG}`)

  const discussionsTab = page.getByRole('link', { name: /Discussions/ })
  await expect(discussionsTab).toBeVisible()

  await discussionsTab.click()

  await page.waitForURL(`**/reuses/${REUSE_SLUG}/discussions`)
})
