import { test, expect } from './base'

const REUSE_SLUG = 'itineriz-deplacements-professionnels-jop-paris-2024'
const DATASET_SLUG = 'base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret'
const ORG_SLUG = 'sobrana'

// The metrics API is a third party, so these tests serve its answers themselves: the real one
// would make both the displayed figures and the failure path depend on production data.
const MONTHS = { data: [{ metric_month: '2025-06', monthly_visit: 120, monthly_download_resource: 34, monthly_visit_dataset: 120, monthly_visit_dataservice: 7, monthly_visit_reuse: 12 }] }

test.describe('metrics answered by the API', () => {
  test('the reuse page shows the all-time total even when no month carries a visit', async ({ page }) => {
    // The monthly endpoint is empty while the totals endpoint is not: reading the total is
    // conditioned on the totals answer, not on the monthly one, otherwise a reuse whose visits
    // are all older than 12 months shows 0.
    await page.route('**/api/reuses/data/**', route => route.fulfill({ json: { data: [] } }))
    await page.route('**/api/reuses_total/data/**', route => route.fulfill({ json: { data: [{ visit: 432 }] } }))

    await page.goto(`/reuses/${REUSE_SLUG}`)

    await expect(page.getByText('Vues', { exact: true })).toBeVisible()
    await expect(page.getByText('432', { exact: true })).toBeVisible()
  })

  test('the dataset page shows its stat boxes', async ({ page }) => {
    await page.route('**/api/datasets/data/**', route => route.fulfill({ json: MONTHS }))
    await page.route('**/api/datasets_total/data/**', route => route.fulfill({ json: { data: [{ visit: 432, download_resource: 87 }] } }))

    await page.goto(`/datasets/${DATASET_SLUG}/`)

    await expect(page.getByText('Vues', { exact: true })).toBeVisible()
    await expect(page.getByText('432', { exact: true })).toBeVisible()
  })

  test('the organization information tab shows its stat boxes', async ({ page }) => {
    await page.route('**/api/organizations/data/**', route => route.fulfill({ json: MONTHS }))
    await page.route('**/api/organizations_total/data/**', route => route.fulfill({ json: { data: [{ visit_dataset: 432, download_resource: 87, visit_dataservice: 21, visit_reuse: 9 }] } }))

    await page.goto(`/organizations/${ORG_SLUG}/information`)
    await page.getByRole('button', { name: 'Voir les statistiques' }).click()

    const stats = page.locator('[data-type="accordion"]').first()
    await expect(stats.getByText('Téléchargements des données')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Télécharger les statistiques au format CSV' })).toBeVisible()
  })
})

test.describe('metrics API unavailable', () => {
  // The failing answers below are the point of these tests, not an accident.
  test.use({ allowedConsoleMessages: ['the server responded with a status of 500'] })

  const breakMetricsApi = (route: { fulfill: (response: object) => Promise<void> }) => route.fulfill({
    status: 500,
    contentType: 'application/json',
    // The metrics API is on another origin: without this header the browser reports a CORS
    // failure instead of the 500 the test means to serve.
    headers: { 'access-control-allow-origin': '*' },
    body: '{"detail":"boom"}',
  })

  test('the reuse page hides its stat box rather than showing zeroes', async ({ page }) => {
    await page.route('**/api/reuses/data/**', breakMetricsApi)
    await page.route('**/api/reuses_total/data/**', breakMetricsApi)

    await page.goto(`/reuses/${REUSE_SLUG}`)

    // Control: the page itself did render, so the absence below is not a blank page.
    await expect(page.getByRole('heading', { name: 'Description' })).toBeVisible()
    await expect(page.getByText('Vues', { exact: true })).toBeHidden()
  })

  test('the dataset page hides its stat boxes rather than showing zeroes', async ({ page }) => {
    await page.route('**/api/datasets/data/**', breakMetricsApi)
    await page.route('**/api/datasets_total/data/**', breakMetricsApi)

    await page.goto(`/datasets/${DATASET_SLUG}/`)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Vues', { exact: true })).toBeHidden()
  })

  test('the organization information tab hides the metrics section rather than showing zeroes', async ({ page }) => {
    await page.route('**/api/organizations/data/**', breakMetricsApi)
    await page.route('**/api/organizations_total/data/**', breakMetricsApi)

    await page.goto(`/organizations/${ORG_SLUG}/information`)
    await page.getByRole('button', { name: 'Voir les statistiques' }).click()

    // The boxes fed by the organization itself stay: only the metrics API ones go away.
    const stats = page.locator('[data-type="accordion"]').first()
    await expect(stats.getByText('Jeux de données', { exact: true })).toBeVisible()
    await expect(stats.getByText('Téléchargements des données')).toBeHidden()
  })
})
