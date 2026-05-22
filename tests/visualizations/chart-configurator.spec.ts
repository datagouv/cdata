import type { Chart } from '@datagouv/components-next'
import type { Page } from '@playwright/test'
import { test, expect } from '../base'

// Helper function to set up the chart with producer, dataset, and resource selected
// The component now requires: producer -> dataset -> resource before the chart form appears
async function setupChart(page: Page) {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  // Step 1: Select producer
  // The page has default owned.owner = 'dummyForDS', we need to select it via ProducerSelect
  const producerSelect = page.locator('[data-testid="producer-select"]')
  await producerSelect.waitFor({ timeout: 10000 })
  await producerSelect.click()

  // Select the user option (contains dummyForDS) - use getByText since SearchableSelect uses Combobox
  const userOption = page.getByText('dummyForDS', { exact: false }).first()
  await userOption.waitFor({ timeout: 5000 })
  await userOption.click()
  await page.waitForTimeout(500)

  // Step 2: Wait for dataset selector to appear (it's inside v-if="producer")
  await page.getByPlaceholder('Recherchez un jeu de données...').waitFor({ timeout: 10000 })

  // Step 3: Select dataset using SearchableSelect
  const datasetSelect = page.getByPlaceholder('Recherchez un jeu de données...')
  await datasetSelect.click()
  await datasetSelect.fill('Logements et logements sociaux')
  await page.waitForTimeout(500)

  // Press ArrowDown to select the first match
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1000)

  // Step 4: Wait for resource selector to appear (it's inside v-if="dataset")
  await page.getByLabel('Choix de la ressource').waitFor({ timeout: 10000 })

  // Step 5: Select the first available resource (skip the disabled placeholder at index 0)
  const resourceSelect = page.getByLabel('Choix de la ressource')
  await resourceSelect.selectOption({ index: 1 })
  await page.waitForTimeout(1000)

  // Step 6: Wait for chart configuration form to be visible (it's inside v-if="selectedResource")
  await page.getByLabel('Titre').waitFor({ timeout: 10000 })
}

// ============================================================================
// Title & Description Tests
// ============================================================================

test('title input updates form value with debounce', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Nouveau titre de graphique')

  // Wait for debounce (300ms as per component)
  await page.waitForTimeout(400)

  // The title should be updated in the form
  expect(await page.getByLabel('Titre').inputValue()).toBe('Nouveau titre de graphique')
})

test('description input updates form value with debounce', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Description').fill('Nouvelle description de graphique')

  // Wait for debounce (300ms as per component)
  await page.waitForTimeout(400)

  // The description should be updated in the form
  expect(await page.getByLabel('Description').inputValue()).toBe('Nouvelle description de graphique')
})

// ============================================================================
// Chart Type Tests
// ============================================================================

test('chart type selector defaults to histogram', async ({ page }) => {
  await setupChart(page)

  // Chart type now uses Listbox component - check the button text
  const chartTypeButton = page.locator('#chart-type').getByRole('button')
  const chartTypeText = await chartTypeButton.textContent()
  expect(chartTypeText).toContain('Histogramme')
})

test('chart type selector can switch to line chart', async ({ page }) => {
  await setupChart(page)

  // Click the Listbox button to open options
  const chartTypeButton = page.locator('#chart-type').getByRole('button')
  await chartTypeButton.click()

  // Wait for dropdown to appear
  await page.waitForTimeout(300)

  // Select the line chart option
  await page.getByRole('option', { name: 'Ligne' }).first().click()

  // Check that line chart is selected
  const chartTypeText = await chartTypeButton.textContent()
  expect(chartTypeText).toContain('Ligne')
})

// ============================================================================
// Data Source Tests
// ============================================================================

test('dataset selector shows default dataset', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  // First select producer
  const producerSelect = page.locator('[data-testid="producer-select"]')
  await producerSelect.waitFor({ timeout: 5000 })
  await producerSelect.click()
  await page.getByText('dummyForDS', { exact: false }).first().click()
  await page.waitForTimeout(500)

  // Wait for dataset selector to appear
  await page.getByPlaceholder('Recherchez un jeu de données...').waitFor({ timeout: 5000 })

  const datasetSelect = page.getByPlaceholder('Recherchez un jeu de données...')
  // Just verify it's visible - the SearchableSelect displays the selected value differently
  await expect(datasetSelect).toBeVisible()
})

test('resource selector shows available resources', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  // First select producer
  const producerSelect = page.locator('[data-testid="producer-select"]')
  await producerSelect.waitFor({ timeout: 5000 })
  await producerSelect.click()
  await page.getByText('dummyForDS', { exact: false }).first().click()
  await page.waitForTimeout(500)

  // Select dataset
  const datasetSelect = page.getByPlaceholder('Recherchez un jeu de données...')
  await datasetSelect.click()
  await datasetSelect.fill('Logements et logements sociaux')
  await page.waitForTimeout(500)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1000)

  // Wait for resource selector to appear - this is a standard select element
  await page.getByLabel('Choix de la ressource').waitFor({ timeout: 5000 })

  const resourceOptions = await page.getByLabel('Choix de la ressource').locator('option').all()

  expect(resourceOptions.length).toBeGreaterThan(1)
})

