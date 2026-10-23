import { test, expect } from '../base'
import {
  ASSISTANT_SQL,
  MOCK_RESOURCES,
  setupChart,
  mockChartRoutes,
  mockTabular,
} from './fixtures'

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

test('resource schema is displayed with the profile columns', async ({ page }) => {
  await setupChart(page)

  const schema = page.locator('fieldset', { hasText: 'Schéma de la ressource' })
  await expect(schema.getByText('nom_region', { exact: true })).toBeVisible()
  await expect(schema.getByText('Nombre de logements', { exact: true })).toBeVisible()
})

test('SQL query input updates form value', async ({ page }) => {
  await setupChart(page)

  const query = 'SELECT nom_region, nb_logements FROM bailleurs_sociaux_region'
  await page.getByLabel('Requête SQL').fill(query)

  expect(await page.getByLabel('Requête SQL').inputValue()).toBe(query)
})

test('preview renders a chart from the mocked SQL result', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Requête SQL').fill('SELECT nom_region, nb_logements FROM bailleurs_sociaux_region')

  await expect(page.locator('canvas').first()).toBeVisible()
})

test('y-axis style fields can be filled', async ({ page }) => {
  await setupChart(page)

  await page.getByText('Styles').click()

  await page.getByLabel('Label').fill('Nombre de logements sociaux')
  await page.locator('#y-axis-min').fill('0')
  await page.locator('#y-axis-max').fill('100')
  await page.locator('#y-axis-unit').fill('%')
  await page.getByLabel('Position unité').selectOption('prefix')

  expect(await page.getByLabel('Label').inputValue()).toBe('Nombre de logements sociaux')
  expect(await page.locator('#y-axis-min').inputValue()).toBe('0')
  expect(await page.locator('#y-axis-max').inputValue()).toBe('100')
  expect(await page.locator('#y-axis-unit').inputValue()).toBe('%')
  expect(await page.getByLabel('Position unité').inputValue()).toBe('prefix')
})

test('saving chart sends query and resource_id to the API', async ({ page }) => {
  const capture = await setupChart(page)

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')
  await page.getByLabel('Requête SQL').fill('SELECT nom_region, nb_logements FROM bailleurs_sociaux_region')

  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise

  expect(response.status()).toBe(201)
  await expect.poll(() => capture.visualizationBodies.length).toBe(1)
  expect(capture.visualizationBodies[0]).toMatchObject({
    title: 'Test Chart',
    description: 'Test Description',
    query: 'SELECT nom_region, nb_logements FROM bailleurs_sociaux_region',
    resource_id: MOCK_RESOURCES[0]!.id,
  })
})

test('saving chart shows success message', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')
  await page.getByLabel('Requête SQL').fill('SELECT nom_region, nb_logements FROM bailleurs_sociaux_region')
  await expect(page.locator('canvas').first()).toBeVisible()

  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  await responsePromise

  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()
})

test.describe('saving with an empty query', () => {
  // The rejected save is the point of the test: the browser and Vue log it.
  test.use({ allowedConsoleMessages: ['the server responded with a status of 400', ': 400'] })

  test('surfaces the backend 400 in French instead of failing silently', async ({ page }) => {
    await setupChart(page)

    // Backend rejects an empty query: nothing is saved silently, the error is shown.
    await page.route('**/api/1/visualizations/**', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue()
      }
      await route.fulfill({
        status: 400,
        json: { errors: { query: 'Une requête SQL est requise.' } },
      })
    })

    await page.getByLabel('Titre').fill('Graphique sans requête')
    await page.getByLabel('Description').fill('Soumission invalide')

    expect(await page.getByLabel('Requête SQL').inputValue()).toBe('')

    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
    const response = await responsePromise

    expect(response.status()).toBe(400)
    await expect(page.getByText('Le formulaire contient des erreurs. query: Une requête SQL est requise.')).toBeVisible()
    await expect(page.getByText('Graphique sauvegardé !')).not.toBeVisible()
  })
})

