import type { Chart } from '@datagouv/components-next'
import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { clickOutside } from '../helpers'
import { ASSISTANT_CHAT_PATH, createChartStream } from '../assistantApi'
import { createChart, deleteChart, mockTabular, RESOURCE_ID, setupChart } from './fixtures'
import data from './data.json' with { type: 'json' }

// API calls go straight to the backend: the frontend (baseURL) does not proxy them
const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'
const ASSISTANT_API_BASE = (process.env.NUXT_PUBLIC_ASSISTANT_API_BASE || process.env.FAKE_SERVICES_URL || 'http://localhost:3100').replace(/\/$/, '')
// Title of the chart scripted in tests/assistantApi.ts
const ASSISTANT_CHART_TITLE = 'Premières doses par département'

async function sendAssistantMessage(page: Page, prompt: string) {
  const requestPromise = page.waitForRequest(request =>
    request.url().includes(ASSISTANT_CHAT_PATH) && request.method() === 'POST',
  )
  await page.getByLabel('Votre demande').fill(prompt)
  // The panel ignores a send within a second of the previous one: retry until the
  // composer is cleared, which only happens once the message is sent.
  await expect(async () => {
    await page.getByRole('button', { name: 'Envoyer' }).click()
    await expect(page.getByLabel('Votre demande')).toHaveValue('', { timeout: 500 })
  }).toPass()
  const request = await requestPromise
  expect(request.url()).toBe(`${ASSISTANT_API_BASE}${ASSISTANT_CHAT_PATH}`)
  return request
}

/**
 * The fixture dataset has a single tabular resource: mark its JSON export as
 * parsed too, so that the configurator offers a second resource (its profile
 * and data come from mockTabular). Must run before the dataset is selected.
 */
async function withSecondTabularResource(page: Page) {
  await page.route(/\/api\/2\/datasets\/[^/]+\/resources\//, async (route) => {
    const response = await route.fetch()
    const body = await response.json() as { data: Array<{ id: string, format: string, extras: Record<string, unknown> }> }
    for (const resource of body.data) {
      if (resource.id !== RESOURCE_ID && resource.format === 'json') {
        resource.extras = { ...resource.extras, 'analysis:parsing:parsing_table': 'e2e-second-resource' }
      }
    }
    await route.fulfill({ response, json: body })
  })
}

async function otherResourceId(page: Page) {
  const resourceIds = await page.locator('#resource-select option').evaluateAll(options =>
    options.map(option => (option as HTMLOptionElement).value).filter(Boolean),
  )
  const resourceId = resourceIds.find(id => id !== RESOURCE_ID)
  expect(resourceId, 'the fixture dataset has another tabular resource').toBeDefined()
  return resourceId!
}

test('title input updates form value without debounce', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Nouveau titre de graphique')

  expect(await page.getByLabel('Titre').inputValue()).toBe('Nouveau titre de graphique')
})

test('description input updates form value without debounce', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Description').fill('Nouvelle description de graphique')

  expect(await page.getByLabel('Description').inputValue()).toBe('Nouvelle description de graphique')
})

test('chart type button group defaults to histogram', async ({ page }) => {
  await setupChart(page)

  await expect(page.getByRole('radio', { name: 'Histogramme' })).toBeChecked()
  await expect(page.getByRole('radio', { name: 'Courbe' })).not.toBeChecked()
})

test('chart type button group can switch to line chart', async ({ page }) => {
  await setupChart(page)

  await page.getByTestId('chart-type').getByText('Courbe', { exact: true }).click()

  await expect(page.getByRole('radio', { name: 'Courbe' })).toBeChecked()
  await expect(page.getByRole('radio', { name: 'Histogramme' })).not.toBeChecked()
})

test('x-axis column selector shows available columns', async ({ page }) => {
  await setupChart(page)

  await page.getByTestId('searchable-select-choisir-quoi-afficher').click()

  await expect(page.getByRole('option', { name: 'libellé_EPCI', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'nom_region', exact: true })).toBeVisible()
})

test('x-axis type defaults to continuous for numeric column', async ({ page }) => {
  await setupChart(page)

  const xAxisSelect = page.getByTestId('searchable-select-choisir-quoi-afficher')
  await xAxisSelect.click()
  await page.getByRole('option', { name: 'Nombre de logements', exact: true }).click()
  await clickOutside(page)

  const xAxisTypeSelect = page.locator('#x-axis-type')
  await expect(xAxisTypeSelect).toHaveValue('continuous')
})

