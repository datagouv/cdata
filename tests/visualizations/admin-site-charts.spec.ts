import type { BrowserContext } from '@playwright/test'
import { test, expect } from '../base'
import { createChart, deleteAllCharts, deleteChart, setupAndSaveChart } from './fixtures'

test.describe('with charts', () => {
  const createdIds: Array<string> = []
  let histogramChart: Awaited<ReturnType<typeof setupAndSaveChart>>
  let lineChart: Awaited<ReturnType<typeof setupAndSaveChart>>
  let privateChart: Awaited<ReturnType<typeof createChart>>
  let deletedChart: Awaited<ReturnType<typeof createChart>>
  let setupContext: BrowserContext
  let uniqueSuffix: string

  test.beforeAll(async ({ browser }) => {
    uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setupContext = await browser.newContext({ storageState: 'playwright/.auth/user.json' })
    const page = await setupContext.newPage()

    await deleteAllCharts(setupContext.request)

    histogramChart = await setupAndSaveChart(page, {
      title: `Admin histogramme E2E ${uniqueSuffix}`,
      description: 'Histogramme public pour la liste admin.',
    })
    createdIds.push(histogramChart.id)

    lineChart = await setupAndSaveChart(page, {
      title: `Admin courbe E2E ${uniqueSuffix}`,
      description: 'Courbe publique pour la liste admin.',
      type: 'line',
    })
    createdIds.push(lineChart.id)

    // The configurator cannot set the private flag, so use the API for draft/deleted cases.
    privateChart = await createChart(setupContext.request, {
      title: `Admin brouillon E2E ${uniqueSuffix}`,
      type: 'histogram',
      private: true,
      withImage: false,
    })
    createdIds.push(privateChart.id)

    deletedChart = await createChart(setupContext.request, {
      title: `Admin supprimé E2E ${uniqueSuffix}`,
      type: 'histogram',
      private: true,
      withImage: false,
    })
    createdIds.push(deletedChart.id)
    await deleteChart(setupContext.request, deletedChart.id)
  })

  test.afterAll(async ({ request }) => {
    for (const id of createdIds) {
      await deleteChart(request, id)
    }
    await setupContext.close()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/site/charts')
    await page.waitForLoadState('networkidle')
  })

  test('lists chart cards with the total count', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /\d+ graphiques/ })).toBeVisible()
    for (const chart of [histogramChart, lineChart, privateChart, deletedChart]) {
      await expect(page.getByRole('link', { name: chart.title })).toBeVisible()
    }
    await expect(page.locator('article').filter({ hasText: histogramChart.title }).getByText('Admin User')).toBeVisible()
  })

  test('chart cards link to the admin edit page', async ({ page }) => {
    for (const chart of [histogramChart, lineChart, privateChart, deletedChart]) {
      await expect(page.getByRole('link', { name: chart.title })).toHaveAttribute('href', `/admin/beta/charts/${chart.id}`)
    }
  })

  test('private chart card displays a draft badge', async ({ page }) => {
    const card = page.locator('article').filter({ hasText: privateChart.title })
    await expect(card.locator('.fr-badge')).toHaveText('Brouillon')
  })

  test('deleted chart card displays a deleted badge, taking precedence over the draft badge', async ({ page }) => {
    const card = page.locator('article').filter({ hasText: deletedChart.title })
    await expect(card.locator('.fr-badge')).toHaveText('Supprimé')
  })
})
