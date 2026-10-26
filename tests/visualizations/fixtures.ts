import type { APIRequestContext, Page } from '@playwright/test'
import type { Chart } from '@datagouv/components-next'
import { expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { clickOutside } from '../helpers'
import profile from './profile.json' with { type: 'json' }

// API calls go straight to the backend: the frontend (baseURL) does not proxy them
const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'
// Real resource from the test DB: bailleurs_sociaux_region.csv in "Logements sociaux et bailleurs par région"
export const RESOURCE_ID = '63f39717-e5c9-4d70-a0d5-544773c1d742'

// Categorical first column: the preview infers a histogram from it
export const SQL_RESULT_HISTOGRAM = {
  columns: ['nom_region', 'nb_logements'],
  rows: [
    ['Bretagne', 125],
    ['Normandie', 87],
    ['Occitanie', 203],
  ],
}

// Date first column: the preview infers a line chart from it
export const SQL_RESULT_LINE = {
  columns: ['jour', 'nb_logements'],
  rows: [
    ['2023-01-01', 125],
    ['2023-01-02', 87],
    ['2023-01-03', 203],
  ],
}

export type SetupChartOptions = {
  sqlResult?: { columns: Array<string>, rows: Array<Array<string | number | null>> }
}

/**
 * Mocks the tabular resource profile and the SQL execution endpoint so the
 * chart preview renders without hitting the real tabular API.
 */
export async function mockTabular(page: Page, options: SetupChartOptions = {}) {
  await page.route('**/api/resources/*/profile/', async (route) => {
    await route.fulfill({ json: profile })
  })
  await page.route('**/api/resources/*/sql', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue()
    }
    await route.fulfill({ json: options.sqlResult ?? SQL_RESULT_HISTOGRAM })
  })
}

/**
 * Sets up the chart configurator with the shared backend dataset and resource.
 */
export async function setupChart(page: Page, options: SetupChartOptions = {}): Promise<void> {
  await mockTabular(page, { sqlResult: options.sqlResult })
  await page.goto('/admin/beta/chart')
  await page.waitForLoadState('networkidle')

  // Click the HeadlessUI toggle button covering the input: clicking the wrapper
  // div can land outside it and never opens the listbox.
  await page.getByTestId('searchable-select-avec-qui-souhaitez-vous-publier').click()
  await page.getByRole('option', { name: 'Admin User', exact: true }).click()

  await page.getByTestId('searchable-select-jeu-de-donn-es').click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('logements sociaux')
  await page.getByRole('option', { name: 'Logements sociaux et bailleurs par région', exact: true }).click()
  await clickOutside(page)

  const resourceSelect = page.getByLabel('Choix de la ressource')
  await expect(resourceSelect).toBeVisible()
  await resourceSelect.selectOption(RESOURCE_ID)

  await expect(page.getByLabel('Titre')).toBeVisible()
}

export type SetupAndSaveChartOptions = {
  title?: string
  description?: string
  /**
   * The reduced model stores no chart type: the preview infers it from the
   * SQL result shape. 'line' swaps the mocked SQL result for a date x-axis.
   */
  type?: 'line' | 'histogram'
}

/**
 * Runs the full UI flow to create a chart through the backend API: configure
 * the resource, fill title/description/query, wait for the preview canvas,
 * save. Returns the chart created by the backend.
 */
export async function setupAndSaveChart(page: Page, options: SetupAndSaveChartOptions = {}): Promise<Chart> {
  await setupChart(page, { sqlResult: options.type === 'line' ? SQL_RESULT_LINE : undefined })

  const title = options.title ?? `Test chart ${Date.now()}`
  const description = options.description ?? 'Test chart description'

  await page.getByLabel('Titre').fill(title)
  await page.getByLabel('Description').fill(description)
  await page.getByLabel('Requête SQL').fill('SELECT nom_region, nb_logements FROM logements ORDER BY nb_logements DESC')

  // The chart preview must be rendered before saving, otherwise the capture is empty
  // and no image upload happens.
  await expect(page.locator('canvas').first()).toBeVisible()

  const saveResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST',
  )
  const imageResponsePromise = page.waitForResponse(
    response => response.url().includes('/image/') && response.request().method() === 'POST',
    { timeout: 30000 },
  )

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const saveResponse = await saveResponsePromise
  const chartData = await saveResponse.json() as Chart
  await imageResponsePromise

  return chartData
}

export type CreateChartOptions = {
  title: string
  description?: string
  /**
   * The reduced model stores no chart type; the preview infers it from the SQL
   * result. Kept for call-site compatibility, it only shapes the fixture query.
   */
  type?: 'line' | 'histogram'
  private?: boolean
  withImage?: boolean
}

/**
 * Creates a chart directly through the API. Useful for states the UI configurator
 * cannot produce on its own (e.g. private charts or charts without a preview image).
 */
export async function createChart(request: APIRequestContext, options: CreateChartOptions): Promise<Chart> {
  const response = await request.post(`${API_BASE_URL}/api/1/visualizations/`, {
    data: {
      title: options.title,
      description: options.description ?? `Description de ${options.title}.`,
      private: options.private ?? false,
      query: options.type === 'line'
        ? 'SELECT jour, nb_logements FROM logements ORDER BY jour'
        : 'SELECT nom_region, nb_logements FROM logements ORDER BY nb_logements DESC',
      resource_id: RESOURCE_ID,
      y_axis: { min: null, max: null, label: null, unit: null, unit_position: 'suffix' },
      extras: {},
    },
  })
  if (!response.ok()) throw new Error(`Chart creation failed: ${response.status()} ${await response.text()}`)
  let chart = await response.json() as Chart

  if (options.withImage) {
    const image = readFileSync(path.join(import.meta.dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))
    const imageResponse = await request.post(`${API_BASE_URL}/api/1/visualizations/${chart.id}/image/`, {
      multipart: { file: { name: 'image.png', mimeType: 'image/png', buffer: image } },
    })
    if (!imageResponse.ok()) throw new Error(`Chart image upload failed: ${imageResponse.status()} ${await imageResponse.text()}`)
    chart = await (await request.get(`${API_BASE_URL}/api/1/visualizations/${chart.id}/`)).json() as Chart
  }

  return chart
}

export async function deleteChart(request: APIRequestContext, id: string): Promise<void> {
  await request.delete(`${API_BASE_URL}/api/1/visualizations/${id}/`)
}

export async function deleteAllCharts(request: APIRequestContext): Promise<void> {
  const response = await request.get(`${API_BASE_URL}/api/1/visualizations/`, {
    params: { page_size: '100' },
  })
  if (!response.ok()) return
  const { data } = await response.json() as { data: Array<{ id: string }> }
  for (const chart of data) {
    await deleteChart(request, chart.id)
  }
}