test('x-axis type defaults to discrete for string column', async ({ page }) => {
  await setupChart(page)

  const xAxisSelect = page.getByTestId('searchable-select-choisir-quoi-afficher')
  await xAxisSelect.click()
  await page.getByRole('option', { name: 'nom_region', exact: true }).click()
  await clickOutside(page)

  const xAxisTypeSelect = page.locator('#x-axis-type')
  await expect(xAxisTypeSelect).toHaveValue('discrete')
})

test('selecting a date x-axis column switches to line chart and sorts by date ascending', async ({ page }) => {
  await setupChart(page)

  const xAxisSelect = page.getByTestId('searchable-select-choisir-quoi-afficher')
  await xAxisSelect.click()
  await page.getByRole('option', { name: 'nom_region', exact: true }).click()
  await clickOutside(page)

  await xAxisSelect.click()
  await page.getByRole('option', { name: 'jour', exact: true }).click()
  await clickOutside(page)

  await expect(page.getByRole('radio', { name: 'Courbe' })).toBeChecked()

  const sortListbox = page.locator('#x-axis-sort-combined')
  await expect(sortListbox.locator('.input')).toContainText('jour - Ascendant')
})

test('selecting a numeric x-axis column does not switch to line chart or force sort', async ({ page }) => {
  await setupChart(page)

  const xAxisSelect = page.getByTestId('searchable-select-choisir-quoi-afficher')
  await xAxisSelect.click()
  await page.getByRole('option', { name: 'nom_region', exact: true }).click()
  await clickOutside(page)

  await xAxisSelect.click()
  await page.getByRole('option', { name: 'Nombre de logements', exact: true }).click()
  await clickOutside(page)

  await expect(page.getByRole('radio', { name: 'Histogramme' })).toBeChecked()

  const sortListbox = page.locator('#x-axis-sort-combined')
  await expect(sortListbox.locator('.input')).toContainText('Aucun')
})

test('series column y selector shows available columns', async ({ page }) => {
  await setupChart(page)

  await page.getByTestId('searchable-select-colonne-y').click()

  await expect(page.getByRole('option', { name: 'Nombre de logements', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'libellé_EPCI', exact: true })).toBeVisible()
})

test('series aggregation defaults to count and is hidden', async ({ page }) => {
  await setupChart(page)

  const aggregationSelect = page.getByLabel('Agrégation')
  await expect(aggregationSelect).not.toBeVisible()
})

test('series aggregation can be changed to sum', async ({ page }) => {
  await setupChart(page)

  const yAxisSelect = page.getByTestId('searchable-select-colonne-y')
  await yAxisSelect.click()
  await page.getByRole('option', { name: 'Nombre de logements', exact: true }).click()
  await clickOutside(page)

  const aggregationSelect = page.getByLabel('Agrégation')
  await aggregationSelect.selectOption('Somme')

  const aggregation = await aggregationSelect.inputValue()
  expect(aggregation).toBe('sum')
})

test('series aggregation can be changed to avg', async ({ page }) => {
  await setupChart(page)

  const yAxisSelect = page.getByTestId('searchable-select-colonne-y')
  await yAxisSelect.click()
  await page.getByRole('option', { name: 'Nombre de logements', exact: true }).click()
  await clickOutside(page)

  const aggregationSelect = page.getByLabel('Agrégation')
  await aggregationSelect.selectOption('Moyenne')

  const aggregation = await aggregationSelect.inputValue()
  expect(aggregation).toBe('avg')
})

test('sort select displays dynamic column names', async ({ page }) => {
  await setupChart(page)

  const listbox = page.locator('#x-axis-sort-combined')
  await listbox.click()

  const sortOptions = await listbox.locator('role=option').allTextContents()

  expect(sortOptions).toHaveLength(3)
  expect(sortOptions[0]).toBe('Aucun')

  expect(sortOptions[1]).toContain('année_publication - Ascendant')
  expect(sortOptions[1]).not.toContain('Axe X - Ascendant')

  await listbox.getByRole('option', { name: 'année_publication - Ascendant' }).click()

  const buttonText = await listbox.locator('.input').textContent()
  expect(buttonText).toContain('année_publication - Ascendant')
})

