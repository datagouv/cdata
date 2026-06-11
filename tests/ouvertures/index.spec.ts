import { expect } from '@playwright/test'
import { test } from '../base'

test('shows the hero and the two category cards', async ({ page }) => {
  await page.goto('/ouvertures')

  await expect(page.getByRole('heading', { level: 1, name: 'Suivre les ouvertures et mises à disposition de données publiques' })).toBeVisible()

  const demandesCard = page.getByRole('link', { name: 'Demandes d\'ouvertures et engagements ministériels' })
  await expect(demandesCard).toBeVisible()
  await expect(demandesCard).toContainText('Suivre les prochaines publications de données ouvertes ou restreintes')

  // The HVD table still lives on the legacy site.
  const hvdCard = page.getByRole('link', { name: 'Données de forte valeur' })
  await expect(hvdCard).toBeVisible()
  await expect(hvdCard).toHaveAttribute('href', 'https://ouverture.data.gouv.fr/donnees_de_forte_valeur.html')
})

test('navigates to the tracking table from the first card', async ({ page }) => {
  // The tracking table page fetches its Grist tables on mount; the endpoint is
  // not available in CI so it is mocked with empty tables.
  await page.route(/\/tables\/[^/]*\/records$/, route => route.fulfill({ json: { records: [] } }))
  await page.goto('/ouvertures')

  await page.getByRole('link', { name: 'Demandes d\'ouvertures et engagements ministériels' }).click()
  await expect(page).toHaveURL(/\/ouvertures\/suivi$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Suivre les publications de données et les engagements ministériels' })).toBeVisible()
})
