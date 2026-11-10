import type { Chart } from '@datagouv/components-next'
import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { clickOutside } from '../helpers'
import { ASSISTANT_CHAT_PATH, assistantChatStream, createChartOutput, createChartStream, routeAssistantStream } from '../assistantApi'
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
  const url = new URL(request.url())
  expect(`${url.origin}${url.pathname}`).toBe(`${ASSISTANT_API_BASE}${ASSISTANT_CHAT_PATH}`)
  expect(url.searchParams.get('lang')).toBe('fr')
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

test('raw values offer every column as Y column', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Calcul').selectOption('Aucun (valeurs brutes)')
  await page.getByTestId('searchable-select-colonne-y').click()

  await expect(page.getByRole('option', { name: 'Nombre de logements', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'libellé_EPCI', exact: true })).toBeVisible()
})
test('calculation defaults to counting rows and hides the Y column', async ({ page }) => {
  await setupChart(page)

  await expect(page.getByLabel('Calcul')).toHaveValue('count')
  await expect(page.getByTestId('searchable-select-colonne-y')).toBeHidden()
})
test('calculation can be changed to sum on a numeric Y column', async ({ page }) => {
  await setupChart(page)

  const calculationSelect = page.getByLabel('Calcul')
  await calculationSelect.selectOption('Somme')
  await expect(calculationSelect).toHaveValue('sum')

  await page.getByTestId('searchable-select-colonne-y').click()
  await expect(page.getByRole('option', { name: 'libellé_EPCI', exact: true })).toBeHidden()
  await page.getByRole('option', { name: 'Nombre de logements', exact: true }).click()
  await clickOutside(page)

  await expect(page.getByPlaceholder('Rechercher une colonne Y...')).toHaveValue('Nombre de logements')
  await expect(calculationSelect).toHaveValue('sum')
})
test('calculation can be changed to avg', async ({ page }) => {
  await setupChart(page)

  const calculationSelect = page.getByLabel('Calcul')
  await calculationSelect.selectOption('Moyenne')

  await expect(calculationSelect).toHaveValue('avg')
  await expect(page.getByTestId('searchable-select-colonne-y')).toBeVisible()
})
test('sort select displays dynamic column names', async ({ page }) => {
  await setupChart(page)

  const listbox = page.locator('#x-axis-sort-combined')
  await listbox.click()

  const sortOptions = await listbox.locator('role=option').allTextContents()

  // The default series counts the X column: its counts can be sorted too.
  expect(sortOptions).toHaveLength(5)
  expect(sortOptions[0]).toBe('Aucun')
  expect(sortOptions[3]).toContain('Compter - Ascendant')
  expect(sortOptions[4]).toContain('Compter - Descendant')

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

  await page.getByLabel('Calcul').selectOption('Aucun (valeurs brutes)')
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

  const labelInput = page.getByLabel('Label de l’axe Y')
  const labelValue = await labelInput.inputValue()
  expect(labelValue).toBe('')
})

test('y-axis label input can be filled', async ({ page }) => {
  await setupChart(page)

  const labelInput = page.getByLabel('Label de l’axe Y')
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

  const unitPositionSelect = page.getByLabel('Position', { exact: true })
  const unitPosition = await unitPositionSelect.inputValue()
  expect(unitPosition).toBe('suffix')
})

test('y-axis unit position can be changed to prefix', async ({ page }) => {
  await setupChart(page)

  const unitPositionSelect = page.getByLabel('Position', { exact: true })
  await unitPositionSelect.selectOption('Préfixe')

  const unitPosition = await unitPositionSelect.inputValue()
  expect(unitPosition).toBe('prefix')
})

test.describe('when the API rejects the chart', () => {
  test.use({ allowedConsoleMessages: ['the server responded with a status of 400'] })

  test('saving shows the API error without an uncaught error', async ({ page }) => {
    await setupChart(page)
    // Matched on the path: the request carries `?lang=`, and a missed route would create a real chart.
    await page.route(url => url.pathname === '/api/1/visualizations/', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback()
      await route.fulfill({ status: 400, json: { message: 'Validation error', errors: { description: ['Field is required'] } } })
    })
    // Filled so that the request passes the form validation and reaches the API.
    await page.getByLabel('Description').fill('Description')

    await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
    await expect(page.getByText(/Le formulaire contient des erreurs/)).toBeVisible()
  })
})