test('sort select updates reactively when column changes', async ({ page }) => {
  await setupChart(page)

  const listbox = page.locator('#x-axis-sort-combined')
  await listbox.click()

  const firstOptions = await listbox.locator('role=option').allTextContents()
  expect(firstOptions[1]).toContain('année_publication - Ascendant')
  await clickOutside(page)

  const xAxisSelect = page.getByTestId('searchable-select-choisir-quoi-afficher')
  await xAxisSelect.click()
  await expect(page.getByRole('option', { name: 'nom_region', exact: true })).toBeVisible()
  await page.getByRole('option', { name: 'nom_region', exact: true }).click()
  await clickOutside(page)

  await listbox.click()

  const updatedOptions = await listbox.locator('role=option').allTextContents()
  expect(updatedOptions[1]).toContain('nom_region')
  expect(updatedOptions[1]).not.toContain('libellé_EPCI')
})

test('Y axis sort options show dynamic series column name too', async ({ page }) => {
  await setupChart(page)

  const yAxisSelect = page.getByTestId('searchable-select-colonne-y')
  await yAxisSelect.click()
  await page.getByRole('option', { name: 'Nombre de logements', exact: true }).click()
  await page.keyboard.press('Escape')

  const listbox = page.locator('#x-axis-sort-combined')
  await listbox.click()
  const sortOptions = await listbox.locator('role=option').allTextContents()

  expect(sortOptions[3]).toContain('Nombre de logements')
  expect(sortOptions[3]).not.toContain('Axe Y - Ascendant')
})

test('y-axis label input is initially empty', async ({ page }) => {
  await setupChart(page)

  const labelInput = page.getByLabel('Label')
  const labelValue = await labelInput.inputValue()
  expect(labelValue).toBe('')
})

test('y-axis label input can be filled', async ({ page }) => {
  await setupChart(page)

  const labelInput = page.getByLabel('Label')
  await labelInput.fill('Nombre de logements sociaux')

  const labelValue = await labelInput.inputValue()
  expect(labelValue).toBe('Nombre de logements sociaux')
})

test('y-axis min and max inputs are initially empty', async ({ page }) => {
  await setupChart(page)

  const minInput = page.locator('#y-axis-min')
  const maxInput = page.locator('#y-axis-max')
  const minValue = await minInput.inputValue()
  const maxValue = await maxInput.inputValue()

  expect(minValue).toBe('')
  expect(maxValue).toBe('')
})

test('y-axis min and max can be set', async ({ page }) => {
  await setupChart(page)

  const minInput = page.locator('#y-axis-min')
  const maxInput = page.locator('#y-axis-max')
  await minInput.fill('0')
  await maxInput.fill('100')

  const minValue = await minInput.inputValue()
  const maxValue = await maxInput.inputValue()

  expect(minValue).toBe('0')
  expect(maxValue).toBe('100')
})

test('y-axis unit input is initially empty', async ({ page }) => {
  await setupChart(page)

  const unitInput = page.getByRole('textbox', { name: 'Unité' })
  const unitValue = await unitInput.inputValue()
  expect(unitValue).toBe('')
})

test('y-axis unit position defaults to suffix', async ({ page }) => {
  await setupChart(page)

  const unitPositionSelect = page.getByLabel('Position unité')
  const unitPosition = await unitPositionSelect.inputValue()
  expect(unitPosition).toBe('suffix')
})

test('y-axis unit position can be changed to prefix', async ({ page }) => {
  await setupChart(page)

  const unitPositionSelect = page.getByLabel('Position unité')
  await unitPositionSelect.selectOption('Préfixe')

  const unitPosition = await unitPositionSelect.inputValue()
  expect(unitPosition).toBe('prefix')
})

test('saving chart sends correct data to API', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart

  expect(responseBody!.title).toBe('Test Chart')
  await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${responseBody!.id}/`)
})

test('saving chart shows success message', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart

  await page.waitForTimeout(300)

  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()

  await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${responseBody!.id}/`)
})

