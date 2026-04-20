import type { Chart } from '@datagouv/components-next'
import { test, expect } from '../base'
import { getApiBase } from '../helpers'

test('dataset selector shows default dataset', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  const datasetSelect = page.getByPlaceholder('Recherchez un jeu de données...')
  // SearchableSelect displays the selected value in a different way
  const displayedValue = await datasetSelect.inputValue()
  expect(datasetSelect).toBeVisible()
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

test('saving chart sends correct data to API', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')
  await page.waitForTimeout(500)

  const responsePromise = page.waitForResponse(response => response.url().includes(`${getApiBase()}/api/1/visualizations/`) && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes(`${getApiBase()}/api/1/visualizations/`) && response.request().method() === 'GET')

  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart
  await getPromise

  expect(responseBody!.title).toBe('Test Chart')
  expect(await page.getByLabel('Graphiques existants').inputValue()).toBe(responseBody!.id)
  await page.request.delete(`${getApiBase()}/api/1/visualizations/${responseBody!.id}/`)
})

test('complete chart configuration flow', async ({ page }) => {
  await page.goto('/design/chart')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Titre').fill('Graphique complet')
  await page.getByLabel('Description').fill('Test complet de configuration')
  await page.waitForTimeout(400)

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

  const responsePromise = page.waitForResponse(response => response.url().includes(`${getApiBase()}/api/1/visualizations/`) && response.request().method() === 'POST')
  const getPromise = page.waitForResponse(response => response.url().includes(`${getApiBase()}/api/1/visualizations/`) && response.request().method() === 'GET')

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

  await page.request.delete(`${getApiBase()}/api/1/visualizations/${responseBody!.id}/`)
})
