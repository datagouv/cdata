import { test, expect } from './base'
import type { PreviewDashboardResource, PreviewDashboardFormatStat } from '../types/preview-dashboard'

const resourceId = '982d9dd0-365a-4c4b-8a83-75dec40c36bb'
const statsResourceId = '33cf9a65-3f77-4d88-acd1-bca420d83e60'

const resourcesData: PreviewDashboardResource[] = [
  {
    'id': 'resource-1',
    'title': 'Données CSV',
    'url': 'https://example.com/resource-1',
    'format renseigné': 'csv',
    'format détecté': 'text/csv',
    'filesize renseignée': 1024,
    'filesize détectée': 1024,
    'source': 'https://example.com/dataset-1',
    'previews': 'tabular',
    'tabular preview last update': '2026-06-30T12:00:00Z',
    'format normalisé': 'csv',
    'famille': 'Tabulaire',
    'a un aperçu': true,
    'a une erreur': false,
    'a un too big': false,
    'err source unreachable': false,
    'err parsing error': false,
    'err no parsing table': false,
    'err cors blocked': false,
    'err cors unknown': false,
    'err file too big': false,
    'err unknown size': false,
    '__id': 1,
  },
]

const resourcesProfile = {
  profile: {
    header: [
      'id',
      'title',
      'url',
      'format renseigné',
      'format détecté',
      'filesize renseignée',
      'filesize détectée',
      'source',
      'previews',
      'tabular preview last update',
      'format normalisé',
      'famille',
      'a un aperçu',
      'a une erreur',
      'a un too big',
      'err source unreachable',
      'err parsing error',
      'err no parsing table',
      'err cors blocked',
      'err cors unknown',
      'err file too big',
      'err unknown size',
    ],
    columns: {},
    formats: {},
    profile: {},
    encoding: 'utf-8',
    separator: ',',
    categorical: ['format renseigné', 'previews', 'famille'],
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
    'Mois': '2026-06',
    '__id': 1,
  },
]

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
      await route.fulfill({
        json: {
          data: statsData,
          meta: { page: 1, page_size: 100, total: 1 },
          links: { profile: '', swagger: '', next: null, prev: null },
        },
      })
    })

    await page.goto('/admin/beta/preview-dashboard')

    await page.waitForResponse(`**/api/resources/${resourceId}/data/**`)
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
})