test('complete chart configuration flow', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Graphique complet')
  await page.getByLabel('Description').fill('Test complet de configuration')

  await page.getByTestId('chart-type').getByText('Courbe', { exact: true }).click()

  await page.getByTestId('searchable-select-choisir-quoi-afficher').click()
  await page.getByRole('option', { name: 'code_region', exact: true }).click()
  await clickOutside(page)

  await page.getByLabel('Type', { exact: true }).first().selectOption('continuous')

  await page.getByTestId('searchable-select-colonne-y').click()
  await page.getByRole('option', { name: 'Taux de logements vacants* (en %)', exact: true }).first().click()

  await page.getByLabel('Agrégation').selectOption('Moyenne')

  await page.getByLabel('Label').fill('Taux (%)')
  await page.locator('#y-axis-min').fill('0')
  await page.locator('#y-axis-max').fill('100')
  await page.locator('#y-axis-unit').fill('%')
  await page.getByLabel('Position unité').selectOption('prefix')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart

  await page.waitForTimeout(300)
  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()

  expect(responseBody!.title).toBe('Graphique complet')

  expect(await page.getByLabel('Titre').inputValue()).toBe('Graphique complet')
  expect(await page.getByLabel('Description').inputValue()).toBe('Test complet de configuration')

  await expect(page.getByRole('radio', { name: 'Courbe' })).toBeChecked()

  expect(await page.getByLabel('Type', { exact: true }).first().inputValue()).toBe('continuous')
  expect(await page.getByLabel('Agrégation').inputValue()).toBe('avg')
  expect(await page.getByLabel('Label').inputValue()).toBe('Taux (%)')
  expect(await page.locator('#y-axis-min').inputValue()).toBe('0')
  expect(await page.locator('#y-axis-max').inputValue()).toBe('100')
  expect(await page.locator('#y-axis-unit').inputValue()).toBe('%')
  expect(await page.getByLabel('Position unité').inputValue()).toBe('prefix')

  await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${responseBody!.id}/`)
})

test('y-axis column options update when selecting different resource', async ({ page }) => {
  await setupChart(page)

  await page.getByTestId('searchable-select-colonne-y').click()
  const initialOptions = await page.getByRole('option').allTextContents()
  await page.keyboard.press('Escape')

  const resourceSelect = page.getByLabel('Choix de la ressource')
  const optionCount = await resourceSelect.locator('option').count()

  if (optionCount > 2) {
    await resourceSelect.selectOption({ index: 2 })

    await page.waitForTimeout(500)

    await page.getByTestId('searchable-select-colonne-y').click()

    const newOptions = await page.getByRole('option').allTextContents()
    await page.keyboard.press('Escape')

    expect(newOptions).not.toEqual(initialOptions)
  }
})

test('count option appears in the y-axis column selector', async ({ page }) => {
  await setupChart(page)

  await page.getByTestId('searchable-select-colonne-y').click()

  await expect(page.getByRole('option', { name: 'Compter', exact: true })).toBeVisible()
})

test('selecting count option sets aggregate to count and hides aggregation dropdown', async ({ page }) => {
  await setupChart(page)

  const yAxisSelect = page.getByTestId('searchable-select-colonne-y')

  // First select a number column so the aggregate dropdown is visible
  await yAxisSelect.click()
  await page.getByRole('option', { name: 'Nombre de logements', exact: true }).click()
  await clickOutside(page)
  await expect(page.getByLabel('Agrégation')).toBeVisible()

  // Then select the count option
  await yAxisSelect.click()
  await page.getByRole('option', { name: 'Compter', exact: true }).click()
  await clickOutside(page)

  await expect(page.getByLabel('Agrégation')).not.toBeVisible()
})

test('selecting a non-count column after count resets aggregate to none', async ({ page }) => {
  await setupChart(page)

  const yAxisSelect = page.getByTestId('searchable-select-colonne-y')

  await yAxisSelect.click()
  await page.getByRole('option', { name: 'Compter', exact: true }).click()
  await clickOutside(page)

  await yAxisSelect.click()
  await page.getByRole('option', { name: 'Nombre de logements', exact: true }).click()
  await clickOutside(page)

  const aggregationSelect = page.getByLabel('Agrégation')
  await expect(aggregationSelect).toBeVisible()
  expect(await aggregationSelect.inputValue()).toBe('Non')
})

test('changing x-axis updates count serie column_y to the new x-axis column', async ({ page }) => {
  await setupChart(page)

  await page.getByTestId('searchable-select-colonne-y').click()
  await page.getByRole('option', { name: 'Compter', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('option', { name: 'Compter', exact: true })).not.toBeVisible()

  const xAxisSelect = page.getByTestId('searchable-select-choisir-quoi-afficher')
  await xAxisSelect.click()
  await page.getByRole('option', { name: 'nom_region', exact: true }).click()
  await page.keyboard.press('Escape')

  await page.getByTestId('searchable-select-colonne-y').click()
  await expect(page.getByRole('option', { name: 'Compter', exact: true })).toBeVisible()
})

test('saving chart with count aggregation round-trips correctly', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Count Chart')
  await page.getByLabel('Description').fill('Test count aggregation')

  await page.getByTestId('searchable-select-colonne-y').click()
  await page.getByRole('option', { name: 'Compter', exact: true }).click()
  await clickOutside(page)

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart

  expect(responseBody.series[0].aggregate_y).toBe('count')
  expect(responseBody.series[0].column_y).toBe(responseBody.x_axis.column_x)

  await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${responseBody.id}/`)
})

