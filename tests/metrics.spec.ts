import { readFile } from 'node:fs/promises'
import type { APIRequestContext, Page, Route } from '@playwright/test'
import { test, expect } from './base'
import { createDataset, createOrganization, createReuse, deleteDatasets, deleteOrganizations, deleteReuses } from './helpers'
import { CORS_HEADERS, METRICS_API, metricMonth } from './metricsApi'

// `tests/metricsApi.ts` answers for the metrics API in every test of the suite, so no test
// depends on that third-party service. The tests below override it with their own answers:
// page routes take precedence over the context route it installs.
//
// The metrics API sits on another origin, so a fulfilled answer needs the CORS header the real
// one sends, otherwise the browser reports a CORS failure instead of what the test serves.

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

// The organization CSV is built in the browser and served as a `blob:` URL. Given to a link as
// `href`, `NuxtLink` drops it and the button renders as an anchor that can't be clicked.
test.describe('aggregated statistics download', () => {
  async function expectAggregatedStatsDownload(page: Page, buttonName: string, organizationSlug: string) {
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: buttonName }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe(`${organizationSlug}-stats.csv`)
    const lines = (await readFile(await download.path(), 'utf-8')).trim().split('\n')
    expect(lines[0]).toBe('month,visit_datasets,download_resource,visit_dataservice,visit_reuse')
    // Values of the current month served by tests/metricsApi.ts, one per metric.
    expect(lines[1]).toBe(`${metricMonth(0)},122,121,123,124`)
    expect(lines).toHaveLength(13)
  }

  test('downloads the CSV from the organization page', async ({ page, request }) => {
    const organization = await createOrganization(request, `Test metrics download ${Date.now()}`)
    createdOrganizations.push(organization.id)

    await page.goto(`/organizations/${organization.id}/information`)
    await page.getByRole('button', { name: 'Voir les statistiques' }).click()

    await expectAggregatedStatsDownload(page, 'Télécharger les statistiques au format CSV', organization.slug)
  })

  test('downloads the CSV from the organization admin metrics page', async ({ page, request }) => {
    const organization = await createOrganization(request, `Test metrics download ${Date.now()}`)
    createdOrganizations.push(organization.id)

    await page.goto(`/admin/organizations/${organization.id}/metrics`)

    await expectAggregatedStatsDownload(page, 'Télécharger les statistiques agrégées', organization.slug)
  })
})

// Every page below fetches the metrics API from the browser. When that service answers with an
// error or not at all, the rejection used to escape the page's watcher as an unhandled
// `TypeError: Failed to fetch` — the top client-side error reported on www.data.gouv.fr.
//
// The browser logs the failed request itself whatever the app does, so those messages are
// allowed. What these tests assert is that nothing *else* reaches the console: no unhandled
// rejection, and a page that drops its stat boxes rather than showing a zero the API never
// returned.
//
// Each page hides a different piece of markup — a `<div>` inside a grid, a `<div>` inside a
// `<dl>`, a `<template>` wrapping a divider — so each one is covered rather than assumed to
// behave like the dataset page.
test.describe('metrics API unavailable', () => {
  // An aborted cross-origin request is worded per engine, so both spellings are needed — a
  // Chromium-only list fails the whole describe on the Firefox shards. `CORS request did not
  // succeed` is Firefox's wording for "the request never completed", distinct from the missing
  // `Access-Control-Allow-Origin` it reports when the header is the actual problem.
  test.use({ allowedConsoleMessages: [
    'net::ERR_FAILED',
    'CORS request did not succeed',
    'the server responded with a status of 500',
  ] })

  const abortMetrics = (page: Page) => page.route(`${METRICS_API}/**`, route => route.abort())
  const failMetrics = (page: Page) => page.route(`${METRICS_API}/**`, route => route.fulfill({ status: 500, contentType: 'text/html', body: '<html>oops</html>', headers: CORS_HEADERS }))

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
    await abortMetrics(page)

    await expectDatasetPageWithoutStatBoxes(page, request)
  })

  test('the dataset page survives a metrics API returning an error', async ({ page, request }) => {
    await failMetrics(page)

    await expectDatasetPageWithoutStatBoxes(page, request)
  })

  test('the reuse page survives an unreachable metrics API', async ({ page, request }) => {
    await abortMetrics(page)

    const reuse = await createReuse(request, `Test metrics outage ${Date.now()}`, `https://example.com/reuse-metrics-outage-${Date.now()}`)
    createdReuses.push(reuse.id)

    await page.goto(`/reuses/${reuse.id}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(reuse.title)
    await page.waitForLoadState('networkidle')

    // Control: the sibling entries of the same `<dl>` are still there.
    await expect(page.getByText('Date de création')).toBeVisible()
    await expect(page.getByText('Vues', { exact: true })).toBeHidden()
  })

  test('the organization page survives an unreachable metrics API', async ({ page, request }) => {
    await abortMetrics(page)

    const organization = await createOrganization(request, `Test metrics outage ${Date.now()}`)
    createdOrganizations.push(organization.id)

    await page.goto(`/organizations/${organization.id}/information`)
    await page.getByRole('button', { name: 'Voir les statistiques' }).click()
    await page.waitForLoadState('networkidle')

    // Control: the section itself is still rendered, so the absence below is the boxes going
    // away rather than the section failing to open. Its own title is used because the box
    // titles above the divider ("Jeux de données"…) also name the navigation tabs.
    await expect(page.getByText('Statistiques générales des 12 derniers mois')).toBeVisible()
    await expect(page.getByText('Téléchargements des données')).toBeHidden()
  })
})
