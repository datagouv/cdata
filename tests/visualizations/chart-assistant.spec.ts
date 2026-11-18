import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { assistantChatStream, createChartOutput, createChartStream, routeAssistantStream } from '../assistantApi'
import type { AssistantChatBody } from '../assistantApi'
import { RESOURCE_ID, sendAssistantMessage, setupChart } from './fixtures'

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

function lastReply(page: Page) {
  return page.getByTestId('assistant-panel').locator('article').last()
}

test('the assistant creates a chart then updates it without refetching the data', async ({ page }) => {
  const dataRequests: Array<string> = []
  page.on('request', (request) => {
    if (/\/api\/resources\/[^/]+\/data\//.test(request.url())) dataRequests.push(request.url())
  })
  // First user turn creates the chart, later turns update its unit.
  await routeAssistantStream(page, body => assistantChatStream(body, scriptedCreateStream))
  await setupChart(page)

  // First turn: create_chart fills the form and the preview fetches the data.
  await page.getByRole('tab', { name: 'Assistant' }).click()
  const dataBeforeCreate = dataRequests.length
  await sendAssistantMessage(page, 'Logements par région, top 5')
  await expect(lastReply(page)).toContainText('Graphique créé.')

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await expect(page.getByLabel('Titre')).toHaveValue('Logements par région')
  await expect(page.getByPlaceholder('Rechercher une colonne à afficher...')).toHaveValue(X_COLUMN)
  await expect(page.getByPlaceholder('Rechercher une colonne Y...')).toHaveValue(Y_COLUMN)
  await expect(page.getByLabel('Calcul')).toHaveValue('max')
  await expect(page.getByRole('radio', { name: 'Histogramme' })).toBeChecked()
  await expect(page.getByLabel('Nombre de valeurs')).toHaveValue('5')
  await expect(page.locator('#x-axis-sort-combined .input')).toContainText(`${Y_COLUMN} - Descendant`)
  // Named by its label and by the selected sort.
  await expect(page.getByRole('button', { name: new RegExp(`^Trier par\\s+${Y_COLUMN} - Descendant`) })).toBeVisible()
  await expect(page.getByTestId('chart-preview-block').locator('canvas').first()).toBeVisible()
  await expect.poll(() => dataRequests.length).toBeGreaterThan(dataBeforeCreate)

  // Second turn: update_chart only sets the unit, the data is not fetched again.
  // Let the preview settle before counting the data requests.
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  const dataBeforeUpdate = dataRequests.length
  await expect(page.getByLabel('Unité', { exact: true })).toHaveValue('')
  await page.getByRole('tab', { name: 'Assistant' }).click()
  await sendAssistantMessage(page, 'Ajoute l’unité « doses »')
  await expect(lastReply(page)).toContainText('Unité ajoutée.')

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await expect(page.getByLabel('Unité', { exact: true })).toHaveValue('doses')
  await expect(page.getByLabel('Titre')).toHaveValue('Logements par région')
  await expect(page.getByLabel('Nombre de valeurs')).toHaveValue('5')
  await page.waitForTimeout(500)
  expect(dataRequests.slice(dataBeforeUpdate)).toEqual([])
})