test('y-axis columns should not be empty after selecting resource from loaded chart', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Columns Wipe')
  await page.getByLabel('Description').fill('Test')

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

  await page.goto(`/admin/beta/charts/${chartData.id}`)
  await page.waitForLoadState('networkidle')

  await page.getByTestId('searchable-select-avec-qui-souhaitez-vous-publier').click()
  await page.getByRole('option', { name: 'Admin User', exact: true }).click()

  const resourceSelect = page.getByLabel('Choix de la ressource')
  const optionCount = await resourceSelect.locator('option').count()
  if (optionCount >= 2) {
    await resourceSelect.selectOption({ index: 1 })
    await page.waitForTimeout(50)

    await page.getByTestId('searchable-select-colonne-y').click()
    await page.waitForTimeout(50)
    const options = await page.getByRole('option').allTextContents()
    await page.keyboard.press('Escape')

    expect(options.length).toBeGreaterThan(0)
  }

  await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${chartData.id}/`)
})

test('x-axis dropdown should show columns from all chart resources after loading', async ({ page }) => {
  await setupChart(page)

  const saveResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST',
  )
  const imageResponsePromise = page.waitForResponse(
    response => response.url().includes('/image/') && response.request().method() === 'POST',
    { timeout: 30000 },
  )
  await page.getByLabel('Titre').fill('Test All Columns Loaded')
  await page.getByLabel('Description').fill('Test')

  // The chart preview must be rendered before saving, otherwise the capture is empty
  // and no image upload happens.
  await expect(page.locator('canvas').first()).toBeVisible()

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const saveResponse = await saveResponsePromise
  const chartData = (await saveResponse.json()) as Chart
  await imageResponsePromise

  await page.goto(`/admin/beta/charts/${chartData.id}`)
  await page.waitForLoadState('networkidle')

  await page.getByTestId('searchable-select-avec-qui-souhaitez-vous-publier').click()
  await page.getByRole('option', { name: 'Admin User', exact: true }).click()

  await page.getByTestId('searchable-select-choisir-quoi-afficher').click()
  const options = await page.getByRole('option').allTextContents()
  await clickOutside(page)

  expect(options.length).toBeGreaterThan(1)
  expect(options.some(opt => opt !== 'Sélectionnez une option' && opt !== '')).toBeTruthy()

  await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${chartData.id}/`)
})

test('filter groups are sent as or params to tabular-api with synced combinator selects', async ({ page }) => {
  await setupChart(page)

  // Re-register the data route to capture outgoing requests (last registered wins).
  const dataRequests: Array<string> = []
  await page.route('**/api/resources/*/data/*', async (route) => {
    dataRequests.push(route.request().url())
    await route.fulfill({ json: data })
  })

  const filters = page.locator('fieldset', { hasText: 'Filtres' })
  // Group containers only exist once a border is shown, i.e. from the second rule on.
  const groups = filters.locator('.border-new-gray-light')

  // First rule: nom_region est Bretagne (single rule: no border, no combinator select,
  // the row's first button is the column listbox).
  await page.getByRole('button', { name: 'Ajouter une règle' }).click()
  await filters.getByRole('button').first().click()
  await page.getByRole('option', { name: 'nom_region', exact: true }).click()
  await filters.getByPlaceholder('Valeur').fill('Bretagne')

  // Second rule in the same group: année_publication est 2020 (combined with ET by default).
  // The border appears and the new row gets the combinator select (the first row keeps its
  // "Quand" label). Buttons: col1, cond1, del1, select2, col2… so col2 is nth(4).
  await page.getByRole('button', { name: 'Ajouter une règle' }).click()
  const firstGroup = groups.nth(0)
  await firstGroup.getByRole('button').nth(4).click()
  await page.getByRole('option', { name: 'année_publication', exact: true }).click()
  await firstGroup.getByPlaceholder('Valeur').nth(1).fill('2020')

  // The "Ajouter un groupe" button appears once a second rule exists.
  // The new group holds a single rule: no border-specific select on its "Quand" row,
  // its first button is the column listbox.
  await page.getByRole('button', { name: 'Ajouter un groupe' }).click()
  const secondGroup = groups.nth(1)
  await secondGroup.getByRole('button').first().click()
  await page.getByRole('option', { name: 'année_publication', exact: true }).click()
  await secondGroup.getByPlaceholder('Valeur').fill('2021')

  // The two groups are combined with "ou" (or root): a label sits between them.
  await expect(filters.getByText('ou', { exact: true })).toBeVisible()

  // Default is ET inside groups, OU between groups: OrFilters[AndFilters, Filter].
  await expect.poll(() => decodeURIComponent(dataRequests[dataRequests.length - 1] ?? '')).toContain(
    'or=(and(nom_region__exact.Bretagne,année_publication__exact.2020),année_publication__exact.2021)',
  )

  // Flipping one group's select to "Ou" flips them all (ET between groups, OU inside).
  // A single-rule group has no select (its row starts with "Quand"), so only the
  // first group's select shows "Ou".
  await firstGroup.getByRole('button', { name: 'Et', exact: true }).click()
  await page.getByRole('option', { name: 'Ou', exact: true }).click()
  await expect(firstGroup.getByRole('button', { name: 'Ou', exact: true })).toBeVisible()
  await expect(secondGroup.getByText('Quand', { exact: true })).toBeVisible()
  // The between-groups label follows the root flip: "et" (and root).
  await expect(filters.getByText('et', { exact: true })).toBeVisible()
  await expect.poll(() => decodeURIComponent(dataRequests[dataRequests.length - 1] ?? '')).toContain(
    'or=(nom_region__exact.Bretagne,année_publication__exact.2020)&année_publication__exact=2021',
  )
})

