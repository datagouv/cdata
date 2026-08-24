import type { BrowserContext } from '@playwright/test'

// Every page rendering metrics (dataset, reuse, dataservice, organization)
// fetches metric-api.data.gouv.fr from the browser, so an outage of that
// third-party service used to fail unrelated tests.
//
// The app now survives such an outage (see `fetchMetrics` in the components
// package, and metrics-outage.spec.ts), but that is not enough for the suite:
// Chromium logs `Failed to load resource: net::ERR_*` for the failed request
// whatever the app does with the rejection, and assertNoConsoleErrors sees it.
// This fake answers the same shapes for any entity id, so no test depends on a
// service outside the machine running it.
//
// A test that wants the outage itself declares its own `page.route` — page
// routes take precedence over the context route installed here.

const METRICS_API = process.env.NUXT_PUBLIC_METRICS_API || 'https://metric-api.data.gouv.fr'

const MONTHS_COUNT = 12

// Parallel lists: `TOTAL_METRICS[i]` is the sum, over the returned months, of
// `MONTHLY_METRICS[i]`. Every row carries every metric — the API has one
// endpoint family per model, but the callers only read the fields they know.
const MONTHLY_METRICS = ['monthly_visit', 'monthly_download_resource', 'monthly_visit_dataset', 'monthly_visit_dataservice', 'monthly_visit_reuse']
const TOTAL_METRICS = ['visit', 'download_resource', 'visit_dataset', 'visit_dataservice', 'visit_reuse']

/** `YYYY-MM` of the month `monthsAgo` months before the current one. */
function metricMonth(monthsAgo: number): string {
  const now = new Date()
  const month = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
}

// Distinct per month and per metric, so a component reading the wrong series
// shows a wrong number instead of the same number as its neighbour.
const monthlyValue = (monthsAgo: number, metricIndex: number) => (MONTHS_COUNT - monthsAgo) * 10 + metricIndex

// Most recent month first, matching `metric_month__sort=desc`.
const monthlyRows = () => Array.from({ length: MONTHS_COUNT }, (_, monthsAgo) => ({
  metric_month: metricMonth(monthsAgo),
  ...Object.fromEntries(MONTHLY_METRICS.map((metric, index) => [metric, monthlyValue(monthsAgo, index)])),
}))

const totalRow = () => Object.fromEntries(TOTAL_METRICS.map((metric, index) => [
  metric,
  Array.from({ length: MONTHS_COUNT }, (_, monthsAgo) => monthlyValue(monthsAgo, index)).reduce((sum, value) => sum + value, 0),
]))

// The app reads these cross-origin from the browser, so the mocked responses
// need the header the real API sends.
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' }

export async function fakeMetricsApi(context: BrowserContext): Promise<void> {
  await context.route(`${METRICS_API}/**`, async (route) => {
    const url = new URL(route.request().url())

    // The `/csv/` endpoints are only ever used as download hrefs, never fetched.
    if (url.pathname.endsWith('/csv/')) {
      await route.fulfill({ contentType: 'text/csv', body: '', headers: CORS_HEADERS })
      return
    }

    if (url.pathname.includes('_total/')) {
      await route.fulfill({ json: { data: [totalRow()], links: { next: null } }, headers: CORS_HEADERS })
      return
    }

    // Echo the filtered entity back on each row: the organization CSV export
    // reads `dataset_id` from the rows it receives.
    const filters = Object.fromEntries(
      [...url.searchParams]
        .filter(([key]) => key.endsWith('_id__exact'))
        .map(([key, value]) => [key.replace('__exact', ''), value]),
    )

    const rows = monthlyRows().map(row => ({ ...row, ...filters }))
    if (url.searchParams.get('metric_month__sort') === 'asc') rows.reverse()

    const pageSize = Number(url.searchParams.get('page_size')) || MONTHS_COUNT
    await route.fulfill({ json: { data: rows.slice(0, pageSize), links: { next: null } }, headers: CORS_HEADERS })
  })
}
