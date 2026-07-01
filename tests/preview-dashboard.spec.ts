import { test, expect } from './base'
import type { PreviewDashboardResource, PreviewDashboardFormatStat } from '../types/preview-dashboard'

const resourceId = '982d9dd0-365a-4c4b-8a83-75dec40c36bb'
const statsResourceId = '33cf9a65-3f77-4d88-acd1-bca420d83e60'

const resourcesData: PreviewDashboardResource[] = [
  {
    'id': 'resource-1',
    'titre': 'Données CSV',
    'url': 'https://example.com/resource-1',
    'source': 'https://example.com/dataset-1',
    'format déclaré': 'csv',
    'format détecté': 'text/csv',
    'format normalisé': 'csv',
    'famille': 'Tabulaire',
    'taille déclarée': 1024,
    'taille détectée': 1024,
    'téléchargements': 42,
    'dernière modification': '2026-06-30T10:00:00Z',
    'dernière maj tabular': '2026-06-30T12:00:00Z',
    'délai tabular (jours)': 0,
    'aperçus actifs': 'tabular',
    'a un aperçu': true,
    'a une erreur': false,
    'a un too big': false,
    'aperçu manquant': false,
    'erreur source inaccessible': false,
    'erreur analyse': false,
    'erreur cors': false,
    'erreur cors inconnu': false,
    'erreur fichier trop volumineux': false,
    'erreur taille inconnue': false,
    '__id': 1,
  },
]

const resourcesProfile = {
  profile: {
    header: [
      'id',
      'titre',
      'url',
      'source',
      'format déclaré',
      'format détecté',
      'format normalisé',
      'famille',
      'taille déclarée',
      'taille détectée',
      'téléchargements',
      'dernière modification',
      'dernière maj tabular',
      'délai tabular (jours)',
      'aperçus actifs',
      'a un aperçu',
      'a une erreur',
      'a un too big',
      'aperçu manquant',
      'erreur source inaccessible',
      'erreur analyse',
      'erreur cors',
      'erreur cors inconnu',
      'erreur fichier trop volumineux',
      'erreur taille inconnue',
    ],
    columns: {},
    formats: {},
    profile: {},
    encoding: 'utf-8',
    separator: ',',
    categorical: ['format déclaré', 'aperçus actifs', 'famille'],
    total_lines: 1,
    nb_duplicates: 0,
    columns_fields: {},
    columns_labels: {},
    header_row_idx: 0,
    heading_columns: 0,
    trailing_columns: 0,
  },
  deleted_at: null,
  dataset_id: '',
  indexes: null,
}

const statsData: PreviewDashboardFormatStat[] = [
  {
    'Famille de format': 'Tabulaire',
    'Format': 'csv',
    'Nombre': 10,
    'Prévisualisable': 5,
    '% catalogue': 2.5,
    '% erreur': 0.5,
    '% too big': 0.2,
    '% prévisualisable': 50,
    '% prévisualisation manquante': 0.3,
    'Mois': '2026-06',
    '__id': 1,
  },
]

const previousMonthStatsData: PreviewDashboardFormatStat[] = statsData.map(row => ({
  ...row,
  'Mois': '2026-05',
  'Nombre': row.Nombre - 3,
  'Prévisualisable': row['Prévisualisable'] - 1,
  '% prévisualisable': row['% prévisualisable'] - 5,
}))

const allStatsData: PreviewDashboardFormatStat[] = [...previousMonthStatsData, ...statsData]