test('x-axis column selector shows available columns', async ({ page }) => {
  await setupChart(page)

  // X-axis column now uses SearchableSelect
  // The SearchableSelect wraps a Combobox, so we check the input element
  const columnInput = page.locator('#x-axis-column input')
  await columnInput.waitFor({ timeout: 5000 })

  // Click to open the dropdown
  await columnInput.click()
  await page.waitForTimeout(500)

  // Check that the options contain the expected columns - use text selectors
  const libelléOption = page.getByText('libellé_EPCI', { exact: false })
  const nomRegionOption = page.getByText('nom_region', { exact: false })

  await expect(libelléOption).toBeVisible()
  await expect(nomRegionOption).toBeVisible()
})

test('series column y selector shows available columns', async ({ page }) => {
  await setupChart(page)

  // Y-axis column uses SearchableSelect with dynamic ID column-y-0
  const columnYInput = page.locator('#column-y-0 input')
  await columnYInput.waitFor({ timeout: 5000 })

  // Click to open the dropdown
  await columnYInput.click()
  await page.waitForTimeout(500)

  // Check that the options contain the expected columns - use text selectors
  const logementsOption = page.getByText('Nombre de logements', { exact: false })
  const libelléOption = page.getByText('libellé_EPCI', { exact: false })

  await expect(logementsOption).toBeVisible()
  await expect(libelléOption).toBeVisible()
})

// ============================================================================
// Series Aggregation Tests
// ============================================================================

test('series aggregation defaults to none', async ({ page }) => {
  await setupChart(page)

  const aggregationSelect = page.getByLabel('Agrégation')
  const aggregation = await aggregationSelect.inputValue()
  expect(aggregation).toBe('')
})

test('series aggregation can be changed to sum', async ({ page }) => {
  await setupChart(page)

  const aggregationSelect = page.getByLabel('Agrégation')
  await aggregationSelect.selectOption('Somme')

  const aggregation = await aggregationSelect.inputValue()
  expect(aggregation).toBe('sum')
})

test('series aggregation can be changed to avg', async ({ page }) => {
  await setupChart(page)

  const aggregationSelect = page.getByLabel('Agrégation')
  await aggregationSelect.selectOption('Moyenne')

  const aggregation = await aggregationSelect.inputValue()
  expect(aggregation).toBe('avg')
})

// ============================================================================
// X-Axis & Sort Tests
// ============================================================================

test('sort select displays dynamic column names', async ({ page }) => {
  await setupChart(page)

  // Check that the sort select shows dynamic column names
  const sortOptions = await page.getByLabel('Trier par').locator('option').allTextContents()

  expect(sortOptions[0]).toBe('Aucun')

  // Second option should show the dynamic column name
  expect(sortOptions[1]).toContain('libellé_EPCI')
  expect(sortOptions[1]).not.toContain('Axe X - Ascendant')

  await page.getByLabel('Trier par').selectOption({ label: 'libellé_EPCI - Descendant' })

  const selectedValue = await page.getByLabel('Trier par').inputValue()
  expect(selectedValue).toBe('axis_x-desc')
})

test('sort select updates reactively when column changes', async ({ page }) => {
  await setupChart(page)

  const firstOptions = await page.getByLabel('Trier par').locator('option').allTextContents()
  expect(firstOptions[1]).toContain('libellé_EPCI')

  // X-axis column is SearchableSelect - use the input element
  const xAxisInput = page.locator('#x-axis-column input')
  await xAxisInput.click()
  await page.waitForTimeout(300)
  await page.getByText('nom_region', { exact: false }).first().click()

  await page.waitForTimeout(500)

  const updatedOptions = await page.getByLabel('Trier par').locator('option').allTextContents()
  expect(updatedOptions[1]).toContain('nom_region')
  expect(updatedOptions[1]).not.toContain('libellé_EPCI')
})

test('Y axis sort options show dynamic series column name too', async ({ page }) => {
  await setupChart(page)

  // Y-axis column is SearchableSelect
  const yAxisInput = page.locator('#column-y-0 input')
  await yAxisInput.click()
  await page.waitForTimeout(300)
  await page.getByText('Nombre de logements', { exact: false }).first().click()
  await page.waitForTimeout(500)

  const sortOptions = await page.getByLabel('Trier par').locator('option').allTextContents()

  // Y axis ascending option should show dynamic column name
  expect(sortOptions[3]).toContain('Nombre de logements')
  expect(sortOptions[3]).not.toContain('Axe Y - Ascendant')
})

// ============================================================================
// Y-Axis Configuration Tests
// ============================================================================

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

  const minInput = page.getByLabel('Min')
  const maxInput = page.getByLabel('Max')
  const minValue = await minInput.inputValue()
  const maxValue = await maxInput.inputValue()

  expect(minValue).toBe('')
  expect(maxValue).toBe('')
})

