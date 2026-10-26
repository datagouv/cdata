import { test, expect } from '../base'
import type { Page } from '@playwright/test'
import {
  createChart,
  deleteChart,
  RESOURCE_ID,
  setupChart,
  mockTabular,
} from './fixtures'

const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'
const CHART_QUERY = 'SELECT nom_region, nb_logements FROM logements ORDER BY nb_logements DESC'
const CHART_API_KEYS = [
  'chart_type',
  'description',
  'extras',
  'organization',
  'owner',
  'private',
  'query',
  'resource_id',
  'title',
  'y_axis',
]
const EMPTY_Y_AXIS = { label: null, min: null, max: null, unit: null, unit_position: 'suffix' }
const createdChartIds = new Set<string>()

async function sendAssistantMessage(page: Page, prompt: string) {
  const requestPromise = page.waitForRequest(request =>
    request.url().includes('/api/1/assistant/chat/') && request.method() === 'POST',
  )
  await page.getByLabel('Votre demande').fill(prompt)
  await page.getByRole('button', { name: 'Envoyer' }).click()
  return requestPromise
}

async function otherResourceId(page: Page) {
  const resourceIds = await page.locator('#resource-select option').evaluateAll(options =>
    options.map(option => (option as HTMLOptionElement).value).filter(Boolean),
  )
  const resourceId = resourceIds.find(id => id !== RESOURCE_ID)
  expect(resourceId, 'the fixture dataset has another tabular resource').toBeDefined()
  return resourceId!
}

test.afterEach(async ({ page }) => {
  for (const id of createdChartIds) {
    await deleteChart(page.request, id)
  }
  createdChartIds.clear()
})

async function saveChart(page: Page) {
  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  const body = response.request().postDataJSON() as Record<string, unknown>

  if (response.ok()) {
    const chart = await response.json() as { id: string }
    createdChartIds.add(chart.id)
  }

  return { response, body }
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

  await page.getByLabel('Requête SQL').fill(CHART_QUERY)

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
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')
  await page.getByLabel('Requête SQL').fill(CHART_QUERY)
  const { response, body } = await saveChart(page)

  expect(response.status()).toBe(201)
  expect(body).toMatchObject({
    title: 'Test Chart',
    description: 'Test Description',
    query: CHART_QUERY,
    resource_id: RESOURCE_ID,
  })
})

test('saving sends the exact reduced chart payload', async ({ page }) => {
  await setupChart(page)
  const meResponse = await page.request.get(`${API_BASE_URL}/api/1/me/`)
  expect(meResponse.ok()).toBe(true)
  const me = await meResponse.json() as { id: string }

  await page.getByLabel('Requête SQL').fill(CHART_QUERY)
  const { response, body } = await saveChart(page)

  expect(response.status()).toBe(201)
  expect(Object.keys(body).sort()).toEqual(CHART_API_KEYS)
  expect(body).toMatchObject({
    title: 'Mon graphique',
    description: '',
    private: false,
    query: CHART_QUERY,
    resource_id: RESOURCE_ID,
    chart_type: 'line',
    y_axis: EMPTY_Y_AXIS,
    extras: {},
    organization: null,
    owner: me.id,
  })
})

test('saving chart shows success message', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Test Chart')
  await page.getByLabel('Description').fill('Test Description')
  await page.getByLabel('Requête SQL').fill(CHART_QUERY)
  await expect(page.locator('canvas').first()).toBeVisible()

  const { response } = await saveChart(page)
  expect(response.status()).toBe(201)

  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()
})

test.describe('saving with an empty query', () => {
  // The rejected save is the point of the test: the browser and Vue log it.
  test.use({ allowedConsoleMessages: ['the server responded with a status of 400', ': 400'] })

  test('surfaces the backend 400 in French instead of failing silently', async ({ page }) => {
    await setupChart(page)

    await page.getByLabel('Titre').fill('Graphique sans requête')
    await page.getByLabel('Description').fill('Soumission invalide')

    expect(await page.getByLabel('Requête SQL').inputValue()).toBe('')

    const { response } = await saveChart(page)

    expect(response.status()).toBe(400)
    await expect(page.getByText('Le formulaire contient des erreurs. query: Une requête SQL est requise.')).toBeVisible()
    await expect(page.getByText('Graphique sauvegardé !')).not.toBeVisible()
  })
})

test('assistant waits for a resource before accepting messages', async ({ page }) => {
  await mockTabular(page)
  await page.goto('/admin/beta/chart')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('searchable-select-avec-qui-souhaitez-vous-publier').click()
  await page.getByRole('option', { name: 'Admin User', exact: true }).click()

  await page.getByTestId('searchable-select-jeu-de-donn-es').click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('logements sociaux')
  await page.getByRole('option', { name: 'Logements sociaux et bailleurs par région', exact: true }).click()

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  await expect(page.locator('#assistant-waiting')).toBeVisible()
  await expect(page.getByLabel('Votre demande')).toBeDisabled()
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

    await expect(page.getByTestId('searchable-select-avec-qui-souhaitez-vous-publier')).toBeVisible()
    await expect(page.getByText('Vous n\'appartenez à aucune organisation', { exact: true })).toHaveCount(0)
  })
})

