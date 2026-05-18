import type { Chart } from '@datagouv/components-next'
import { test, expect } from '../base'

// ============================================================================
// Title & Description Tests
// ============================================================================

test('title input updates form value with debounce', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Titre').fill('Nouveau titre de graphique')

  // Wait for debounce (300ms as per component)
  await page.waitForTimeout(400)

  // The title should be updated in the form
  expect(await page.getByLabel('Titre').inputValue()).toBe('Nouveau titre de graphique')
})

test('description input updates form value with debounce', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

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
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const chartType = await page.getByLabel('Type de graphique').inputValue()
  expect(chartType).toBe('histogram')
})

test('chart type selector can switch to line chart', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Type de graphique').selectOption('line')

  const chartType = await page.getByLabel('Type de graphique').inputValue()
  expect(chartType).toBe('line')
})

// ============================================================================
// Data Source Tests
// ============================================================================

test('dataset selector shows default dataset', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const datasetSelect = page.getByPlaceholder('Recherchez un jeu de données...')
  // SearchableSelect displays the selected value in a different way
  const displayedValue = await datasetSelect.inputValue()
  await expect(datasetSelect).toBeVisible()
  expect(displayedValue).toContain('Logements et logements sociaux')
})

test('resource selector shows available resources', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const resourceOptions = await page.getByLabel('Choix de la ressource').locator('option').all()

  expect(resourceOptions.length).toBeGreaterThan(1)
})

test('x-axis column selector shows available columns', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const columnOptions = await page.getByLabel('Choisir quoi afficher').locator('option').allTextContents()

  expect(columnOptions).toContain('libellé_EPCI')
  expect(columnOptions).toContain('nom_region')
})

test('series column y selector shows available columns', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const columnYOptions = await page.getByLabel('Colonne Y').locator('option').allTextContents()

  expect(columnYOptions).toContain('Nombre de logements')
  expect(columnYOptions).toContain('libellé_EPCI')
})

// ============================================================================
// Series Aggregation Tests
// ============================================================================

test('series aggregation defaults to none', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const aggregation = await page.getByLabel('Agrégation').inputValue()
  expect(aggregation).toBe('')
})

test('series aggregation can be changed to sum', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Agrégation').selectOption('Somme')

  const aggregation = await page.getByLabel('Agrégation').inputValue()
  expect(aggregation).toBe('sum')
})

test('series aggregation can be changed to avg', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Agrégation').selectOption('Moyenne')

  const aggregation = await page.getByLabel('Agrégation').inputValue()
  expect(aggregation).toBe('avg')
})

// ============================================================================
// X-Axis & Sort Tests
// ============================================================================

test('sort select displays dynamic column names', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  // Check that the sort select now shows dynamic column names instead of static "Axe X - Ascendant"
  const sortOptions = await page.getByLabel('Trier par').locator('option').allTextContents()

  expect(sortOptions[0]).toBe('Aucun')

  // Second option should show the dynamic column name, not "Axe X - Ascendant"
  expect(sortOptions[1]).toContain('libellé_EPCI')
  expect(sortOptions[1]).not.toContain('Axe X - Ascendant')

  await page.getByLabel('Trier par').selectOption({ label: 'libellé_EPCI - Descendant' })

  const selectedValue = await page.getByLabel('Trier par').inputValue()
  expect(selectedValue).toBe('axis_x-desc')
})

test('sort select updates reactively when column changes', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const firstOptions = await page.getByLabel('Trier par').locator('option').allTextContents()
  expect(firstOptions[1]).toContain('libellé_EPCI')

  await page.getByLabel('Choisir quoi afficher').selectOption('nom_region')

  await page.waitForTimeout(500)

  const updatedOptions = await page.getByLabel('Trier par').locator('option').allTextContents()
  expect(updatedOptions[1]).toContain('nom_region')
  expect(updatedOptions[1]).not.toContain('libellé_EPCI')
})

