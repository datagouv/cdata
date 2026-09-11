import type { APIRequestContext, Page } from '@playwright/test'
import type { Chart } from '@datagouv/components-next'
import { expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { clickOutside } from '../helpers'
import profile from './profile.json' with { type: 'json' }
import data from './data.json' with { type: 'json' }

// API calls go straight to the backend: the frontend (baseURL) does not proxy them
const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'
// Real resource from the test DB: bailleurs_sociaux_region.csv in "Logements sociaux et bailleurs par région"
const RESOURCE_ID = '63f39717-e5c9-4d70-a0d5-544773c1d742'

/**
 * Mocks the tabular resource profile and data so the chart configurator can
 * render a preview without hitting the real tabular API.
 */
export async function mockTabular(page: Page) {
  await page.route('**/api/resources/*/profile/', async (route) => {
    await route.fulfill({ json: profile })
  })
  await page.route('**/api/resources/*/data/*', async (route) => {
    await route.fulfill({ json: data })
  })
}

/**
 * Sets up the chart configurator with the shared test resource.
 * Selects "Admin User" as producer, the fixture dataset, and its first resource.
 */
export async function setupChart(page: Page) {
  await mockTabular(page)
  await page.goto('/admin/beta/chart')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('producer-select').click()
  await page.getByRole('option', { name: 'Admin User', exact: true }).click()

  await page.getByTestId('searchable-select-jeu-de-donn-es').click()

  const getPromise = page.waitForResponse('**/api/1/datasets/suggest/?q=logements+sociaux*')
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('logements sociaux')
  await getPromise

  await page.getByRole('option', { name: 'Logements sociaux et bailleurs par région', exact: true }).click()
  await clickOutside(page)

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  const resourceProfilePromise = page.waitForResponse('**/api/resources/*/profile/')
  const resourceSelect = page.getByLabel('Choix de la ressource')
  await resourceSelect.selectOption({ index: 1 })

  await resourceProfilePromise
  await page.waitForTimeout(300) // necessary to wait for the watch, no real async to check

  await expect(page.getByLabel('Titre')).toBeVisible()
  expect(await page.getByPlaceholder('Rechercher une colonne à afficher...').inputValue()).toBe('année_publication')
}

export type SetupAndSaveChartOptions = {
  title?: string
  description?: string
  type?: 'line' | 'histogram'
}

/**
 * Runs the full UI flow to create a real chart: configure the resource, fill
 * title/description, wait for the preview canvas, save, and wait for the image
 * upload. Returns the created chart.
 */
export async function setupAndSaveChart(page: Page, options: SetupAndSaveChartOptions = {}): Promise<Chart> {
  await setupChart(page)

  const title = options.title ?? `Test chart ${Date.now()}`
  const description = options.description ?? 'Test chart description'

  await page.getByLabel('Titre').fill(title)
  await page.getByLabel('Description').fill(description)

  if (options.type) {
    const chartTypeButton = page.locator('#chart-type').getByRole('button')
    await chartTypeButton.click()
    const optionName = options.type === 'line' ? 'Ligne' : 'Histogramme'
    await page.getByRole('option', { name: optionName, exact: true }).click()
  }

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
  const chartData = (await saveResponse.json()) as Chart
  await imageResponsePromise

  return chartData
}

export type CreateChartOptions = {
  title: string
  description?: string
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
      x_axis: { column_x: 'annee', sort_x_by: null, sort_x_direction: null, type: 'discrete' },
      y_axis: { min: null, max: null, label: null, unit: null, unit_position: 'suffix' },
      series: [{ type: options.type ?? 'histogram', column_y: 'valeur', aggregate_y: 'sum', resource_id: RESOURCE_ID, column_x_name_override: null, filters: null }],
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
