import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { test } from '../base'

// The HVD table loads its data from the "Hvd" Grist table. The Grist endpoint is
// not available in CI (NUXT_PUBLIC_HVD_GRIST_* are empty by default), so every test
// mocks it through page.route.
//
// The page fetches via useFetch, which runs server-side on a direct page.goto and
// can't be intercepted by page.route. We therefore reach the page through a
// client-side navigation from the index, where the fetch runs in the browser and
// the mock applies.

const HVD_RECORDS = {
  records: [
    {
      id: 1,
      fields: {
        Titre: 'Zèbre',
        Ensemble_de_donnees: 'Adresses',
        Thematique: 'Géospatiales',
        // Different ministère / producteur per channel: merged and deduplicated.
        Ministere_de_tutelle_Telechargement: 'Ministère A',
        Ministere_de_tutelle_API: 'Ministère B',
        Producteur_Telechargement: 'IGN',
        Producteur_API: 'IGN',
        Statut_Telechargement: 'Disponible sur data.gouv.fr',
        URL_Telechargement: 'https://www.data.gouv.fr/datasets/zebre',
        Statut_API: 'Non disponible',
        URL_API: '',
      },
    },
    {
      id: 2,
      fields: {
        Titre: 'Abeille',
        Ensemble_de_donnees: 'Alertes météorologiques',
        Thematique: 'Météorologiques',
        Ministere_de_tutelle_Telechargement: '',
        Ministere_de_tutelle_API: 'Ministère C',
        Producteur_Telechargement: '',
        Producteur_API: 'Météo-France',
        Statut_Telechargement: '',
        URL_Telechargement: '',
        Statut_API: 'Disponible',
        URL_API: 'https://www.data.gouv.fr/dataservices/abeille',
      },
    },
    {
      id: 3,
      fields: {
        // Empty title — must be sorted last.
        Titre: '',
        Ensemble_de_donnees: 'Autre ensemble',
        Thematique: 'Mobilité',
        Ministere_de_tutelle_Telechargement: '',
        Ministere_de_tutelle_API: '',
        Producteur_Telechargement: '',
        Producteur_API: '',
        Statut_Telechargement: 'Planifié',
        URL_Telechargement: '',
        Statut_API: '',
        URL_API: '',
      },
    },
    {
      id: 4,
      // Fully empty Grist row: must not produce a table row.
      fields: {
        Titre: '',
        Ensemble_de_donnees: '',
        Thematique: '',
        Ministere_de_tutelle_Telechargement: '',
        Ministere_de_tutelle_API: '',
        Producteur_Telechargement: '',
        Producteur_API: '',
        Statut_Telechargement: '',
        URL_Telechargement: '',
        Statut_API: '',
        URL_API: '',
      },
    },
  ],
}

const GRIST_TABLE_ROUTE = /\/tables\/[^/]*\/records(\?|$)/

async function gotoHvdPage(page: Page) {
  await page.route(GRIST_TABLE_ROUTE, route => route.fulfill({ json: HVD_RECORDS }))
  await page.goto('/suivi-de-publication')
  await page.getByRole('link', { name: 'Données de forte valeur' }).click()
  await expect(page).toHaveURL(/\/suivi-de-publication\/donnees-de-forte-valeur$/)
}

test('displays the enriched HVD records sorted by title', async ({ page }) => {
  await gotoHvdPage(page)

  await expect(page.getByRole('heading', { level: 1, name: 'Suivi de l\'ouverture des données de forte valeur' })).toBeVisible()

  const rows = page.locator('.grist-table-viewer tbody tr')
  // 3 rows and not 4: the fully empty Grist record must not be displayed.
  await expect(rows).toHaveCount(3)

  // Sorted by title, records without a title last.
  await expect(rows.locator('td:first-child .font-medium')).toHaveText(['Abeille', 'Zèbre', '-'])

  const zebreRow = rows.nth(1)
  await expect(zebreRow.locator('td').nth(1)).toHaveText('Adresses')
  await expect(zebreRow.locator('td').nth(2)).toContainText('Géospatiales')
  // Both ministères are merged into a single cell.
  await expect(zebreRow.locator('td').nth(3)).toContainText('Ministère A')
  await expect(zebreRow.locator('td').nth(3)).toContainText('Ministère B')
  // Same producteur on both channels is deduplicated to a single value.
  await expect(zebreRow.locator('td').nth(4)).toHaveText('IGN')
})

test('links the status badges to the published data', async ({ page }) => {
  await gotoHvdPage(page)

  const zebreRow = page.locator('.grist-table-viewer tbody tr').nth(1)
  // "Disponible sur data.gouv.fr" links to the dataset url.
  const telechargementLink = zebreRow.locator('td').nth(5).getByRole('link')
  await expect(telechargementLink).toHaveAttribute('href', 'https://www.data.gouv.fr/datasets/zebre')
  // "Non disponible" has no url and is not a link.
  await expect(zebreRow.locator('td').nth(6).getByRole('link')).toHaveCount(0)
  await expect(zebreRow.locator('td').nth(6)).toContainText('Non disponible')
})

test('filters the records and syncs the selection to the URL', async ({ page }) => {
  await gotoHvdPage(page)

  const rows = page.locator('.grist-table-viewer tbody tr')
  await expect(rows).toHaveCount(3)

  await page.getByLabel('Statut Téléchargement', { exact: true }).selectOption('Planifié')
  await expect(rows).toHaveCount(1)
  // The record with the "Planifié" download status has no title.
  await expect(rows.first().locator('td:first-child .font-medium')).toHaveText('-')
  await expect(page).toHaveURL(/statut-telechargement=Planifi/)

  await page.getByRole('button', { name: 'Ré-initialiser tous les filtres' }).click()
  await expect(rows).toHaveCount(3)
})
