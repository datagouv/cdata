import { test, expect } from '../base'

const organization = {
  class: 'Organization',
  id: 'org-chart-card',
  name: 'Organisation certifiée',
  acronym: null,
  slug: 'organisation-certifiee',
  uri: 'http://dev.local:7000/api/1/organizations/organisation-certifiee/',
  page: 'http://dev.local:3000/organizations/organisation-certifiee/',
  logo: '/_balls.svg',
  logo_thumbnail: '/_balls.svg',
  badges: [{ kind: 'certified' }, { kind: 'public-service' }],
}

const histogramChart = {
  id: 'chart-histogram',
  title: 'Histogramme de démonstration',
  slug: 'histogramme-de-demonstration',
  description: 'Un histogramme de démonstration pour la carte.',
  private: false,
  created_at: '2024-01-10T10:00:00.000Z',
  last_modified: '2024-01-15T10:00:00.000Z',
  deleted_at: null,
  uri: 'http://dev.local:7000/api/1/visualizations/chart-histogram/',
  page: 'http://dev.local:3000/visualizations/histogramme-de-demonstration/',
  image: '/_balls.svg',
  x_axis: { column_x: 'annee', sort_x_by: null, sort_x_direction: null, type: 'discrete' },
  y_axis: { min: null, max: null, label: null, unit: null, unit_position: 'suffix' },
  series: [{ type: 'histogram', column_y: 'valeur', aggregate_y: 'sum', resource_id: 'resource-1', column_x_name_override: null, filters: null }],
  extras: {},
  permissions: { delete: false, edit: false, read: true },
  metrics: { views: 42 },
  organization,
  owner: null,
}

const lineChart = {
  ...histogramChart,
  id: 'chart-line',
  title: 'Courbe de démonstration',
  slug: 'courbe-de-demonstration',
  description: 'Une courbe de démonstration pour la carte.',
  page: 'http://dev.local:3000/visualizations/courbe-de-demonstration/',
  image: null,
  series: [{ type: 'line', column_y: 'valeur', aggregate_y: 'sum', resource_id: 'resource-1', column_x_name_override: null, filters: null }],
  metrics: { views: 7 },
}

test.describe('with charts', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/1/visualizations/**', async (route) => {
      await route.fulfill({ json: { data: [histogramChart, lineChart], page: 1, page_size: 20, total: 2 } })
    })
    await page.goto('/admin/site/charts')
  })

  test('lists chart cards with the total count', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '2 graphiques' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Histogramme de démonstration' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Courbe de démonstration' })).toBeVisible()
    await expect(page.locator('article').filter({ hasText: 'Histogramme de démonstration' }).getByText('Organisation certifiée')).toBeVisible()
  })

  test('chart cards link to the admin edit page', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Histogramme de démonstration' })).toHaveAttribute('href', '/admin/beta/charts/chart-histogram')
    await expect(page.getByRole('link', { name: 'Courbe de démonstration' })).toHaveAttribute('href', '/admin/beta/charts/chart-line')
  })
})

test.describe('without charts', () => {
  test('shows the empty state', async ({ page }) => {
    await page.route('**/api/1/visualizations/**', async (route) => {
      await route.fulfill({ json: { data: [], page: 1, page_size: 20, total: 0 } })
    })
    await page.goto('/admin/site/charts')

    await expect(page.getByText(`Il n'y a pas encore de graphique sur le site`)).toBeVisible()
  })
})