test.describe('Preview dashboard', () => {
  test('renders tiered format stats and resources table in tabs', async ({ page }) => {
    await page.route(`**/api/resources/${resourceId}/data/**`, async (route) => {
      await route.fulfill({
        json: {
          data: resourcesData,
          meta: { page: 1, page_size: 50, total: 1 },
          links: { profile: '', swagger: '', next: null, prev: null },
        },
      })
    })

    await page.route(`**/api/resources/${resourceId}/profile/**`, async (route) => {
      await route.fulfill({ json: resourcesProfile })
    })

    await page.route(`**/api/resources/${statsResourceId}/data/**`, async (route) => {
      const url = new URL(route.request().url())
      const requestedMonth = url.searchParams.get('Mois__exact')
      const data = requestedMonth
        ? allStatsData.filter(row => row.Mois === requestedMonth)
        : allStatsData
      await route.fulfill({
        json: {
          data,
          meta: { page: 1, page_size: 100, total: data.length },
          links: { profile: '', swagger: '', next: null, prev: null },
        },
      })
    })

    await page.goto('/admin/beta/preview-dashboard')

    await page.waitForResponse(`**/api/resources/${resourceId}/data/**`)
    await page.waitForResponse(`**/api/resources/${statsResourceId}/data/**`)
    await page.waitForResponse(`**/api/resources/${statsResourceId}/data/**`)

    await expect(page.getByRole('heading', { name: 'Tableau de bord des aperçus' })).toBeVisible()
    await expect(page.getByText('Statistiques par format')).toBeVisible()
    await expect(page.getByText('Tabulaire')).toBeVisible()

    await page.getByText('Tabulaire').click()
    await expect(page.getByRole('cell', { name: 'csv' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '10' })).toBeVisible()

    await page.getByRole('tab', { name: 'Fichiers' }).click()
    await expect(page.getByRole('cell', { name: 'Données CSV' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'csv' })).toBeVisible()
  })

  test('navigates to the filtered Fichiers tab when clicking a format name', async ({ page }) => {
    await page.route(`**/api/resources/${resourceId}/data/**`, async (route) => {
      await route.fulfill({
        json: {
          data: resourcesData,
          meta: { page: 1, page_size: 50, total: 1 },
          links: { profile: '', swagger: '', next: null, prev: null },
        },
      })
    })

    await page.route(`**/api/resources/${resourceId}/profile/**`, async (route) => {
      await route.fulfill({ json: resourcesProfile })
    })

    await page.route(`**/api/resources/${statsResourceId}/data/**`, async (route) => {
      const url = new URL(route.request().url())
      const requestedMonth = url.searchParams.get('Mois__exact')
      const data = requestedMonth
        ? allStatsData.filter(row => row.Mois === requestedMonth)
        : allStatsData
      await route.fulfill({
        json: {
          data,
          meta: { page: 1, page_size: 100, total: data.length },
          links: { profile: '', swagger: '', next: null, prev: null },
        },
      })
    })

    await page.goto('/admin/beta/preview-dashboard')

    await page.waitForResponse(`**/api/resources/${resourceId}/data/**`)
    await page.waitForResponse(`**/api/resources/${statsResourceId}/data/**`)
    await page.waitForResponse(`**/api/resources/${statsResourceId}/data/**`)

    await page.getByText('Tabulaire').click()
    await page.getByRole('link', { name: 'csv' }).click()

    await expect(page).toHaveURL(/[?&]tab=fichiers/)
    await expect(page).toHaveURL(/[?&]format=csv/)

    await expect(page.getByRole('tab', { name: 'Fichiers' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByText('format normalisé = csv')).toBeVisible()
  })

  test('shows month-over-month deltas for Nombre and % prévisualisable', async ({ page }) => {
    await page.route(`**/api/resources/${resourceId}/data/**`, async (route) => {
      await route.fulfill({
        json: {
          data: resourcesData,
          meta: { page: 1, page_size: 50, total: 1 },
          links: { profile: '', swagger: '', next: null, prev: null },
        },
      })
    })

    await page.route(`**/api/resources/${resourceId}/profile/**`, async (route) => {
      await route.fulfill({ json: resourcesProfile })
    })

    await page.route(`**/api/resources/${statsResourceId}/data/**`, async (route) => {
      const url = new URL(route.request().url())
      const requestedMonth = url.searchParams.get('Mois__exact')
      const data = requestedMonth
        ? allStatsData.filter(row => row.Mois === requestedMonth)
        : allStatsData
      await route.fulfill({
        json: {
          data,
          meta: { page: 1, page_size: 100, total: data.length },
          links: { profile: '', swagger: '', next: null, prev: null },
        },
      })
    })

    await page.goto('/admin/beta/preview-dashboard')

    await page.waitForResponse(`**/api/resources/${resourceId}/data/**`)
    await page.waitForResponse(`**/api/resources/${statsResourceId}/data/**`)
    await page.waitForResponse(`**/api/resources/${statsResourceId}/data/**`)

    await page.getByText('Tabulaire').click()

    const familyRow = page.locator('tr', { hasText: /^Tabulaire$/ }).first()
    await expect(familyRow).toBeVisible()
    await expect(familyRow.locator('td').nth(1)).toContainText('+')
    await expect(familyRow.locator('td').nth(7)).toContainText('+')

    const formatRow = page.locator('tr', { hasText: 'csv' }).first()
    await expect(formatRow.locator('td').nth(1)).toContainText('+')
    await expect(formatRow.locator('td').nth(7)).toContainText('+')
  })
})