test('shows the form panel by default with its pickers and save action', async ({ page }) => {
  await setupChart(page)

  await expect(page.getByRole('button', { name: 'Formulaire', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('form-panel')).toBeVisible()
  await expect(page.getByTestId('assistant-panel')).toBeHidden()
  await expect(page.getByTestId('producer-select')).toBeVisible()
  await expect(page.getByTestId('searchable-select-jeu-de-donn-es')).toBeVisible()
  await expect(page.locator('#resource-select')).toBeVisible()
  await expect(page.getByTestId('source-status')).toContainText('colonnes disponibles')
  await expect(page.getByRole('button', { name: 'Sauvegarder le graphique' })).toBeVisible()
})

test('resource schema is collapsed and lists the profile columns', async ({ page }) => {
  await setupChart(page)

  const schema = page.getByTestId('resource-schema')
  await expect(schema).not.toHaveAttribute('open')
  await expect(schema.getByText('nom_region', { exact: true })).toBeHidden()

  await schema.locator('summary').click()
  await expect(schema.getByText('nom_region', { exact: true })).toBeVisible()
  await expect(schema.getByText('Nombre de logements', { exact: true })).toBeVisible()
})

test('value limit input is bounded to 50', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Description').fill('Limite du nombre de valeurs')
  const limitInput = page.getByLabel('Nombre de valeurs')
  await expect(limitInput).toHaveValue('')
  await expect(limitInput).toHaveAttribute('min', '1')
  await expect(limitInput).toHaveAttribute('max', '50')
  await expect(page.getByText('50 valeurs maximum', { exact: true })).toBeVisible()

  await limitInput.fill('80')
  await expect(limitInput).toHaveValue('50')
  await limitInput.fill('0')
  await expect(limitInput).toHaveValue('1')
  await limitInput.fill('7')
  await expect(limitInput).toHaveValue('7')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const body = response.request().postDataJSON() as { x_axis: { limit: number | null } }
  expect(body.x_axis.limit).toBe(7)
  const chart = (await response.json()) as Chart
  await deleteChart(page.request, chart.id)
})

test('an empty value limit is saved as no limit', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Description').fill('Sans limite du nombre de valeurs')
  const limitInput = page.getByLabel('Nombre de valeurs')
  await limitInput.fill('5')
  await limitInput.fill('')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const body = response.request().postDataJSON() as { x_axis: { limit: number | null } }
  expect(body.x_axis.limit).toBeNull()
  const chart = (await response.json()) as Chart
  await deleteChart(page.request, chart.id)
})

test('editing a chart PATCHes the value limit with the x axis', async ({ page }) => {
  const chart = await createChart(page.request, { title: `Chart configurator limit ${Date.now()}` })
  try {
    await mockTabular(page)
    await page.goto(`/admin/beta/charts/${chart.id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByLabel('Titre')).toHaveValue(chart.title)

    await page.getByLabel('Nombre de valeurs').fill('5')

    const responsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/1/visualizations/${chart.id}/`) && response.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
    const response = await responsePromise
    expect(response.status()).toBe(200)
    const body = response.request().postDataJSON() as { x_axis: { limit: number | null, column_x: string } }
    expect(body.x_axis.limit).toBe(5)
    expect(((await response.json()) as Chart).x_axis.limit).toBe(5)
    await expect(page.getByText('Graphique mis à jour !')).toBeVisible()
  }
  finally {
    await deleteChart(page.request, chart.id)
  }
})