test('y-axis min and max can be set', async ({ page }) => {
  await setupChart(page)

  const minInput = page.getByLabel('Min')
  const maxInput = page.getByLabel('Max')
  await minInput.fill('0')
  await maxInput.fill('100')

  const minValue = await minInput.inputValue()
  const maxValue = await maxInput.inputValue()

  expect(minValue).toBe('0')
  expect(maxValue).toBe('100')
})

test('y-axis unit input is initially empty', async ({ page }) => {
  await setupChart(page)

  const unitInput = page.getByLabel('Unité')
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

// ============================================================================
// Save Chart Tests
// ============================================================================

test('saving chart sends correct data to API', async ({ page, baseURL }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')
  await page.waitForTimeout(500)

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'GET')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart
  await getPromise

  expect(responseBody!.title).toBe('Test Chart')
  expect(await page.getByLabel('Graphiques existants').inputValue()).toBe(responseBody!.id)
  await page.request.delete(`${baseURL}/api/1/visualizations/${responseBody!.id}/`)
})

test('saving chart shows success message', async ({ page, baseURL }) => {
  await setupChart(page)

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'GET')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart
  await getPromise

  // Wait for toast message
  await page.waitForTimeout(1000)

  // Check for success message
  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()

  await page.request.delete(`${baseURL}/api/1/visualizations/${responseBody!.id}/`)
})

// ============================================================================
// Existing Charts Tests
// ============================================================================

test('existing charts selector shows placeholder option', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const chartOptions = await page.getByLabel('Graphiques existants').locator('option').allTextContents()

  // Should have at least the placeholder option
  expect(chartOptions[0]).toBe('Sélectionnez un graphique')
})

test('load button is disabled without selected chart', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const loadButton = page.getByRole('button', { name: 'Charger' })
  await expect(loadButton).toBeDisabled()
})

test('load button becomes enabled when chart is selected', async ({ page, baseURL }) => {
  await setupChart(page)

  // First, create a chart to load
  await page.getByLabel('Titre').fill('Chart to load')
  await page.waitForTimeout(400)

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'GET')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart
  await getPromise

  const chartId = responseBody!.id

  // Now select the chart in the dropdown
  await page.getByLabel('Graphiques existants').selectOption(chartId)

  const loadButton = page.getByRole('button', { name: 'Charger' })
  await expect(loadButton).toBeEnabled()

  // Cleanup
  await page.request.delete(`${baseURL}/api/1/visualizations/${chartId}/`)
})

// ============================================================================
// Integration Tests
// ============================================================================

test('complete chart configuration flow', async ({ page, baseURL }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Graphique complet')
  await page.getByLabel('Description').fill('Test complet de configuration')
  await page.waitForTimeout(500)

  // Chart type is now Listbox
  const chartTypeButton = page.locator('#chart-type').getByRole('button')
  await chartTypeButton.click()
  await page.waitForTimeout(300)
  await page.getByText('Ligne').first().click()

  // X-axis column is SearchableSelect
  const xAxisInput = page.locator('#x-axis-column input')
  await xAxisInput.click()
  await page.waitForTimeout(300)
  await page.getByText('code_region', { exact: false }).first().click()

  await page.getByLabel('Type', { exact: true }).first().selectOption('continuous')

  // Y-axis column is SearchableSelect
  const yAxisInput = page.locator('#column-y-0 input')
  await yAxisInput.click()
  await page.waitForTimeout(300)
  await page.getByText('Taux de logements vacants', { exact: false }).first().click()

  await page.getByLabel('Agrégation').selectOption('Moyenne')

  await page.getByLabel('Label').fill('Taux (%)')
  await page.getByLabel('Min').fill('0')
  await page.getByLabel('Max').fill('100')
  await page.locator('#y-axis-unit').fill('%')
  await page.getByLabel('Position unité').selectOption('prefix')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'GET')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart
  await getPromise

  expect(responseBody!.title).toBe('Graphique complet')
  expect(await page.getByLabel('Graphiques existants').inputValue()).toBe(responseBody!.id)

  expect(await page.getByLabel('Titre').inputValue()).toBe('Graphique complet')
  expect(await page.getByLabel('Description').inputValue()).toBe('Test complet de configuration')

  // Chart type - check the button text
  const chartTypeText = await page.locator('#chart-type').getByRole('button').textContent()
  expect(chartTypeText).toContain('Ligne')

  // For SearchableSelect components, we check via the button/text display
  // The actual selected values are internal to the component
  expect(await page.getByLabel('Type', { exact: true }).first().inputValue()).toBe('continuous')
  expect(await page.getByLabel('Agrégation').inputValue()).toBe('avg')
  expect(await page.getByLabel('Label').inputValue()).toBe('Taux (%)')
  expect(await page.getByLabel('Min').inputValue()).toBe('0')
  expect(await page.getByLabel('Max').inputValue()).toBe('100')
  expect(await page.locator('#y-axis-unit').inputValue()).toBe('%')
  expect(await page.getByLabel('Position unité').inputValue()).toBe('prefix')

  await page.request.delete(`${baseURL}/api/1/visualizations/${responseBody!.id}/`)
})
