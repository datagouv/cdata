import type { Chart } from '@datagouv/components-next'
import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { clickOutside } from '../helpers'

async function setupChart(page: Page) {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('producer-select').click()
  await page.getByRole('option', { name: 'Admin User', exact: true }).click()

  await page.getByTestId('searchable-select-jeu-de-donn-es').click()

  const getPromise = page.waitForResponse('**/api/1/datasets/suggest/?q=logements+sociaux*')
  const datasetSelect = page.getByPlaceholder('Recherchez un jeu de données...')
  await datasetSelect.fill('logements sociaux')
  await getPromise

  await page.getByRole('option', { name: 'Logements et logements sociaux dans les EPCI', exact: true }).click()
  await clickOutside(page)

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  const resourceSelect = page.getByLabel('Choix de la ressource')
  await resourceSelect.selectOption({ index: 1 })

  expect(page.getByLabel('Titre')).toBeVisible()
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

test('chart type selector defaults to histogram', async ({ page }) => {
  await setupChart(page)

  const chartTypeButton = page.locator('#chart-type').getByRole('button')
  const chartTypeText = await chartTypeButton.textContent()
  expect(chartTypeText).toContain('Histogramme')
})

test('chart type selector can switch to line chart', async ({ page }) => {
  await setupChart(page)

  const chartTypeButton = page.locator('#chart-type').getByRole('button')
  await chartTypeButton.click()

  await page.getByRole('option', { name: 'Ligne', exact: true }).click()

  const chartTypeText = await chartTypeButton.textContent()
  expect(chartTypeText).toContain('Ligne')
})

test('x-axis column selector shows available columns', async ({ page }) => {
  await setupChart(page)

  await page.getByTestId('searchable-select-choisir-quoi-afficher').click()

  await expect(page.getByRole('option', { name: 'libellé_EPCI', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'nom_region', exact: true })).toBeVisible()
})

test('series column y selector shows available columns', async ({ page }) => {
  await setupChart(page)

  await page.getByTestId('searchable-select-colonne-y').click()

  await expect(page.getByRole('option', { name: 'Nombre de logements', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'libellé_EPCI', exact: true })).toBeVisible()
})

test('series aggregation defaults to none', async ({ page }) => {
  await setupChart(page)

  const aggregationSelect = page.getByLabel('Agrégation')
  const aggregation = await aggregationSelect.inputValue()
  expect(aggregation).toBe('Non')
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

test('sort select displays dynamic column names', async ({ page }) => {
  await setupChart(page)

  const listbox = page.locator('#x-axis-sort-combined')
  await listbox.click()

  const sortOptions = await listbox.locator('role=option').allTextContents()

  expect(sortOptions[0]).toBe('Aucun')

  expect(sortOptions[1]).toContain('libellé_EPCI')
  expect(sortOptions[1]).not.toContain('Axe X - Ascendant')

  await listbox.getByRole('option', { name: 'libellé_EPCI - Descendant' }).click()

  const buttonText = await listbox.locator('.input').textContent()
  expect(buttonText).toContain('libellé_EPCI - Descendant')
})

test('sort select updates reactively when column changes', async ({ page }) => {
  await setupChart(page)

  const listbox = page.locator('#x-axis-sort-combined')
  await listbox.click()

  const firstOptions = await listbox.locator('role=option').allTextContents()
  expect(firstOptions[1]).toContain('libellé_EPCI')
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
  await page.getByRole('option', { name: 'année_publication', exact: true }).click()
  await clickOutside(page)

  const listbox = page.locator('#x-axis-sort-combined')
  await listbox.click()
  const sortOptions = await listbox.locator('role=option').allTextContents()

  expect(sortOptions[3]).toContain('année_publication')
  expect(sortOptions[3]).not.toContain('Axe Y - Ascendant')
})

test('y-axis label input is initially empty', async ({ page }) => {
  await setupChart(page)

  await page.getByText('Styles').click()

  const labelInput = page.getByLabel('Label')
  const labelValue = await labelInput.inputValue()
  expect(labelValue).toBe('')
})

test('y-axis label input can be filled', async ({ page }) => {
  await setupChart(page)

  await page.getByText('Styles').click()

  const labelInput = page.getByLabel('Label')
  await labelInput.fill('Nombre de logements sociaux')

  const labelValue = await labelInput.inputValue()
  expect(labelValue).toBe('Nombre de logements sociaux')
})

test('y-axis min and max inputs are initially empty', async ({ page }) => {
  await setupChart(page)

  await page.getByText('Styles').click()

  const minInput = page.getByLabel('Min')
  const maxInput = page.getByLabel('Max')
  const minValue = await minInput.inputValue()
  const maxValue = await maxInput.inputValue()

  expect(minValue).toBe('')
  expect(maxValue).toBe('')
})

test('y-axis min and max can be set', async ({ page }) => {
  await setupChart(page)

  await page.getByText('Styles').click()

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

  await page.getByText('Styles').click()

  const unitInput = page.getByRole('textbox', { name: 'Unité' })
  const unitValue = await unitInput.inputValue()
  expect(unitValue).toBe('')
})

test('y-axis unit position defaults to suffix', async ({ page }) => {
  await setupChart(page)

  await page.getByText('Styles').click()

  const unitPositionSelect = page.getByLabel('Position unité')
  const unitPosition = await unitPositionSelect.inputValue()
  expect(unitPosition).toBe('suffix')
})

test('y-axis unit position can be changed to prefix', async ({ page }) => {
  await setupChart(page)

  await page.getByText('Styles').click()

  const unitPositionSelect = page.getByLabel('Position unité')
  await unitPositionSelect.selectOption('Préfixe')

  const unitPosition = await unitPositionSelect.inputValue()
  expect(unitPosition).toBe('prefix')
})

test('saving chart sends correct data to API', async ({ page, baseURL }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')

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

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'GET')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart
  await getPromise

  await page.waitForTimeout(300)

  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()

  await page.request.delete(`${baseURL}/api/1/visualizations/${responseBody!.id}/`)
})

test('existing charts selector shows placeholder option', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const chartOptions = await page.getByLabel('Graphiques existants').locator('option').allTextContents()

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

  await page.getByLabel('Titre').fill('Chart to load')
  await page.getByLabel('Description').fill('Chart to load description')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'GET')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart
  await getPromise

  const chartId = responseBody!.id

  await page.getByLabel('Graphiques existants').selectOption(chartId)

  const loadButton = page.getByRole('button', { name: 'Charger' })
  await expect(loadButton).toBeEnabled()

  await page.request.delete(`${baseURL}/api/1/visualizations/${chartId}/`)
})