test('assistant waits for a resource before accepting messages', async ({ page }) => {
  await mockTabular(page)
  await mockChartRoutes(page)
  await page.goto('/admin/beta/chart')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('searchable-select-avec-qui-souhaitez-vous-publier').click()
  await page.getByRole('option', { name: 'Admin User', exact: true }).click()

  await page.getByTestId('searchable-select-jeu-de-donn-es').click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('logements sociaux')
  await page.getByRole('option', { name: 'Logements sociaux et bailleurs par région', exact: true }).click()

  await expect(page.locator('#assistant-waiting')).toBeVisible()
  await expect(page.getByLabel('Votre demande')).toBeDisabled()
})

test('chat message is sent with the selected resource and the reply is streamed', async ({ page }) => {
  const capture = await setupChart(page)

  await page.getByLabel('Votre demande').fill('Logements par région en histogramme')
  await page.getByRole('button', { name: 'Envoyer' }).click()

  await expect(page.getByText('Voici une requête qui répond à votre demande :')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Utiliser cette requête' })).toBeVisible()

  await expect.poll(() => capture.chatBodies.length).toBe(1)
  expect(capture.chatBodies[0]).toMatchObject({
    resource_id: MOCK_RESOURCES[0]!.id,
    messages: expect.any(Array),
  })
  const messages = (capture.chatBodies[0] as { messages: Array<{ role: string }> }).messages
  expect(messages.length).toBeGreaterThan(0)
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
  expect(lastUserMessage).toBeDefined()
  expect(JSON.stringify(lastUserMessage)).toContain('Logements par région en histogramme')
})

test('using the assistant query fills the SQL field', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Votre demande').fill('Logements par région en histogramme')
  await page.getByRole('button', { name: 'Envoyer' }).click()

  await expect(page.getByRole('button', { name: 'Utiliser cette requête' })).toBeVisible()
  await page.getByRole('button', { name: 'Utiliser cette requête' }).click()

  expect(await page.getByLabel('Requête SQL').inputValue()).toBe(ASSISTANT_SQL)
})

test('changing resource after a chat message sends the new resource_id', async ({ page }) => {
  const capture = await setupChart(page)

  await page.getByLabel('Votre demande').fill('Logements par région')
  await page.getByRole('button', { name: 'Envoyer' }).click()
  await expect.poll(() => capture.chatBodies.length).toBe(1)
  expect(capture.chatBodies[0]).toMatchObject({ resource_id: MOCK_RESOURCES[0]!.id })

  await page.getByLabel('Choix de la ressource').selectOption(MOCK_RESOURCES[1]!.id)

  await page.getByLabel('Votre demande').fill('Logements par EPCI')
  await page.getByRole('button', { name: 'Envoyer' }).click()

  await expect.poll(() => capture.chatBodies.length).toBe(2)
  expect(capture.chatBodies[1]).toMatchObject({ resource_id: MOCK_RESOURCES[1]!.id })
})

test('complete chart configuration flow', async ({ page }) => {
  const capture = await setupChart(page)

  await page.getByLabel('Titre').fill('Graphique complet')
  await page.getByLabel('Description').fill('Test complet de configuration')
  await page.getByLabel('Requête SQL').fill('SELECT nom_region, nb_logements FROM bailleurs_sociaux_region')

  await page.getByText('Styles').click()
  await page.getByLabel('Label').fill('Logements')
  await page.locator('#y-axis-min').fill('0')
  await page.locator('#y-axis-max').fill('300')
  await page.locator('#y-axis-unit').fill('logements')

  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise

  expect(response.status()).toBe(201)
  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()

  await expect.poll(() => capture.visualizationBodies.length).toBe(1)
  expect(capture.visualizationBodies[0]).toMatchObject({
    title: 'Graphique complet',
    description: 'Test complet de configuration',
    query: 'SELECT nom_region, nb_logements FROM bailleurs_sociaux_region',
    resource_id: MOCK_RESOURCES[0]!.id,
    y_axis: { label: 'Logements', min: 0, max: 300, unit: 'logements', unit_position: 'suffix' },
  })

  expect(await page.getByLabel('Titre').inputValue()).toBe('Graphique complet')
  expect(await page.getByLabel('Requête SQL').inputValue()).toBe('SELECT nom_region, nb_logements FROM bailleurs_sociaux_region')
})
