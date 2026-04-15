import { test, expect } from '../base'

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
