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
  private: true,
  series: [{ type: 'line', column_y: 'valeur', aggregate_y: 'sum', resource_id: 'resource-1', column_x_name_override: null, filters: null }],
  metrics: { views: 7 },
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/1/visualizations/**', async (route) => {
    await route.fulfill({ json: { data: [histogramChart, lineChart], page: 1, page_size: 2, total: 2 } })
  })
  await page.goto('/design/cards')
})

test('chart cards display title, organization, update date, views and description', async ({ page }) => {
  const histogramCard = page.locator('article').filter({ hasText: 'Histogramme de démonstration' })
  await expect(histogramCard).toBeVisible()
  await expect(histogramCard.getByRole('link', { name: 'Histogramme de démonstration' })).toBeVisible()
  await expect(histogramCard.getByText('Organisation certifiée')).toBeVisible()
  await expect(histogramCard.getByText('Mis à jour')).toBeVisible()
  await expect(histogramCard.locator('[aria-label="42 vues"]')).toBeVisible()
  await expect(histogramCard.getByText('Un histogramme de démonstration pour la carte.')).toBeVisible()

  const lineCard = page.locator('article').filter({ hasText: 'Courbe de démonstration' })
  await expect(lineCard).toBeVisible()
  await expect(lineCard.locator('[aria-label="7 vues"]')).toBeVisible()
})

test('chart card with image displays an img, without image a placeholder', async ({ page }) => {
  const histogramCard = page.locator('article').filter({ hasText: 'Histogramme de démonstration' })
  await expect(histogramCard.locator('img')).toHaveCount(1)

  const lineCard = page.locator('article').filter({ hasText: 'Courbe de démonstration' })
  await expect(lineCard.locator('img')).toHaveCount(0)
  await expect(lineCard.locator('div.bg-gray-lower')).toBeVisible()
})

test('chart card title link points to the chart page', async ({ page }) => {
  const link = page.getByRole('link', { name: 'Histogramme de démonstration' })
  await expect(link).toHaveAttribute('href', /\/visualizations\/histogramme-de-demonstration\//)
})

test('private chart card displays a draft badge, public chart card does not', async ({ page }) => {
  const lineCard = page.locator('article').filter({ hasText: 'Courbe de démonstration' })
  await expect(lineCard.getByText('Brouillon')).toBeVisible()

  const histogramCard = page.locator('article').filter({ hasText: 'Histogramme de démonstration' })
  await expect(histogramCard.getByText('Brouillon')).not.toBeVisible()
})
