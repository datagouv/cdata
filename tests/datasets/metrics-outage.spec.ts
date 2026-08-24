import type { APIRequestContext, Page } from '@playwright/test'
import { test, expect } from '../base'
import { createDataset, deleteDatasets } from '../helpers'

// The dataset page fetches the metrics API from the browser. When that service
// answers with an error or not at all, the rejection used to escape the page's
// watcher as an unhandled `TypeError: Failed to fetch` — the top client-side
// error reported on www.data.gouv.fr.
//
// Chromium logs the failed request itself whatever the app does, so that one
// message is allowed. What these tests assert is that nothing *else* reaches the
// console: no unhandled rejection, and a page that still renders its metrics box.
test.use({ allowedConsoleMessages: ['net::ERR_FAILED', 'the server responded with a status of 500'] })

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

async function expectDatasetPageToRender(page: Page, request: APIRequestContext) {
  const dataset = await createDataset(request, `Test metrics outage ${Date.now()}`, 'Dataset pour tester une panne de l\'API des métriques')
  createdDatasets.push(dataset.id)

  await page.goto(`/datasets/${dataset.id}/`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(dataset.title)
  await expect(page.getByText('Vues', { exact: true })).toBeVisible()
  await page.waitForLoadState('networkidle')
}

test('the dataset page survives an unreachable metrics API', async ({ page, request }) => {
  await page.route('**metric-api.data.gouv.fr/**', route => route.abort())

  await expectDatasetPageToRender(page, request)
})

test('the dataset page survives a metrics API returning an error', async ({ page, request }) => {
  await page.route('**metric-api.data.gouv.fr/**', route => route.fulfill({ status: 500, contentType: 'text/html', body: '<html>oops</html>' }))

  await expectDatasetPageToRender(page, request)
})