test('switching datasets clears the selected resource and its schema', async ({ page }) => {
  await setupChart(page)

  const datasetSelect = page.getByTestId('searchable-select-jeu-de-donn-es')
  await datasetSelect.click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('Base SIRENE')
  await page.getByRole('option', { name: /Base SIRENE/i }).first().click()

  await expect(page.locator('#resource-select')).toHaveValue('')
  await expect(page.getByText('Schéma de la ressource')).toHaveCount(0)
  await expect(page.getByTestId('form-panel-empty')).toBeVisible()
})

test('ignores a late profile response after changing resources', async ({ page }) => {
  await withSecondTabularResource(page)
  await setupChart(page)
  const secondResourceId = await otherResourceId(page)

  const profileB = {
    profile: {
      header: ['epci', 'nb'],
      columns: {
        epci: { score: 1, format: 'string', python_type: 'string' },
        nb: { score: 1, format: 'int', python_type: 'int' },
      },
      formats: {},
      profile: {
        epci: { tops: [], nb_distinct: 5, nb_missing_values: 0 },
        nb: { tops: [], nb_distinct: 5, nb_missing_values: 0, min: 1, max: 9 },
      },
      encoding: 'utf-8',
      separator: ',',
      categorical: ['epci'],
      total_lines: 50,
      nb_duplicates: 0,
      columns_fields: {},
      columns_labels: {},
      header_row_idx: 0,
      heading_columns: 0,
      trailing_columns: 0,
    },
  }
  let releaseProfile!: () => void
  const profileGate = new Promise<void>((resolve) => {
    releaseProfile = resolve
  })
  let signalProfileRequest!: () => void
  const profileRequestStarted = new Promise<void>((resolve) => {
    signalProfileRequest = resolve
  })
  await page.route('**/api/resources/*/profile/', async (route) => {
    const resourceId = new URL(route.request().url()).pathname.match(/\/api\/resources\/([^/]+)\/profile\//)?.[1]
    if (resourceId !== secondResourceId) {
      return route.fallback()
    }
    signalProfileRequest()
    await profileGate
    await route.fulfill({ json: profileB })
  })

  const schema = page.getByTestId('resource-schema')
  await schema.locator('summary').click()
  await expect(schema.getByText('nom_region', { exact: true })).toBeVisible()
  const resourceSelect = page.locator('#resource-select')

  try {
    await resourceSelect.selectOption(secondResourceId)
    await profileRequestStarted
    // The first resource's columns are already loaded: selecting it back needs no request.
    await resourceSelect.selectOption(RESOURCE_ID)
    await expect(schema.getByText('nom_region', { exact: true })).toBeVisible()

    const lateProfileResponse = page.waitForResponse(response =>
      response.url().includes(`/api/resources/${secondResourceId}/profile/`),
    )
    releaseProfile()
    await (await lateProfileResponse).finished()
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))

    await expect(schema.getByText('nom_region', { exact: true })).toBeVisible()
    await expect(schema.getByText('epci', { exact: true })).toHaveCount(0)
    expect(await page.getByPlaceholder('Rechercher une colonne à afficher...').inputValue()).toBe('année_publication')
  }
  finally {
    releaseProfile()
  }
})

test.describe('for users without organizations', () => {
  test.use({ storageState: 'playwright/.auth/normal-user.json' })

  test('hides the no-organization notice in the chart configurator', async ({ page }) => {
    const meResponse = await page.request.get(`${API_BASE_URL}/api/1/me/`)
    expect(meResponse.ok()).toBe(true)
    const me = await meResponse.json() as { organizations: Array<unknown> }
    expect(me.organizations).toHaveLength(0)

    await page.goto('/admin/beta/chart')
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('producer-select')).toBeVisible()
    await expect(page.getByText('Vous n\'appartenez à aucune organisation', { exact: true })).toHaveCount(0)
  })
})

test('assistant waits for a resource before accepting messages', async ({ page }) => {
  await mockTabular(page)
  await page.goto('/admin/beta/chart')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('searchable-select-avec-qui-souhaitez-vous-publier').click()
  await page.getByRole('option', { name: 'Admin User', exact: true }).click()

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  await expect(page.locator('#assistant-waiting')).toBeVisible()
  await expect(page.getByLabel('Votre demande')).toBeDisabled()
})