test('marks the title and the description as required', async ({ page }) => {
  await setupChart(page)

  await expect(page.getByLabel('Titre')).toHaveAttribute('aria-required', 'true')
  await expect(page.getByLabel('Description')).toHaveAttribute('aria-required', 'true')
})

/** Counts the chart creations the page sends, and keeps the assistant chat off the network. */
function trackChartCreations(page: Page) {
  const posts: Array<string> = []
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/1/visualizations/') posts.push(request.url())
  })
  return posts
}

test('saving from the assistant tab without a description warns in the footer and leads to the field', async ({ page }) => {
  await page.route('**/assistant/chat/**', route => route.abort())
  await setupChart(page)
  const posts = trackChartCreations(page)

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()

  const footer = page.getByTestId('chart-save-footer')
  const warning = footer.getByRole('alert')
  await expect(warning).toContainText('Le titre et la description sont obligatoires pour enregistrer le graphique.')
  await expect(warning).toContainText('Description')
  await expect(warning).not.toContainText('Titre')
  expect(posts).toHaveLength(0)

  await warning.getByRole('button', { name: 'Compléter' }).click()
  await expect(page.getByRole('tab', { name: 'Édition manuelle' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByLabel('Description')).toBeFocused()

  await page.getByLabel('Description').fill('Description complétée')
  await expect(warning).toBeHidden()
  await expect(page.getByLabel('Description')).not.toHaveAttribute('aria-invalid', 'true')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const saved = (await response.json()) as Chart
  try {
    expect(response.status()).toBe(201)
    expect(saved.description).toBe('Description complétée')
  }
  finally {
    await deleteChart(page.request, saved.id)
  }
})

test('saving from the manual tab with empty required fields shows their errors and focuses the first one', async ({ page }) => {
  await setupChart(page)
  const posts = trackChartCreations(page)

  await page.getByLabel('Titre').fill('')
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()

  for (const label of ['Titre', 'Description']) {
    const field = page.getByLabel(label)
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    const errorId = await field.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    await expect(page.locator(`#${errorId}`)).toHaveText('Le champ est requis.')
    await expect(page.locator(`#${errorId}`)).toHaveClass(/fr-error-text/)
  }
  await expect(page.getByLabel('Titre')).toBeFocused()
  expect(posts).toHaveLength(0)
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

  await page.getByLabel('Calcul').selectOption('Moyenne')
  await page.getByTestId('searchable-select-colonne-y').click()
  await page.getByRole('option', { name: 'Taux de logements vacants* (en %)', exact: true }).first().click()

  await page.getByLabel('Label de l’axe Y').fill('Taux (%)')
  await page.locator('#y-axis-min').fill('0')
  await page.locator('#y-axis-max').fill('100')
  await page.locator('#y-axis-unit').fill('%')
  await page.getByLabel('Position', { exact: true }).selectOption('prefix')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart

  await page.waitForTimeout(300)
  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()

  expect(responseBody!.title).toBe('Graphique complet')
  expect(responseBody.series[0]).toMatchObject({ aggregate_y: 'avg', column_y: 'Taux de logements vacants* (en %)' })

  expect(await page.getByLabel('Titre').inputValue()).toBe('Graphique complet')
  expect(await page.getByLabel('Description').inputValue()).toBe('Test complet de configuration')

  await expect(page.getByRole('radio', { name: 'Courbe' })).toBeChecked()

  expect(await page.getByLabel('Type', { exact: true }).first().inputValue()).toBe('continuous')
  expect(await page.getByLabel('Calcul').inputValue()).toBe('avg')
  expect(await page.getByLabel('Label de l’axe Y').inputValue()).toBe('Taux (%)')
  expect(await page.locator('#y-axis-min').inputValue()).toBe('0')
  expect(await page.locator('#y-axis-max').inputValue()).toBe('100')
  expect(await page.locator('#y-axis-unit').inputValue()).toBe('%')
  expect(await page.getByLabel('Position', { exact: true }).inputValue()).toBe('prefix')

  await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${responseBody!.id}/`)
})

test('y-axis column options update when selecting different resource', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Calcul').selectOption('Aucun (valeurs brutes)')
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

test('calculation offers counting rows, aggregates and raw values', async ({ page }) => {
  await setupChart(page)

  const options = await page.getByLabel('Calcul').locator('option').allTextContents()
  expect(options.map(option => option.trim())).toEqual(['Compter les lignes', 'Somme', 'Moyenne', 'Minimum', 'Maximum', 'Aucun (valeurs brutes)'])
})
test('counting rows hides the Y column again', async ({ page }) => {
  await setupChart(page)

  const calculationSelect = page.getByLabel('Calcul')
  await calculationSelect.selectOption('Somme')
  await expect(page.getByTestId('searchable-select-colonne-y')).toBeVisible()

  await calculationSelect.selectOption('Compter les lignes')
  await expect(page.getByTestId('searchable-select-colonne-y')).toBeHidden()
})
test('raw values after counting keep the X column as Y column', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Calcul').selectOption('Aucun (valeurs brutes)')

  await expect(page.getByPlaceholder('Rechercher une colonne Y...')).toHaveValue('année_publication')
})
test('changing x-axis updates count serie column_y to the new x-axis column', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Calcul').selectOption('Compter les lignes')

  const xAxisSelect = page.getByTestId('searchable-select-choisir-quoi-afficher')
  await xAxisSelect.click()
  await page.getByRole('option', { name: 'nom_region', exact: true }).click()
  await clickOutside(page)
  // Required by the API.
  await page.getByLabel('Description').fill('Description')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const responseBody = (await (await responsePromise).json()) as Chart

  expect(responseBody.series[0]).toMatchObject({ aggregate_y: 'count', column_y: 'nom_region' })
  await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${responseBody.id}/`)
})

const CALCULATION_PAYLOADS = [
  { label: 'Compter les lignes', column: null, sent: { aggregate_y: 'count', column_y: 'année_publication' } },
  { label: 'Somme', column: 'Nombre de logements', sent: { aggregate_y: 'sum', column_y: 'Nombre de logements' } },
  { label: 'Moyenne', column: 'Nombre de logements', sent: { aggregate_y: 'avg', column_y: 'Nombre de logements' } },
  { label: 'Minimum', column: 'Nombre de logements', sent: { aggregate_y: 'min', column_y: 'Nombre de logements' } },
  { label: 'Maximum', column: 'Nombre de logements', sent: { aggregate_y: 'max', column_y: 'Nombre de logements' } },
  { label: 'Aucun (valeurs brutes)', column: 'libellé_EPCI', sent: { aggregate_y: null, column_y: 'libellé_EPCI' } },
]

for (const { label, column, sent } of CALCULATION_PAYLOADS) {
  test(`calculation "${label}" sends aggregate_y ${sent.aggregate_y} on column_y ${sent.column_y}`, async ({ page }) => {
    await setupChart(page)

    await page.getByLabel('Calcul').selectOption(label)
    if (column) {
      await page.getByTestId('searchable-select-colonne-y').click()
      await page.getByRole('option', { name: column, exact: true }).click()
      await clickOutside(page)
    }
    // Required by the API.
    await page.getByLabel('Description').fill('Description')

    const requestPromise = page.waitForRequest(request => request.url().includes('/api/1/visualizations/') && request.method() === 'POST')
    const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
    await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
    const request = await requestPromise
    const responseBody = (await (await responsePromise).json()) as Chart

    expect(request.postDataJSON().series[0]).toMatchObject(sent)
    await page.request.delete(`${API_BASE_URL}/api/1/visualizations/${responseBody.id}/`)
  })
}
test('saving chart with count aggregation round-trips correctly', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Count Chart')
  await page.getByLabel('Description').fill('Test count aggregation')

  await page.getByLabel('Calcul').selectOption('Compter les lignes')

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

    await page.getByLabel('Calcul').selectOption('Aucun (valeurs brutes)')
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
    'or=(and(nom_region__exact."Bretagne",année_publication__exact."2020"),année_publication__exact."2021")',
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
    'or=(nom_region__exact."Bretagne",année_publication__exact."2020")&année_publication__exact=2021',
  )
})

