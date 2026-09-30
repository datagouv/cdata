import { test, expect } from '../base'
import { createChart, deleteAllCharts, deleteChart } from './fixtures'

test.use({ allowedConsoleMessages: ['No match found for location with path "/design/chart"'] })

test.describe('chart cards', () => {
  const createdIds: Array<string> = []

  test.beforeEach(async ({ request }) => {
    // The /design/cards page only shows the 2 most recent charts. Clean first so
    // our fixtures are the only ones displayed, then create fresh charts for this test.
    await deleteAllCharts(request)

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const histogramChart = await createChart(request, {
      title: `Carte histogramme E2E ${uniqueSuffix}`,
      description: 'Histogramme de test pour la carte.',
      type: 'histogram',
      private: false,
      withImage: true,
    })
    createdIds.push(histogramChart.id)

    const privateLineChart = await createChart(request, {
      title: `Carte courbe E2E ${uniqueSuffix}`,
      description: 'Courbe privée de test pour la carte.',
      type: 'line',
      private: true,
      withImage: false,
    })
    createdIds.push(privateLineChart.id)
  })

  test.afterEach(async ({ request }) => {
    for (const id of createdIds.splice(0)) {
      await deleteChart(request, id)
    }
  })

  test('display title, owner, update date, views and description', async ({ page }) => {
    await page.goto('/design/cards')
    await page.waitForLoadState('networkidle')

    const histogramCard = page.locator('article').filter({ hasText: /Carte histogramme E2E/ })
    await expect(histogramCard).toBeVisible()
    const histogramLink = histogramCard.locator('h3 a')
    await expect(histogramLink).toBeVisible()
    await expect(histogramCard.getByText('Admin User')).toBeVisible()
    await expect(histogramCard.getByText('Mis à jour')).toBeVisible()
    await expect(histogramCard.locator('[aria-label="0 vues"]')).toBeVisible()
    await expect(histogramCard.getByText('Histogramme de test pour la carte.')).toBeVisible()

    const lineCard = page.locator('article').filter({ hasText: /Carte courbe E2E/ })
    await expect(lineCard).toBeVisible()
    await expect(lineCard.locator('[aria-label="0 vues"]')).toBeVisible()
  })

  test('with image displays an img, without image a placeholder', async ({ page }) => {
    await page.goto('/design/cards')
    await page.waitForLoadState('networkidle')

    const histogramCard = page.locator('article').filter({ hasText: /Carte histogramme E2E/ })
    await expect(histogramCard.locator('img')).toHaveCount(1)

    const lineCard = page.locator('article').filter({ hasText: /Carte courbe E2E/ })
    await expect(lineCard.locator('img')).toHaveCount(0)
    await expect(lineCard.locator('div.bg-gray-lower')).toBeVisible()
  })

  test('title link points to the chart page', async ({ page }) => {
    await page.goto('/design/cards')
    await page.waitForLoadState('networkidle')

    const histogramCard = page.locator('article').filter({ hasText: /Carte histogramme E2E/ })
    const link = histogramCard.locator('h3 a')
    await expect(link).toHaveAttribute('href', /\/visualizations\/carte-histogramme-e2e-/)
  })

  test('private chart card displays a draft badge, public chart card does not', async ({ page }) => {
    await page.goto('/design/cards')
    await page.waitForLoadState('networkidle')

    const lineCard = page.locator('article').filter({ hasText: /Carte courbe E2E/ })
    await expect(lineCard.locator('.fr-badge')).toHaveText('Brouillon')

    const histogramCard = page.locator('article').filter({ hasText: /Carte histogramme E2E/ })
    await expect(histogramCard.locator('.fr-badge')).toHaveCount(0)
  })
})