test('Y axis sort options show dynamic series column name too', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.waitForTimeout(1000)

  await page.getByLabel('Colonne Y').selectOption('Nombre de logements')

  const sortOptions = await page.getByLabel('Trier par').locator('option').allTextContents()

  // Y axis ascending option should show dynamic column name
  expect(sortOptions[3]).toContain('Nombre de logements')
  expect(sortOptions[3]).not.toContain('Axe Y - Ascendant')
})

// ============================================================================
// Y-Axis Configuration Tests
// ============================================================================

test('y-axis label input is initially empty', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const labelValue = await page.getByLabel('Label').inputValue()
  expect(labelValue).toBe('')
})

test('y-axis label input can be filled', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Label').fill('Nombre de logements sociaux')

  const labelValue = await page.getByLabel('Label').inputValue()
  expect(labelValue).toBe('Nombre de logements sociaux')
})

test('y-axis min and max inputs are initially empty', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const minValue = await page.getByLabel('Min').inputValue()
  const maxValue = await page.getByLabel('Max').inputValue()

  expect(minValue).toBe('')
  expect(maxValue).toBe('')
})

test('y-axis min and max can be set', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Min').fill('0')
  await page.getByLabel('Max').fill('100')

  const minValue = await page.getByLabel('Min').inputValue()
  const maxValue = await page.getByLabel('Max').inputValue()

  expect(minValue).toBe('0')
  expect(maxValue).toBe('100')
})

test('y-axis unit input is initially empty', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const unitValue = await page.getByLabel('Unité').inputValue()
  expect(unitValue).toBe('')
})

test('y-axis unit position defaults to suffix', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const unitPosition = await page.getByLabel('Position unité').inputValue()
  expect(unitPosition).toBe('suffix')
})

test('y-axis unit position can be changed to prefix', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Position unité').selectOption('Préfixe')

  const unitPosition = await page.getByLabel('Position unité').inputValue()
  expect(unitPosition).toBe('prefix')
})

// ============================================================================
// Save Chart Tests
// ============================================================================

test('saving chart sends correct data to API', async ({ page, baseURL }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

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
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'GET')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart
  await getPromise

  // Wait for toast message
  await page.waitForTimeout(1000)

  // Check for success message - the component uses toast.success which shows "Graphique sauvegardé !"
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
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  // First, create a chart to load
  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'GET')

  await page.getByLabel('Titre').fill('Chart to load')
  await page.waitForTimeout(400)
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
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Titre').fill('Graphique complet')
  await page.getByLabel('Description').fill('Test complet de configuration')
  await page.waitForTimeout(500)

  await page.getByLabel('Type de graphique').selectOption('line')

  await page.getByLabel('Choisir quoi afficher').selectOption('code_region')
  await page.getByLabel('Type', { exact: true }).first().selectOption('continuous')

  await page.getByLabel('Colonne Y').selectOption('Parc social - Taux de logements vacants* (en %)')
  await page.getByLabel('Agrégation').selectOption('avg')

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
  expect(await page.getByLabel('Type de graphique').inputValue()).toBe('line')
  expect(await page.getByLabel('Choisir quoi afficher').inputValue()).toBe('code_region')
  expect(await page.getByLabel('Type', { exact: true }).first().inputValue()).toBe('continuous')
  expect(await page.getByLabel('Colonne Y').inputValue()).toBe('Parc social - Taux de logements vacants* (en %)')
  expect(await page.getByLabel('Agrégation').inputValue()).toBe('avg')
  expect(await page.getByLabel('Label').inputValue()).toBe('Taux (%)')
  expect(await page.getByLabel('Min').inputValue()).toBe('0')
  expect(await page.getByLabel('Max').inputValue()).toBe('100')
  expect(await page.getByLabel('Unité', { exact: true }).inputValue()).toBe('%')
  expect(await page.getByLabel('Position unité').inputValue()).toBe('prefix')

  await page.request.delete(`${baseURL}/api/1/visualizations/${responseBody!.id}/`)
})