test('opens on the assistant panel with its suggestions and context once a resource is chosen', async ({ page }) => {
  await mockTabular(page)
  await page.goto('/admin/beta/chart')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('tab', { name: 'Assistant' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('assistant-panel')).toBeVisible()
  await expect(page.getByTestId('form-panel')).toBeHidden()

  await setupChart(page)
  await page.getByRole('tab', { name: 'Assistant' }).click()
  const suggestions = page.getByTestId('assistant-suggestion')
  await expect(suggestions.first()).toBeVisible()
  const context = page.getByRole('group', { name: 'Contexte utilisé par l’assistant' })
  await expect(context).toContainText('Visualisation en cours')
  await expect(page.getByText('L’assistant peut faire des erreurs.')).toBeVisible()

  // A suggestion only fills the composer: nothing is sent before the user confirms.
  let sent = false
  page.on('request', (request) => {
    if (request.url().includes(ASSISTANT_CHAT_PATH)) sent = true
  })
  const suggestion = await suggestions.last().innerText()
  await suggestions.last().click()
  await expect(page.getByLabel('Votre demande')).toHaveValue(suggestion)
  await expect(page.getByLabel('Votre demande')).toBeFocused()
  expect(sent).toBe(false)
})

test('shows the form panel with its pickers and save action', async ({ page }) => {
  await setupChart(page)

  await expect(page.getByRole('tab', { name: 'Édition manuelle' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('form-panel')).toBeVisible()
  await expect(page.getByTestId('assistant-panel')).toBeHidden()
  await expect(page.getByTestId('producer-select')).toBeVisible()
  await expect(page.getByTestId('searchable-select-jeu-de-donn-es')).toBeVisible()
  await expect(page.locator('#resource-select')).toBeVisible()
  await expect(page.getByTestId('source-status')).toContainText('colonnes disponibles')
  await expect(page.getByRole('button', { name: 'Sauvegarder le graphique' })).toBeVisible()
})

test('opens an existing chart on the manual editing tab', async ({ page }) => {
  const chart = await createChart(page.request, { title: `Chart configurator default tab ${Date.now()}` })
  try {
    await mockTabular(page)
    await page.goto(`/admin/beta/charts/${chart.id}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('tab', { name: 'Édition manuelle' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tab', { name: 'Assistant' })).toHaveAttribute('aria-selected', 'false')
    await expect(page.getByTestId('form-panel')).toBeVisible()
    await expect(page.getByTestId('assistant-panel')).toBeHidden()
    await expect(page.getByRole('heading', { level: 2, name: 'Modifier la visualisation' })).toBeVisible()
  }
  finally {
    await deleteChart(page.request, chart.id)
  }
})

test('the editor tabs follow the arrow, Home and End keys with a roving tabindex', async ({ page }) => {
  await mockTabular(page)
  await page.goto('/admin/beta/chart')
  await page.waitForLoadState('networkidle')

  const assistantTab = page.getByRole('tab', { name: 'Assistant' })
  const manualTab = page.getByRole('tab', { name: 'Édition manuelle' })
  await expect(assistantTab).toHaveAttribute('tabindex', '0')
  await expect(manualTab).toHaveAttribute('tabindex', '-1')
  await expect(page.getByRole('tabpanel', { name: 'Assistant' })).toBeVisible()

  await assistantTab.focus()
  await page.keyboard.press('ArrowRight')
  await expect(manualTab).toBeFocused()
  await expect(manualTab).toHaveAttribute('aria-selected', 'true')
  await expect(manualTab).toHaveAttribute('tabindex', '0')
  await expect(page.getByRole('tabpanel', { name: 'Édition manuelle' })).toBeVisible()

  await page.keyboard.press('Home')
  await expect(assistantTab).toBeFocused()
  await expect(assistantTab).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('End')
  await expect(manualTab).toBeFocused()

  await page.keyboard.press('ArrowLeft')
  await expect(assistantTab).toBeFocused()
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

test('changing the x column moves every count series to it', async ({ page }) => {
  const countSerie = { type: 'histogram', column_y: 'année_publication', aggregate_y: 'count', resource_id: RESOURCE_ID, column_x_name_override: null, filters: null } as const
  const chart = await createChart(page.request, {
    title: `Chart configurator counts ${Date.now()}`,
    xColumn: 'année_publication',
    series: [countSerie, { ...countSerie }],
  })
  try {
    await mockTabular(page)
    await page.goto(`/admin/beta/charts/${chart.id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByLabel('Titre')).toHaveValue(chart.title)

    await page.getByTestId('searchable-select-choisir-quoi-afficher').click()
    await page.getByRole('option', { name: 'nom_region', exact: true }).click()
    await page.keyboard.press('Escape')

    const responsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/1/visualizations/${chart.id}/`) && response.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
    const response = await responsePromise
    const body = response.request().postDataJSON() as { series: Array<{ column_y: string, aggregate_y: string }> }
    expect(body.series.map(s => [s.column_y, s.aggregate_y])).toEqual([['nom_region', 'count'], ['nom_region', 'count']])
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

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await expect(page.locator('#assistant-waiting')).toBeVisible()
  await expect(page.getByLabel('Votre demande')).toBeDisabled()
})

test('chat message is sent with the selected resource and the conversation survives tab switches', async ({ page }) => {
  // Same script as the fake services, routed in the page so a local run never reaches a real assistant.
  await routeAssistantStream(page, assistantChatStream)
  await setupChart(page)

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await expect(page.getByTestId('assistant-panel')).toBeVisible()
  await expect(page.getByTestId('form-panel')).toBeHidden()
  await expect(page.locator('#resource-select')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sauvegarder le graphique' })).toBeVisible()

  const request = await sendAssistantMessage(page, 'Logements par région en histogramme')
  const body = request.postDataJSON() as { resource_id: string, visualization: Record<string, unknown>, messages: Array<{ role: string }> }
  expect(body.resource_id).toBe(RESOURCE_ID)
  expect(body.visualization).toMatchObject({ exists: false, title: 'Mon graphique', x_axis: { column_x: 'année_publication' } })
  // Only the chart itself: no ownership, visibility or extras.
  expect(Object.keys(body.visualization).sort()).toEqual(['chart_type', 'description', 'exists', 'filter', 'series', 'title', 'x_axis', 'y_axis'])
  expect(Object.keys((body.visualization.series as Array<object>)[0]!).sort()).toEqual(['aggregate_y', 'column_y', 'filters', 'resource_id', 'type'])
  const lastUserMessage = [...body.messages].reverse().find(m => m.role === 'user')
  expect(JSON.stringify(lastUserMessage)).toContain('Logements par région en histogramme')

  const reply = page.getByTestId('assistant-panel').locator('article').last()
  await expect(reply).toContainText('Graphique créé.')
  const replyText = await reply.innerText()

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await expect(page.getByTestId('form-panel')).toBeVisible()
  await expect(page.getByTestId('assistant-panel')).toBeHidden()
  await expect(reply).toBeAttached()
  await page.getByRole('tab', { name: 'Assistant' }).click()
  expect(await reply.innerText()).toBe(replyText)
})

test('changing resource after a chat message sends the new resource_id', async ({ page }) => {
  // Same script as the fake services, routed in the page so a local run never reaches a real assistant.
  await routeAssistantStream(page, assistantChatStream)
  await withSecondTabularResource(page)
  await setupChart(page)

  await page.getByRole('tab', { name: 'Assistant' }).click()
  const firstRequest = await sendAssistantMessage(page, 'Logements par région')
  expect(firstRequest.postDataJSON()).toMatchObject({ resource_id: RESOURCE_ID })
  await expect(page.getByTestId('assistant-panel').locator('article').last()).toContainText('Graphique créé.')

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  const secondResourceId = await otherResourceId(page)
  await page.getByLabel('Choix de la ressource').selectOption(secondResourceId)

  await page.getByRole('tab', { name: 'Assistant' }).click()
  const secondRequest = await sendAssistantMessage(page, 'Logements par EPCI')
  expect(secondRequest.postDataJSON()).toMatchObject({ resource_id: secondResourceId })
})

test('test_a_tool_result_is_applied_only_once', async ({ page }) => {
  // Same script as the fake services, routed in the page so a local run never reaches a real assistant.
  await routeAssistantStream(page, assistantChatStream)
  await setupChart(page)

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await sendAssistantMessage(page, 'Premières doses par département, top 5')
  await expect(page.getByTestId('assistant-panel').locator('article').last()).toContainText('Graphique créé.')

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await expect(page.getByLabel('Titre')).toHaveValue(ASSISTANT_CHART_TITLE)
  await expect(page.getByLabel('Nombre de valeurs')).toHaveValue('5')
  await expect(page.locator('#x-axis-sort-combined .input')).toContainText('n_cum_dose1 - Descendant')

  await page.getByLabel('Titre').fill('Titre modifié à la main')
  for (let i = 0; i < 2; i++) {
    await page.getByRole('tab', { name: 'Assistant' }).click()
    await expect(page.getByTestId('assistant-panel')).toBeVisible()
    await page.getByRole('tab', { name: 'Édition manuelle' }).click()
    await expect(page.getByTestId('form-panel')).toBeVisible()
  }
  await expect(page.getByLabel('Titre')).toHaveValue('Titre modifié à la main')
})

test('test_a_result_for_another_resource_is_ignored', async ({ page }) => {
  await setupChart(page)

  // A create_chart for a resource that is no longer the selected one.
  await routeAssistantStream(page, createChartStream('00000000-0000-4000-8000-000000000000'))

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await sendAssistantMessage(page, 'Premières doses par département')
  await expect(page.getByTestId('assistant-panel').locator('article').last()).toContainText('Graphique créé.')

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await expect(page.getByLabel('Titre')).toHaveValue('Mon graphique')
  await expect(page.getByLabel('Nombre de valeurs')).toHaveValue('')
  expect(await page.getByPlaceholder('Rechercher une colonne à afficher...').inputValue()).toBe('année_publication')
})

test('a count chart sorted by Y keeps its sort', async ({ page }) => {
  await setupChart(page)

  // Top 5 regions by number of rows: count of the X column, sorted by the counts.
  const output = createChartOutput(RESOURCE_ID)
  output.chart.x_axis = { ...output.chart.x_axis, column_x: 'nom_region' }
  output.chart.series = [{ ...output.chart.series[0]!, column_y: 'nom_region', aggregate_y: 'count' }]
  await routeAssistantStream(page, createChartStream(RESOURCE_ID, output))

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await sendAssistantMessage(page, 'Les 5 régions les plus représentées')
  await expect(page.getByTestId('assistant-panel').locator('article').last()).toContainText('Graphique créé.')

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await expect(page.getByLabel('Nombre de valeurs')).toHaveValue('5')
  await expect(page.locator('#x-axis-sort-combined .input')).toContainText('Compter - Descendant')

  const listbox = page.locator('#x-axis-sort-combined')
  await listbox.click()
  await expect(listbox.getByRole('option', { name: 'Compter - Ascendant' })).toBeVisible()
})

test('styles section is open by default and can be collapsed', async ({ page }) => {
  await setupChart(page)

  const styles = page.getByTestId('chart-styles')
  await expect(styles).toHaveAttribute('open')
  await expect(page.getByLabel('Label de l’axe Y')).toBeVisible()

  await styles.locator('summary').click()
  await expect(page.getByLabel('Label de l’axe Y')).toBeHidden()
})