test('chat message is sent with the selected resource and the reply is streamed', async ({ page }) => {
  await setupChart(page)

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  await expect(page.getByTestId('assistant-panel')).toBeVisible()
  await expect(page.getByTestId('form-panel')).toBeHidden()
  await expect(page.locator('#resource-select')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Sauvegarder le graphique' })).toBeHidden()
  const request = await sendAssistantMessage(page, 'Logements par région en histogramme')

  await expect(page.getByRole('button', { name: 'Utiliser cette requête' })).toBeVisible()
  const body = request.postDataJSON() as { resource_id: string, messages: Array<{ role: string, parts: Array<{ text?: string }> }> }
  expect(body).toMatchObject({
    resource_id: RESOURCE_ID,
    messages: expect.any(Array),
  })
  expect(body.messages.length).toBeGreaterThan(0)
  const lastUserMessage = [...body.messages].reverse().find(m => m.role === 'user')
  expect(lastUserMessage).toBeDefined()
  expect(JSON.stringify(lastUserMessage)).toContain('Logements par région en histogramme')

  const assistantPanel = page.getByTestId('assistant-panel')
  const reply = assistantPanel.locator('article').last()
  await expect(reply).toBeVisible()
  const replyText = await reply.innerText()
  expect(replyText.trim()).not.toBe('')

  await page.getByRole('button', { name: 'Formulaire', exact: true }).click()
  await expect(page.getByTestId('form-panel')).toBeVisible()
  await expect(page.getByTestId('assistant-panel')).toBeHidden()
  await expect(reply).toBeAttached()
  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  await expect(reply).toHaveText(replyText)
})

test('using the assistant query fills the SQL field', async ({ page }) => {
  await setupChart(page)

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  await sendAssistantMessage(page, 'Logements par région en histogramme')

  await expect(page.getByRole('button', { name: 'Utiliser cette requête' })).toBeVisible()
  await page.getByRole('button', { name: 'Utiliser cette requête' }).click()

  await page.getByRole('button', { name: 'Formulaire', exact: true }).click()
  await expect(page.getByLabel('Requête SQL')).toHaveValue(/SELECT/i)
})

test('changing resource after a chat message sends the new resource_id', async ({ page }) => {
  await setupChart(page)

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  const firstRequest = await sendAssistantMessage(page, 'Logements par région')
  expect(firstRequest.postDataJSON()).toMatchObject({ resource_id: RESOURCE_ID })
  await expect(page.getByRole('button', { name: 'Utiliser cette requête' })).toBeVisible()

  await page.getByRole('button', { name: 'Formulaire', exact: true }).click()
  const secondResourceId = await otherResourceId(page)
  await page.getByLabel('Choix de la ressource').selectOption(secondResourceId)

  await page.getByRole('button', { name: 'Assistant', exact: true }).click()
  const secondRequest = await sendAssistantMessage(page, 'Logements par EPCI')
  expect(secondRequest.postDataJSON()).toMatchObject({ resource_id: secondResourceId })
})

test('complete chart configuration flow', async ({ page }) => {
  await setupChart(page)

  await page.getByLabel('Titre').fill('Graphique complet')
  await page.getByLabel('Description').fill('Test complet de configuration')
  await page.getByLabel('Requête SQL').fill(CHART_QUERY)

  await page.getByText('Styles').click()
  await page.getByLabel('Label').fill('Logements')
  await page.locator('#y-axis-min').fill('0')
  await page.locator('#y-axis-max').fill('300')
  await page.locator('#y-axis-unit').fill('logements')

  const { response, body } = await saveChart(page)

  expect(response.status()).toBe(201)
  await expect(page.getByText('Graphique sauvegardé !')).toBeVisible()

  expect(body).toMatchObject({
    title: 'Graphique complet',
    description: 'Test complet de configuration',
    query: CHART_QUERY,
    resource_id: RESOURCE_ID,
    y_axis: { label: 'Logements', min: 0, max: 300, unit: 'logements', unit_position: 'suffix' },
  })

  expect(await page.getByLabel('Titre').inputValue()).toBe('Graphique complet')
  expect(await page.getByLabel('Requête SQL').inputValue()).toBe(CHART_QUERY)
})

test('uses the SQL textarea without declarative x-axis or filter controls', async ({ page }) => {
  await setupChart(page)

  const query = page.getByLabel('Requête SQL')
  await expect(query).toBeVisible()
  expect(await query.inputValue()).toBe('')
  await expect(page.locator('#x-axis-column')).toHaveCount(0)
  await expect(page.getByText('Filtres', { exact: true })).toHaveCount(0)
  await expect(page.locator('#resource-select')).toBeVisible()
})

test('chart type selection is sent in the save payload', async ({ page }) => {
  await setupChart(page)

  await page.getByText('Styles').click()
  const chartType = page.locator('#chart-type')
  await expect(chartType).toBeVisible()
  expect(await chartType.inputValue()).toBe('line')
  expect(await chartType.locator('option').evaluateAll(options =>
    options.map(option => (option as HTMLOptionElement).value),
  )).toEqual(['line', 'histogram'])
  await chartType.selectOption('histogram')

  await page.getByLabel('Requête SQL').fill(CHART_QUERY)
  const { response, body } = await saveChart(page)
  expect(response.status()).toBe(201)
  expect(body).toMatchObject({ chart_type: 'histogram' })
})

test('shows the form panel by default with its pickers and save action', async ({ page }) => {
  await setupChart(page)

  await expect(page.getByRole('button', { name: 'Formulaire', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('form-panel')).toBeVisible()
  await expect(page.getByTestId('assistant-panel')).toBeHidden()
  await expect(page.getByTestId('producer-select')).toBeVisible()
  await expect(page.getByTestId('searchable-select-jeu-de-donn-es')).toBeVisible()
  await expect(page.locator('#resource-select')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sauvegarder le graphique' })).toBeVisible()
})

test('switching datasets clears the selected resource and its SQL schema', async ({ page }) => {
  await setupChart(page)

  const datasetSelect = page.getByTestId('searchable-select-jeu-de-donn-es')
  await datasetSelect.click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('Base SIRENE')
  await page.getByRole('option', { name: /Base SIRENE/i }).first().click()

  await expect(page.locator('#resource-select')).toHaveValue('')
  await expect(page.getByLabel('Requête SQL')).toHaveCount(0)
  await expect(page.getByText('Schéma de la ressource')).toHaveCount(0)
})

test('editing a chart PATCHes the reduced payload and skips image upload without a preview capture', async ({ page }) => {
  const meResponse = await page.request.get(`${API_BASE_URL}/api/1/me/`)
  expect(meResponse.ok()).toBe(true)
  const me = await meResponse.json() as { id: string }
  const chart = await createChart(page.request, {
    title: `Chart configurator edit ${Date.now()}`,
    withImage: false,
  })
  createdChartIds.add(chart.id)
  const query = CHART_QUERY

  await mockTabular(page, { sqlResult: { columns: ['year', 'rate'], rows: [] } })
  const imageUploads: Array<string> = []
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes(`/api/1/visualizations/${chart.id}/image/`)) {
      imageUploads.push(request.url())
    }
  })
  await page.goto(`/admin/beta/charts/${chart.id}`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByLabel('Titre')).toBeVisible()
  expect(await page.getByLabel('Titre').inputValue()).toBe(chart.title)
  expect(await page.locator('#resource-select').inputValue()).toBe(RESOURCE_ID)

  const sqlResponsePromise = page.waitForResponse(response =>
    response.url().includes(`/api/resources/${RESOURCE_ID}/sql`) && response.request().method() === 'POST',
  )
  await page.getByLabel('Requête SQL').fill(query)
  await sqlResponsePromise
  await expect(page.getByText('Aucune donnée', { exact: true })).toBeVisible()

  const responsePromise = page.waitForResponse(response =>
    response.url().includes(`/api/1/visualizations/${chart.id}/`) && response.request().method() === 'PATCH',
  )
  await page.getByRole('button', { name: 'Sauvegarder le graphique' }).click()
  const response = await responsePromise
  expect(response.status()).toBe(200)
  await expect(page.getByText('Graphique mis à jour !')).toBeVisible()

  const body = response.request().postDataJSON() as Record<string, unknown>
  expect(Object.keys(body).sort()).toEqual(CHART_API_KEYS)
  expect(body).toMatchObject({
    title: chart.title,
    description: chart.description,
    private: false,
    query,
    resource_id: RESOURCE_ID,
    chart_type: 'line',
    y_axis: EMPTY_Y_AXIS,
    extras: {},
    organization: null,
    owner: me.id,
  })
  expect(imageUploads).toHaveLength(0)
})

test('ignores a late profile response after changing resources', async ({ page }) => {
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

  const schema = page.locator('fieldset', { hasText: 'Schéma de la ressource' })
  await expect(schema.getByText('nom_region', { exact: true })).toBeVisible()
  const resourceSelect = page.locator('#resource-select')

  try {
    await resourceSelect.selectOption(secondResourceId)
    await profileRequestStarted

    const firstProfileResponse = page.waitForResponse(response =>
      response.url().includes(`/api/resources/${RESOURCE_ID}/profile/`),
    )
    await resourceSelect.selectOption(RESOURCE_ID)
    const resourceAResponse = await firstProfileResponse
    await resourceAResponse.finished()
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
    await expect(schema.getByText('nom_region', { exact: true })).toBeVisible()

    const lateProfileResponse = page.waitForResponse(response =>
      response.url().includes(`/api/resources/${secondResourceId}/profile/`),
    )
    releaseProfile()
    const resourceBResponse = await lateProfileResponse
    await resourceBResponse.finished()
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))

    await expect(schema.getByText('nom_region', { exact: true })).toBeVisible()
    await expect(schema.getByText('epci', { exact: true })).toHaveCount(0)
  }
  finally {
    releaseProfile()
  }
})
