import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { ASSISTANT_CHAT_PATH, createChartOutput, createChartStream, routeAssistantStream, updateChartStream } from '../assistantApi'
import type { AssistantChatBody } from '../assistantApi'
import { RESOURCE_ID, setupChart } from './fixtures'

const ASSISTANT_API_BASE = (process.env.NUXT_PUBLIC_ASSISTANT_API_BASE || process.env.FAKE_SERVICES_URL || 'http://localhost:3100').replace(/\/$/, '')
// API calls go straight to the backend: the frontend (baseURL) does not proxy them
const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'
const X_COLUMN = 'nom_region'
const Y_COLUMN = 'Nombre de logements'

/** The scripted chart, on columns of the fixture profile: regions by max number of dwellings, top 5. */
function scriptedCreateStream(body: AssistantChatBody) {
  const output = createChartOutput(body.resource_id ?? RESOURCE_ID)
  output.chart.title = 'Logements par région'
  output.chart.x_axis = { ...output.chart.x_axis, column_x: X_COLUMN }
  output.chart.series = [{ ...output.chart.series[0]!, column_y: Y_COLUMN, aggregate_y: 'max' }]
  return createChartStream(output.chart.series[0]!.resource_id, output)
}

/** First user turn creates the chart, later turns update its unit. */
function scriptedStream(body: AssistantChatBody) {
  const userTurns = (body.messages ?? []).filter(message => message.role === 'user').length
  return userTurns <= 1 ? scriptedCreateStream(body) : updateChartStream()
}

async function sendMessage(page: Page, prompt: string) {
  const requestPromise = page.waitForRequest(request =>
    request.url().includes(ASSISTANT_CHAT_PATH) && request.method() === 'POST',
  )
  await page.getByLabel('Votre demande').fill(prompt)
  // The panel ignores a send within a second of the previous one: retry until the composer is cleared.
  await expect(async () => {
    await page.getByRole('button', { name: 'Envoyer' }).click()
    await expect(page.getByLabel('Votre demande')).toHaveValue('', { timeout: 500 })
  }).toPass()
  const request = await requestPromise
  const url = new URL(request.url())
  expect(`${url.origin}${url.pathname}`).toBe(`${ASSISTANT_API_BASE}${ASSISTANT_CHAT_PATH}`)
  expect(url.searchParams.get('lang')).toBe('fr')
}

function lastReply(page: Page) {
  return page.getByTestId('assistant-panel').locator('article').last()
}

test('the assistant creates a chart then updates it without refetching the data', async ({ page }) => {
  const dataRequests: Array<string> = []
  page.on('request', (request) => {
    if (/\/api\/resources\/[^/]+\/data\//.test(request.url())) dataRequests.push(request.url())
  })
  await routeAssistantStream(page, scriptedStream)
  await setupChart(page)

  // First turn: create_chart fills the form and the preview fetches the data.
  await page.getByRole('tab', { name: 'Assistant' }).click()
  const dataBeforeCreate = dataRequests.length
  await sendMessage(page, 'Logements par région, top 5')
  await expect(lastReply(page)).toContainText('Graphique créé.')

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await expect(page.getByLabel('Titre')).toHaveValue('Logements par région')
  await expect(page.getByPlaceholder('Rechercher une colonne à afficher...')).toHaveValue(X_COLUMN)
  await expect(page.getByPlaceholder('Rechercher une colonne Y...')).toHaveValue(Y_COLUMN)
  await expect(page.getByLabel('Calcul')).toHaveValue('max')
  await expect(page.getByRole('radio', { name: 'Histogramme' })).toBeChecked()
  await expect(page.getByLabel('Nombre de valeurs')).toHaveValue('5')
  await expect(page.locator('#x-axis-sort-combined .input')).toContainText(`${Y_COLUMN} - Descendant`)
  await expect(page.getByTestId('chart-preview-block').locator('canvas').first()).toBeVisible()
  await expect.poll(() => dataRequests.length).toBeGreaterThan(dataBeforeCreate)

  // Second turn: update_chart only sets the unit, the data is not fetched again.
  // Let the preview settle: the create fetches page 1, then a full page triggers the
  // 51st-group probe (page=51, a distinct URL).
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  const dataBeforeUpdate = dataRequests.length
  await expect(page.getByLabel('Unité', { exact: true })).toHaveValue('')
  await page.getByRole('tab', { name: 'Assistant' }).click()
  await sendMessage(page, 'Ajoute l’unité « doses »')
  await expect(lastReply(page)).toContainText('Unité ajoutée.')

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await expect(page.getByLabel('Unité', { exact: true })).toHaveValue('doses')
  await expect(page.getByLabel('Titre')).toHaveValue('Logements par région')
  await expect(page.getByLabel('Nombre de valeurs')).toHaveValue('5')
  await page.waitForTimeout(500)
  expect(dataRequests.slice(dataBeforeUpdate)).toEqual([])
})

test('a chart with more than 50 groups shows the truncation warning', async ({ page }) => {
  const rows = Array.from({ length: 50 }, (_, i) => ({ [X_COLUMN]: `Région ${String(i).padStart(2, '0')}`, [`${Y_COLUMN}__max`]: 1000 - i }))
  // A full page of an aggregate with a next link: only the 51st group can tell.
  const dataPages: Array<string | null> = []
  await routeAssistantStream(page, scriptedStream)
  await setupChart(page)
  // setupChart installs its own /data/ mock: ours must come after it to win.
  await page.route('**/api/resources/*/data/*', async (route) => {
    const pageParam = new URL(route.request().url()).searchParams.get('page')
    dataPages.push(pageParam)
    await route.fulfill({ json: pageParam === '51'
      ? { data: rows.slice(0, 1), links: { next: null } }
      : { data: rows, links: { next: `${route.request().url()}&page=2` } } })
  })

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await sendMessage(page, 'Logements par région, top 5')
  await expect(lastReply(page)).toContainText('Graphique créé.')

  await expect(page.getByTestId('chart-truncation-warning')).toBeVisible()
  await expect(page.getByTestId('chart-truncation-warning')).toHaveText(
    `Seules les 50 premières valeurs de ${X_COLUMN} sont prises en compte : le tri et la sélection portent sur cet extrait. Ajoutez un filtre pour réduire le nombre de valeurs.`,
  )
  expect(dataPages).toContain('51')
})

test('a chart created by the assistant is saved without leaving the assistant tab', async ({ page }) => {
  await routeAssistantStream(page, scriptedStream)
  await setupChart(page)

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await sendMessage(page, 'Logements par région, top 5')
  await expect(lastReply(page)).toContainText('Graphique créé.')

  const saveResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const saved = (await (await saveResponsePromise).json()) as { id: string, title: string }
  try {
    expect(saved.title).toBe('Logements par région')
    await expect(page.getByRole('tab', { name: 'Assistant' })).toHaveAttribute('aria-selected', 'true')
  }
  finally {
    await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${saved.id}/`)
  }
})
