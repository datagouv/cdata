import type { APIRequestContext, Page, Route } from '@playwright/test'
import { test, expect } from './base'
import { createDataset, createOrganization, createReuse, deleteDatasets, deleteOrganizations, deleteReuses } from './helpers'

// `tests/metricsApi.ts` answers for metric-api.data.gouv.fr in every test of the suite, so no
// test depends on that third-party service. The tests below override it with their own answers:
// page routes take precedence over the context route it installs.
//
// The metrics API sits on another origin, so a fulfilled answer needs the CORS header the real
// one sends, otherwise the browser reports a CORS failure instead of what the test serves.
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' }

const answerWith = (json: object) => (route: Route) => route.fulfill({ json, headers: CORS_HEADERS })
const noMonthlyRow = answerWith({ data: [], links: { next: null } })

const createdDatasets: Array<string> = []
const createdOrganizations: Array<string> = []
const createdReuses: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
  await deleteReuses(request, createdReuses)
  await deleteOrganizations(request, createdOrganizations)
})

// The totals come from their own endpoint, and an object whose visits are all older than the 12
// months of the monthly endpoint still has one. Reading the totals under a condition on the
// monthly rows showed such an object a total of 0.
test.describe('all-time totals', () => {
  test('the dataset page shows its total even when no month carries a visit', async ({ page, request }) => {
    await page.route('**/api/datasets/data/**', noMonthlyRow)
    await page.route('**/api/datasets_total/data/**', answerWith({ data: [{ visit: 432, download_resource: 87 }] }))

    const dataset = await createDataset(request, `Test metrics totals ${Date.now()}`, 'Dataset pour tester les totaux des métriques')
    createdDatasets.push(dataset.id)

    await page.goto(`/datasets/${dataset.id}/`)

    await expect(page.getByText('Vues', { exact: true })).toBeVisible()
    await expect(page.getByText('432', { exact: true })).toBeVisible()
  })

  test('the reuse page shows its total even when no month carries a visit', async ({ page, request }) => {
    await page.route('**/api/reuses/data/**', noMonthlyRow)
    await page.route('**/api/reuses_total/data/**', answerWith({ data: [{ visit: 432 }] }))

    const reuse = await createReuse(request, `Test metrics totals ${Date.now()}`, `https://example.com/reuse-metrics-${Date.now()}`)
    createdReuses.push(reuse.id)

    await page.goto(`/reuses/${reuse.id}`)

    await expect(page.getByText('Vues', { exact: true })).toBeVisible()
    await expect(page.getByText('432', { exact: true })).toBeVisible()
  })

  test('the organization page shows its total even when no month carries a visit', async ({ page, request }) => {
    await page.route('**/api/organizations/data/**', noMonthlyRow)
    await page.route('**/api/organizations_total/data/**', answerWith({ data: [{ visit_dataset: 432, download_resource: 87, visit_dataservice: 21, visit_reuse: 9 }] }))

    const organization = await createOrganization(request, `Test metrics totals ${Date.now()}`)
    createdOrganizations.push(organization.id)

    await page.goto(`/organizations/${organization.id}/information`)
    await page.getByRole('button', { name: 'Voir les statistiques' }).click()

    await expect(page.getByText('Téléchargements des données')).toBeVisible()
    await expect(page.getByText('432', { exact: true })).toBeVisible()
  })
})

// The dataset page fetches the metrics API from the browser. When that service answers with an
// error or not at all, the rejection used to escape the page's watcher as an unhandled
// `TypeError: Failed to fetch` — the top client-side error reported on www.data.gouv.fr.
//
// Chromium logs the failed request itself whatever the app does, so that one message is allowed.
// What these tests assert is that nothing *else* reaches the console: no unhandled rejection,
// and a page that drops its stat boxes rather than showing a zero the API never returned.
test.describe('metrics API unavailable', () => {
  test.use({ allowedConsoleMessages: ['net::ERR_FAILED', 'the server responded with a status of 500'] })

  async function expectDatasetPageWithoutStatBoxes(page: Page, request: APIRequestContext) {
    const dataset = await createDataset(request, `Test metrics outage ${Date.now()}`, 'Dataset pour tester une panne de l\'API des métriques')
    createdDatasets.push(dataset.id)

    await page.goto(`/datasets/${dataset.id}/`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(dataset.title)
    await page.waitForLoadState('networkidle')

    // Control: the rest of the sidebar is there, so the absence below is the boxes going away,
    // not the page failing to render.
    await expect(page.getByText('Dernière mise à jour')).toBeVisible()
    await expect(page.getByText('Vues', { exact: true })).toBeHidden()
  }

  test('the dataset page survives an unreachable metrics API', async ({ page, request }) => {
    await page.route('**metric-api.data.gouv.fr/**', route => route.abort())

    await expectDatasetPageWithoutStatBoxes(page, request)
  })

  test('the dataset page survives a metrics API returning an error', async ({ page, request }) => {
    await page.route('**metric-api.data.gouv.fr/**', route => route.fulfill({ status: 500, contentType: 'text/html', body: '<html>oops</html>', headers: CORS_HEADERS }))

    await expectDatasetPageWithoutStatBoxes(page, request)
  })
})