test('chat message is sent with the selected resource and the conversation survives tab switches', async ({ page }) => {
  await setupChart(page)

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  await expect(page.getByTestId('assistant-panel')).toBeVisible()
  await expect(page.getByTestId('form-panel')).toBeHidden()
  await expect(page.locator('#resource-select')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sauvegarder le graphique' })).toBeHidden()

  const request = await sendAssistantMessage(page, 'Logements par région en histogramme')
  const body = request.postDataJSON() as { resource_id: string, visualization: { title: string, x_axis: { column_x: string } }, messages: Array<{ role: string }> }
  expect(body.resource_id).toBe(RESOURCE_ID)
  expect(body.visualization).toMatchObject({ title: 'Mon graphique', x_axis: { column_x: 'année_publication' } })
  const lastUserMessage = [...body.messages].reverse().find(m => m.role === 'user')
  expect(JSON.stringify(lastUserMessage)).toContain('Logements par région en histogramme')

  const reply = page.getByTestId('assistant-panel').locator('article').last()
  await expect(reply).toContainText('Graphique créé.')
  const replyText = await reply.innerText()

  await page.getByRole('button', { name: 'Formulaire', exact: true }).click()
  await expect(page.getByTestId('form-panel')).toBeVisible()
  await expect(page.getByTestId('assistant-panel')).toBeHidden()
  await expect(reply).toBeAttached()
  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  expect(await reply.innerText()).toBe(replyText)
})

test('changing resource after a chat message sends the new resource_id', async ({ page }) => {
  await withSecondTabularResource(page)
  await setupChart(page)

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  const firstRequest = await sendAssistantMessage(page, 'Logements par région')
  expect(firstRequest.postDataJSON()).toMatchObject({ resource_id: RESOURCE_ID })
  await expect(page.getByTestId('assistant-panel').locator('article').last()).toContainText('Graphique créé.')

  await page.getByRole('button', { name: 'Formulaire', exact: true }).click()
  const secondResourceId = await otherResourceId(page)
  await page.getByLabel('Choix de la ressource').selectOption(secondResourceId)

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  const secondRequest = await sendAssistantMessage(page, 'Logements par EPCI')
  expect(secondRequest.postDataJSON()).toMatchObject({ resource_id: secondResourceId })
})

test('test_a_tool_result_is_applied_only_once', async ({ page }) => {
  await setupChart(page)

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  await sendAssistantMessage(page, 'Premières doses par département, top 5')
  await expect(page.getByTestId('assistant-panel').locator('article').last()).toContainText('Graphique créé.')

  await page.getByRole('button', { name: 'Formulaire', exact: true }).click()
  await expect(page.getByLabel('Titre')).toHaveValue(ASSISTANT_CHART_TITLE)
  await expect(page.getByLabel('Nombre de valeurs')).toHaveValue('5')
  await expect(page.locator('#x-axis-sort-combined .input')).toContainText('n_cum_dose1 - Descendant')

  await page.getByLabel('Titre').fill('Titre modifié à la main')
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Assistant', exact: true }).click()
    await expect(page.getByTestId('assistant-panel')).toBeVisible()
    await page.getByRole('button', { name: 'Formulaire', exact: true }).click()
    await expect(page.getByTestId('form-panel')).toBeVisible()
  }
  await expect(page.getByLabel('Titre')).toHaveValue('Titre modifié à la main')
})

test('test_a_result_for_another_resource_is_ignored', async ({ page }) => {
  await setupChart(page)

  // This answer only: a create_chart for a resource that is no longer the selected one.
  await page.route(`${ASSISTANT_API_BASE}${ASSISTANT_CHAT_PATH}`, async (route) => {
    const origin = route.request().headers()['origin'] ?? '*'
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    }
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors })
      return
    }
    await route.fulfill({
      status: 200,
      headers: { ...cors, 'Content-Type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1' },
      body: createChartStream('00000000-0000-4000-8000-000000000000'),
    })
  })

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  await sendAssistantMessage(page, 'Premières doses par département')
  await expect(page.getByTestId('assistant-panel').locator('article').last()).toContainText('Graphique créé.')

  await page.getByRole('button', { name: 'Formulaire', exact: true }).click()
  await expect(page.getByLabel('Titre')).toHaveValue('Mon graphique')
  await expect(page.getByLabel('Nombre de valeurs')).toHaveValue('')
  expect(await page.getByPlaceholder('Rechercher une colonne à afficher...').inputValue()).toBe('année_publication')
})