test('complete chart configuration flow', async ({ page, baseURL }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Graphique complet')
  await page.getByLabel('Description').fill('Test complet de configuration')

  const chartTypeButton = page.locator('#chart-type').getByRole('button')
  await chartTypeButton.click()
  await page.getByRole('option', { name: 'Ligne', exact: true }).click()

  await page.getByTestId('searchable-select-choisir-quoi-afficher').click()
  await page.getByRole('option', { name: 'code_region', exact: true }).click()

  await page.getByLabel('Type', { exact: true }).first().selectOption('continuous')

  await page.getByTestId('searchable-select-colonne-y').click()
  await page.getByRole('option', { name: 'Taux de logements vacants* (en %)', exact: true }).click()

  await page.getByLabel('Agrégation').selectOption('Moyenne')

  await page.getByText('Styles').click()

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

  await page.waitForTimeout(300)
  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()

  expect(responseBody!.title).toBe('Graphique complet')
  expect(await page.getByLabel('Graphiques existants').inputValue()).toBe(responseBody!.id)

  expect(await page.getByLabel('Titre').inputValue()).toBe('Graphique complet')
  expect(await page.getByLabel('Description').inputValue()).toBe('Test complet de configuration')

  const chartTypeText = await page.locator('#chart-type').getByRole('button').textContent()
  expect(chartTypeText).toContain('Ligne')

  expect(await page.getByLabel('Type', { exact: true }).first().inputValue()).toBe('continuous')
  expect(await page.getByLabel('Agrégation').inputValue()).toBe('avg')
  expect(await page.getByLabel('Label').inputValue()).toBe('Taux (%)')
  expect(await page.getByLabel('Min').inputValue()).toBe('0')
  expect(await page.getByLabel('Max').inputValue()).toBe('100')
  expect(await page.locator('#y-axis-unit').inputValue()).toBe('%')
  expect(await page.getByLabel('Position unité').inputValue()).toBe('prefix')

  await page.request.delete(`${baseURL}/api/1/visualizations/${responseBody!.id}/`)
})
