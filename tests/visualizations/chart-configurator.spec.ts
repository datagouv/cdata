import type { Chart } from '@datagouv/components-next'
import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { clickOutside, holdRequests } from '../helpers'
import { ASSISTANT_CHAT_PATH, assistantChatStream, createChartOutput, createChartStream, errorStream, routeAssistantStream } from '../assistantApi'
import { API_BASE_URL, chooseResource, createChart, deleteChart, mockTabular, RESOURCE_ID, sendAssistantMessage, setupChart } from './fixtures'
import data from './data.json' with { type: 'json' }
import profile from './profile.json' with { type: 'json' }

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

// Polled: after a dataset switch, the options arrive with the dataset's resources.
async function otherResourceId(page: Page) {
  let resourceId: string | undefined
  await expect.poll(async () => {
    const resourceIds = await page.locator('#resource-select option').evaluateAll(options =>
      options.map(option => (option as HTMLOptionElement).value).filter(Boolean),
    )
    resourceId = resourceIds.find(id => id !== RESOURCE_ID)
    return resourceId
  }, { message: 'the fixture dataset has another tabular resource' }).toBeDefined()
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
  // The selected option is tinted with the DSFR blue-france contrast (#ececfe).
  const selected = page.getByTestId('chart-type').locator('label').filter({ has: page.getByRole('radio', { name: 'Histogramme' }) })
  await expect(selected).toHaveCSS('background-color', 'rgb(236, 236, 254)')
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

// The calculation logic is unit tested (tests-unit/utils/charts.spec.ts).
test('calculation defaults to counting rows, which hides the Y column', async ({ page }) => {
  await setupChart(page)

  const calculationSelect = page.getByLabel('Calcul')
  await expect(calculationSelect).toHaveValue('count')
  await expect(page.getByTestId('searchable-select-colonne-y')).toBeHidden()

  await calculationSelect.selectOption('Somme')
  await expect(page.getByTestId('searchable-select-colonne-y')).toBeVisible()
  await calculationSelect.selectOption('Compter les lignes')
  await expect(page.getByTestId('searchable-select-colonne-y')).toBeHidden()
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

    await page.getByRole('button', { name: 'Publier la visualisation' }).click()
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

test('the publish button stays above the preview in both tabs', async ({ page }) => {
  await page.route('**/assistant/chat/**', route => route.abort())
  await setupChart(page)
  const publish = page.getByRole('region', { name: 'Visualisation' }).getByRole('button', { name: 'Publier la visualisation' })

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await expect(page.getByTestId('assistant-panel')).toBeVisible()
  await expect(publish).toBeVisible()
  await expect(publish).toBeEnabled()

  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await expect(publish).toBeVisible()
})

test('Enter in a field of the form does not publish the chart', async ({ page }) => {
  await setupChart(page)
  await page.getByLabel('Description').fill('Complète, mais pas publiée au clavier')
  const posts = trackChartCreations(page)
  // Implicit submission fires `submit` while the key is handled: checked right after the press.
  await page.locator('#chart-form').evaluate((form) => {
    form.addEventListener('submit', () => form.setAttribute('data-submitted', ''))
  })

  await page.getByLabel('Titre').press('Enter')

  await expect(page.locator('#chart-form')).not.toHaveAttribute('data-submitted')
  expect(posts).toHaveLength(0)
})

test('publishing from the assistant tab creates the chart, even with a decimal y-axis bound', async ({ page }) => {
  await page.route('**/assistant/chat/**', route => route.abort())
  await setupChart(page)
  await page.getByLabel('Description').fill('Publiée depuis l’assistant')
  await page.getByLabel('Minimum', { exact: true }).fill('0.5')
  await page.getByRole('tab', { name: 'Assistant' }).click()

  const responsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/1/visualizations/' && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Publier la visualisation' }).click()
  const chart = await (await responsePromise).json() as Chart
  try {
    // The toast follows the image upload: deleting earlier would answer it with a 410.
    await expect(page.getByText('Visualisation publiée !')).toBeVisible()
    expect(chart.y_axis.min).toBe(0.5)
  }
  finally {
    await deleteChart(page.request, chart.id)
  }
})

function holdImageUpload(page: Page) {
  return holdRequests(page, url => /^\/api\/1\/visualizations\/[^/]+\/image\/$/.test(url.pathname), 'POST')
}

test('the label stays « Publier la visualisation » until the first publication completes', async ({ page }) => {
  await setupChart(page)
  await page.getByLabel('Description').fill('Publiée une première fois')
  await expect(page.locator('canvas').first()).toBeVisible()
  const upload = await holdImageUpload(page)
  const visualization = page.getByRole('region', { name: 'Visualisation' })

  const responsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/1/visualizations/' && response.request().method() === 'POST')
  await visualization.getByRole('button', { name: 'Publier la visualisation' }).click()
  const chart = await (await responsePromise).json() as Chart
  try {
    await expect.poll(upload.held).toBe(1)
    await expect(visualization.getByRole('button', { name: 'Publier la visualisation' })).toBeVisible()

    upload.release()
    await expect(page.getByText('Visualisation publiée !')).toBeVisible()
    await expect(visualization.getByRole('button', { name: 'Publier les modifications' })).toBeVisible()
  }
  finally {
    upload.release()
    await deleteChart(page.request, chart.id)
  }
})

test('publishing waits for the assistant to answer', async ({ page }) => {
  await routeAssistantStream(page, body => assistantChatStream(body))
  let releaseAnswer = () => {}
  const answerReleased = new Promise<void>((resolve) => {
    releaseAnswer = resolve
  })
  // Registered after the stream, so it runs first: holds the answer, then hands it over.
  await page.route(url => url.pathname === ASSISTANT_CHAT_PATH, async (route) => {
    if (route.request().method() === 'POST') await answerReleased
    await route.fallback()
  })
  await setupChart(page)
  await page.getByRole('tab', { name: 'Assistant' }).click()
  const visualization = page.getByRole('region', { name: 'Visualisation' })
  const publish = visualization.getByRole('button', { name: 'Publier la visualisation' })
  await expect(publish).toBeEnabled()

  await sendAssistantMessage(page, 'Un histogramme des logements')
  try {
    const waiting = visualization.getByRole('button', { name: 'L’assistant répond…' })
    await expect(waiting).toBeDisabled()
    await expect(waiting).toHaveAccessibleDescription('')
  }
  finally {
    releaseAnswer()
  }
  await expect(page.getByTestId('assistant-panel').locator('article').last()).toContainText('Graphique créé.')
  await expect(publish).toBeEnabled()
})

test('the assistant cannot be written to while the visualization is published', async ({ page }) => {
  await setupChart(page)
  await page.getByLabel('Description').fill('Publiée pendant que l’assistant est verrouillé')
  await expect(page.locator('canvas').first()).toBeVisible()
  await page.getByRole('tab', { name: 'Assistant' }).click()
  // A message ready to send: only the lock keeps the button disabled.
  const composer = page.getByLabel('Votre demande')
  await composer.fill('Passe en courbe')
  const send = page.getByRole('button', { name: 'Envoyer' })
  await expect(send).toBeEnabled()
  const upload = await holdImageUpload(page)

  const responsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/1/visualizations/' && response.request().method() === 'POST')
  await page.getByRole('region', { name: 'Visualisation' }).getByRole('button', { name: 'Publier la visualisation' }).click()
  const chart = await (await responsePromise).json() as Chart
  try {
    await expect.poll(upload.held).toBe(1)
    await expect(composer).toBeDisabled()
    await expect(send).toBeDisabled()

    upload.release()
    await expect(page.getByText('Visualisation publiée !')).toBeVisible()
    await expect(composer).toBeEnabled()
    await expect(composer).toHaveValue('Passe en courbe')
    await expect(send).toBeEnabled()
  }
  finally {
    upload.release()
    await deleteChart(page.request, chart.id)
  }
})

test('publishing a draft makes it public', async ({ page }) => {
  const chart = await createChart(page.request, { title: `Chart configurator draft ${Date.now()}`, private: true })
  try {
    await mockTabular(page)
    await page.goto(`/admin/beta/charts/${chart.id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByLabel('Titre')).toHaveValue(chart.title)

    const responsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/1/visualizations/${chart.id}/`) && response.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Publier les modifications' }).click()
    const response = await responsePromise
    expect(((await response.json()) as Chart).private).toBe(false)
    await expect(page.getByText('Visualisation mise à jour !')).toBeVisible()
  }
  finally {
    await deleteChart(page.request, chart.id)
  }
})

test('the missing-fields warning leaves with the chart', async ({ page }) => {
  await withSecondTabularResource(page)
  await setupChart(page)
  await page.getByRole('button', { name: 'Publier la visualisation' }).click()
  const warning = page.getByTestId('chart-publish-warnings').getByRole('alert')
  await expect(warning).toBeVisible()

  const secondResourceId = await otherResourceId(page)
  await page.route(url => url.pathname === `/api/resources/${secondResourceId}/profile/`, route =>
    route.fulfill({ json: { ...profile, profile: { ...profile.profile, header: [], columns: {} } } }),
  )
  await page.getByLabel('Choix de la ressource').selectOption(secondResourceId)

  await expect(page.getByText('Aucun graphique créé')).toBeVisible()
  await expect(warning).toBeHidden()
})

test('saving from the assistant tab leads to the missing field', async ({ page }) => {
  await page.route('**/assistant/chat/**', route => route.abort())
  await setupChart(page)
  const posts = trackChartCreations(page)

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await page.getByRole('button', { name: 'Publier la visualisation' }).click()

  const warning = page.getByTestId('chart-publish-warnings').getByRole('alert')
  await expect(warning).toContainText('Le titre et la description sont obligatoires pour publier la visualisation.')
  await expect(page.getByTestId('form-panel')).toBeVisible()
  await expect(page.getByLabel('Description')).toBeFocused()

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await warning.getByRole('button', { name: 'Compléter' }).click()
  await expect(page.getByTestId('form-panel')).toBeVisible()
  await expect(page.getByLabel('Description')).toBeFocused()
  expect(posts).toHaveLength(0)
})

test.describe('without a chart to publish', () => {
  test.use({ allowedConsoleMessages: ['status of 500', 'Failed to load columns'] })

  test('the publish button waits for a chart and names the missing columns', async ({ page }) => {
    await page.route('**/assistant/chat/**', route => route.abort())
    await mockTabular(page)
    // Without columns, the new chart has no X column, so no chart to publish.
    await page.route('**/api/resources/*/profile/', route => route.fulfill({ status: 500, body: 'down' }))
    await chooseResource(page)
    await expect(page.getByTestId('source-status')).toHaveText('Colonnes indisponibles')

    const publish = page.getByRole('button', { name: 'Publier la visualisation' })
    await expect(publish).toBeVisible()
    await expect(publish).toBeDisabled()
    await expect(publish).toHaveAccessibleDescription('Colonnes indisponibles')
  })
})

test('saving without a description warns above the preview and leads to the field', async ({ page }) => {
  await setupChart(page)
  const posts = trackChartCreations(page)

  await page.getByRole('button', { name: 'Publier la visualisation' }).click()

  const warnings = page.getByTestId('chart-publish-warnings')
  const warning = warnings.getByRole('alert')
  await expect(warning).toContainText('Le titre et la description sont obligatoires pour publier la visualisation.')
  await expect(warning).toContainText('Description')
  await expect(warning).not.toContainText('Titre')
  expect(posts).toHaveLength(0)

  await expect(page.getByLabel('Description')).toBeFocused()
  await page.getByLabel('Titre').focus()
  await warning.getByRole('button', { name: 'Compléter' }).click()
  await expect(page.getByLabel('Description')).toBeFocused()

  await page.getByLabel('Description').fill('Description complétée')
  await expect(warning).toBeHidden()
  await expect(page.getByLabel('Description')).not.toHaveAttribute('aria-invalid', 'true')
  // Once complete, emptying a field again does not bring the warning back before a new save
  await page.getByLabel('Description').fill('')
  await expect(warnings.getByRole('alert')).toBeHidden()
  await page.getByLabel('Description').fill('Description complétée')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Publier la visualisation' }).click()
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

test('saving with empty required fields shows their errors and focuses the first one', async ({ page }) => {
  await setupChart(page)
  const posts = trackChartCreations(page)

  await page.getByLabel('Titre').fill('')
  await page.getByRole('button', { name: 'Publier la visualisation' }).click()

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

  await page.getByRole('button', { name: 'Publier la visualisation' }).click()
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

  await page.getByRole('button', { name: 'Publier la visualisation' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart

  await page.waitForTimeout(300)

  await expect(page.getByText('Visualisation publiée !')).toBeVisible()

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
  // An aggregate is only offered the numeric columns.
  await expect(page.getByRole('option', { name: 'libellé_EPCI', exact: true })).toBeHidden()
  await page.getByRole('option', { name: 'Taux de logements vacants* (en %)', exact: true }).first().click()

  await page.getByLabel('Label de l’axe Y').fill('Taux (%)')
  await page.locator('#y-axis-min').fill('0')
  await page.locator('#y-axis-max').fill('100')
  await page.locator('#y-axis-unit').fill('%')
  await page.getByLabel('Position', { exact: true }).selectOption('prefix')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')

  await page.getByRole('button', { name: 'Publier la visualisation' }).click()
  const response = await responsePromise
  const responseBody = (await response.json()) as Chart

  await page.waitForTimeout(300)
  await expect(page.getByText('Visualisation publiée !')).toBeVisible()

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
  await page.getByRole('button', { name: 'Publier la visualisation' }).click()
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

  await page.getByRole('button', { name: 'Publier la visualisation' }).click()
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

  // Column names and values reach api-tabular encoded twice: decoded twice to be read.
  // Default is ET inside groups, OU between groups: OrFilters[AndFilters, Filter].
  await expect.poll(() => decodeURIComponent(decodeURIComponent(dataRequests[dataRequests.length - 1] ?? ''))).toContain(
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
  await expect.poll(() => decodeURIComponent(decodeURIComponent(dataRequests[dataRequests.length - 1] ?? ''))).toContain(
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

// RGAA 7.5, 11.5, 11.10
test('announces the source status, titles its groups by a legend and explains the required star', async ({ page }) => {
  await setupChart(page)

  await expect(page.getByTestId('source-status')).toHaveAttribute('role', 'status')
  for (const name of ['Filtres', 'Contenu', 'Type de graphique', 'Axe X', 'Axe Y']) {
    await expect(page.getByRole('group', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByTestId('form-panel')).toContainText('Les champs précédés d\'une étoile (*) sont obligatoires.')
  // RGAA 3.2: the placeholders reach 4.5:1 against the white field
  const placeholderColor = await page.getByLabel('Unité', { exact: true }).evaluate(input => getComputedStyle(input, '::placeholder').color)
  expect(placeholderColor).toBe('rgb(102, 102, 102)')
  // RGAA 11.9: the icon-only filter buttons are named
  await page.getByRole('button', { name: 'Ajouter une règle' }).click()
  await expect(page.getByRole('button', { name: 'Supprimer la règle' })).toBeVisible()
})

test('the filter add buttons are blue and the fields of a new rule share one height', async ({ page }) => {
  await setupChart(page)
  const filters = page.locator('fieldset', { hasText: 'Filtres' })

  const addRule = page.getByRole('button', { name: 'Ajouter une règle' })
  await expect(addRule).toHaveCSS('color', 'rgb(0, 0, 145)')
  await addRule.click()
  await addRule.click()
  await expect(page.getByRole('button', { name: 'Ajouter un groupe' })).toHaveCSS('color', 'rgb(0, 0, 145)')

  // The new rule's column listbox is empty: it must not shrink, and the value input matches the listboxes.
  const row = page.getByRole('button', { name: 'Supprimer la règle' }).last().locator('..')
  const fields = row.locator('button.input, input.fr-input')
  await expect(fields).toHaveCount(4)
  // Not evaluateAll + getBoundingClientRect: the page crashes on it with the Firefox of Playwright 1.65.
  const heights = await Promise.all((await fields.all()).map(async field => (await field.boundingBox())?.height))
  expect(new Set(heights).size).toBe(1)
  await expect(filters.getByRole('button', { name: 'Ajouter une règle' })).toBeVisible()
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

// The chart form keeps the DSFR look of every other form: nothing in it may restyle
// a field, so each one renders like a field with the same classes outside the form.
test('the form fields keep their DSFR look', async ({ page }) => {
  await setupChart(page)

  const formPanel = page.getByTestId('form-panel')
  const fields = [
    formPanel.locator('#chart-title'),
    formPanel.locator('#chart-description'),
    formPanel.locator('#x-axis-type'),
    formPanel.locator('#x-axis-limit'),
    formPanel.locator('#y-axis-label'),
    formPanel.getByPlaceholder('Rechercher une colonne à afficher...'),
    formPanel.locator('#x-axis-sort-combined').getByRole('button').first(),
    formPanel.locator('label[for="chart-title"]'),
    formPanel.locator('label[for="x-axis-type"]'),
    page.locator('#resource-select'),
    page.locator('label[for="resource-select"]'),
  ]
  await expect(formPanel.locator('#chart-title')).toHaveClass(/\bfr-input\b/)
  await expect(formPanel.locator('#chart-description')).toHaveClass(/\bfr-input\b/)
  await expect(formPanel.locator('#x-axis-type')).toHaveClass(/\bfr-select\b/)
  await expect(page.locator('#resource-select')).toHaveClass(/\bfr-select\b/)

  for (const field of fields) {
    const styles = await field.evaluate((element) => {
      const properties = ['font-size', 'background-color', 'box-shadow', 'border-top-width', 'border-bottom-width', 'border-radius', 'padding-left']
      const reference = document.createElement(element.tagName)
      reference.className = element.className
      document.body.appendChild(reference)
      const read = (el: Element) => Object.fromEntries(properties.map(property => [property, getComputedStyle(el).getPropertyValue(property)]))
      const result = { field: read(element), reference: read(reference) }
      reference.remove()
      return result
    })
    expect(styles.field, await field.evaluate(element => element.outerHTML.slice(0, 120))).toEqual(styles.reference)
  }

  // The DSFR error state: a red underline instead of the default one.
  const title = formPanel.locator('#chart-title')
  await title.fill('')
  await title.blur()
  await expect(title).toHaveClass(/\bfr-input--error\b/)
  await expect(title).toHaveCSS('box-shadow', /rgb\(206, 5, 0\)/)
})

test('value limit input is bounded to 50, and empty means no limit', async ({ page }) => {
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
  // Emptied, the field means no limit (a set limit is sent by the PATCH test below).
  await limitInput.fill('')

  const responsePromise = page.waitForResponse(response => response.url().includes('/api/1/visualizations/') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Publier la visualisation' }).click()
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
    await page.getByRole('button', { name: 'Publier les modifications' }).click()
    const response = await responsePromise
    expect(response.status()).toBe(200)
    const body = response.request().postDataJSON() as { x_axis: { limit: number | null, column_x: string } }
    expect(body.x_axis.limit).toBe(5)
    expect(((await response.json()) as Chart).x_axis.limit).toBe(5)
    await expect(page.getByText('Visualisation mise à jour !')).toBeVisible()
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
    await page.getByRole('button', { name: 'Publier les modifications' }).click()
    const response = await responsePromise
    const body = response.request().postDataJSON() as { series: Array<{ column_y: string, aggregate_y: string }> }
    expect(body.series.map(s => [s.column_y, s.aggregate_y])).toEqual([['nom_region', 'count'], ['nom_region', 'count']])
  }
  finally {
    await deleteChart(page.request, chart.id)
  }
})

test('switching datasets clears the selected resource and its form', async ({ page }) => {
  await setupChart(page)

  const datasetSelect = page.getByTestId('searchable-select-jeu-de-donn-es')
  await datasetSelect.click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('Base SIRENE')
  await page.getByRole('option', { name: /Base SIRENE/i }).first().click()

  await expect(page.locator('#resource-select')).toHaveValue('')
  await expect(page.getByTestId('form-panel-empty')).toBeVisible()
})

test('clearing the dataset while its resources load stops the loading', async ({ page }) => {
  await setupChart(page)
  await page.route(url => /^\/api\/2\/datasets\/[^/]+\/resources\/$/.test(url.pathname), () => {})

  const datasetSelect = page.getByTestId('searchable-select-jeu-de-donn-es')
  await datasetSelect.click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('Base SIRENE')
  await page.getByRole('option', { name: /Base SIRENE/i }).first().click()
  const status = page.getByTestId('source-status')
  await expect(status).toHaveText('Chargement…')

  await datasetSelect.locator('..').getByTitle('Effacer').click()
  await expect(status).toHaveText('Source à sélectionner')
})

test('a dataset left while its resources load does not end the loading of the next one', async ({ page }) => {
  await setupChart(page)
  const held: Array<{ continue: () => Promise<void> }> = []
  await page.route(url => /^\/api\/2\/datasets\/[^/]+\/resources\/$/.test(url.pathname), route => held.push(route))

  const datasetSelect = page.getByTestId('searchable-select-jeu-de-donn-es')
  await datasetSelect.click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('Base SIRENE')
  await page.getByRole('option', { name: /Base SIRENE/i }).first().click()
  await expect.poll(() => held.length).toBe(1)
  await datasetSelect.click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('logements sociaux')
  await page.getByRole('option', { name: 'Logements sociaux et bailleurs par région', exact: true }).click()
  await expect.poll(() => held.length).toBe(2)

  const status = page.getByTestId('source-status')
  const firstAnswer = page.waitForResponse(response => response.url().includes('/resources/'))
  await held[0]!.continue()
  await firstAnswer
  await expect(status).toHaveText('Chargement…')
  await held[1]!.continue()
  await expect(status).toHaveText('Source à sélectionner')
})

test('the resource choice only lists the resources of the selected dataset', async ({ page }) => {
  await setupChart(page)
  const datasetSelect = page.getByTestId('searchable-select-jeu-de-donn-es')
  await datasetSelect.click()
  await page.getByPlaceholder('Recherchez un jeu de données...').fill('Base SIRENE')
  await page.getByRole('option', { name: /Base SIRENE/i }).first().click()
  await expect(page.getByTestId('source-status')).toHaveText('Source à sélectionner')
  await expect(page.locator(`#resource-select option[value="${RESOURCE_ID}"]`)).toHaveCount(0)
})

test.describe('when a resource profile cannot be read', () => {
  test.use({ allowedConsoleMessages: ['status of 500', 'status of 400', 'Failed to load columns'] })

  test('says the columns are unavailable, and a retry shows the loading', async ({ page }) => {
    await withSecondTabularResource(page)
    await setupChart(page)
    const secondResourceId = await otherResourceId(page)
    let fail = true
    // The configurator and the chart viewer both fetch the profile: hold and release them all.
    const held: Array<() => void> = []
    await page.route(`**/api/resources/${secondResourceId}/profile/`, async (route) => {
      if (fail) return route.fulfill({ status: 500, body: 'down' })
      await new Promise<void>(resolve => held.push(resolve))
      await route.fallback()
    })

    const status = page.getByTestId('source-status')
    await page.getByLabel('Choix de la ressource').selectOption(secondResourceId)
    await expect(status).toHaveText('Colonnes indisponibles')
    fail = false
    await page.getByRole('button', { name: 'Réessayer' }).click()
    await expect(status).toHaveText('Chargement…')
    await expect.poll(() => held.length).toBeGreaterThan(0)
    // A request reaching the route after this would be held forever.
    await page.unroute(`**/api/resources/${secondResourceId}/profile/`)
    held.forEach(release => release())
    await expect(status).toHaveText(/colonnes disponibles/)
  })

  test('opening a chart keeps its columns', async ({ page }) => {
    await page.route('**/assistant/chat/**', route => route.abort())
    const chart = await createChart(page.request, { title: 'Profil en panne', xColumn: 'region' })
    try {
      await mockTabular(page)
      await page.route('**/api/resources/*/profile/', route => route.fulfill({ status: 500, body: 'down' }))
      let saved: { x_axis: { column_x: string }, series: Array<{ column_y: string }> } | null = null
      await page.route(url => url.pathname === `/api/1/visualizations/${chart.id}/`, async (route) => {
        if (route.request().method() !== 'PATCH') return route.fallback()
        saved = route.request().postDataJSON()
        await route.fulfill({ status: 400, json: { message: 'Not saved by this test' } })
      })
      await page.goto(`/admin/beta/charts/${chart.id}`)
      await expect(page.getByTestId('source-status')).toHaveText('Colonnes indisponibles')
      await page.getByRole('button', { name: 'Publier les modifications' }).click()
      await expect.poll(() => saved).not.toBeNull()
      expect(saved!.x_axis.column_x).toBe('region')
      expect(saved!.series[0]!.column_y).toBe('valeur')
    }
    finally {
      await deleteChart(page.request, chart.id)
    }
  })
})

test('a resource without columns says so', async ({ page }) => {
  await withSecondTabularResource(page)
  await setupChart(page)
  const secondResourceId = await otherResourceId(page)
  await page.route(`**/api/resources/${secondResourceId}/profile/`, route =>
    route.fulfill({ json: { profile: { header: [], columns: {}, formats: {}, profile: {} } } }),
  )
  await page.getByLabel('Choix de la ressource').selectOption(secondResourceId)
  await expect(page.getByTestId('source-status')).toHaveText('Aucune colonne disponible')
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

  // The source status counts the columns of the resource the form uses.
  const sourceStatus = page.getByTestId('source-status')
  const firstResourceStatus = (await sourceStatus.textContent())!.trim()
  expect(firstResourceStatus).toMatch(/^\d+ colonnes disponibles$/)
  expect(firstResourceStatus).not.toBe('2 colonnes disponibles')
  const resourceSelect = page.locator('#resource-select')

  try {
    await resourceSelect.selectOption(secondResourceId)
    await profileRequestStarted
    // The first resource's columns are already loaded: selecting it back needs no request.
    await resourceSelect.selectOption(RESOURCE_ID)
    await expect(sourceStatus).toHaveText(firstResourceStatus)

    const lateProfileResponse = page.waitForResponse(response =>
      response.url().includes(`/api/resources/${secondResourceId}/profile/`),
    )
    releaseProfile()
    await (await lateProfileResponse).finished()
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))

    await expect(sourceStatus).toHaveText(firstResourceStatus)
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

test('a failed answer shows the server reason, which says whether waiting helps', async ({ page }) => {
  const reason = 'Le service d\'IA reçoit trop de demandes. Réessayez dans quelques instants.'
  await routeAssistantStream(page, errorStream(reason))
  await setupChart(page)

  await page.getByRole('tab', { name: 'Assistant' }).click()
  // Not sendAssistantMessage: a failed answer gives the message back to the composer,
  // which that helper waits to see empty.
  await page.getByLabel('Votre demande').fill('Top 5 des départements')
  await page.getByRole('button', { name: 'Envoyer' }).click()
  await expect(page.getByText(reason)).toBeVisible()
  await expect(page.getByLabel('Votre demande')).toHaveValue('Top 5 des départements')
})

test('chat message is sent with the selected resource and the conversation survives tab switches', async ({ page }) => {
  // Routed in the page so that a local run never reaches a real assistant.
  await routeAssistantStream(page, assistantChatStream)
  await setupChart(page)

  await page.getByRole('tab', { name: 'Assistant' }).click()
  await expect(page.getByTestId('assistant-panel')).toBeVisible()
  await expect(page.getByTestId('form-panel')).toBeHidden()
  await expect(page.locator('#resource-select')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Publier la visualisation' })).toBeVisible()

  const request = await sendAssistantMessage(page, 'Logements par région en histogramme')
  const body = request.postDataJSON() as { resource_id: string, visualization: Record<string, unknown>, messages: Array<{ role: string }> }
  expect(body.resource_id).toBe(RESOURCE_ID)
  expect(body.visualization).toMatchObject({ exists: false, title: 'Mon graphique', x_axis: { column_x: 'année_publication' } })
  // Only the chart itself: no ownership, visibility or extras.
  expect(Object.keys(body.visualization).sort()).toEqual(['description', 'exists', 'series', 'title', 'x_axis', 'y_axis'])
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
  // Routed in the page so that a local run never reaches a real assistant.
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

test('the styles section starts open and folds', async ({ page }) => {
  await page.route('**/assistant/chat/**', route => route.abort())
  await setupChart(page)

  const toggle = page.getByTestId('chart-styles').getByRole('button', { name: 'Styles' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByLabel('Label de l’axe Y')).toBeVisible()
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByLabel('Label de l’axe Y')).toBeHidden()
})

test.describe('a chart whose series differ in type or filter', () => {
  const serie = { column_y: 'valeur', aggregate_y: 'sum', resource_id: RESOURCE_ID, column_x_name_override: null }
  const filter = { _cls: 'Filter', column: 'region', condition: 'exact', value: 'Bretagne' }

  test('cannot be saved from the form, which would overwrite them', async ({ page }) => {
    await page.route('**/assistant/chat/**', route => route.abort())
    const chart = await createChart(page.request, {
      title: 'Séries mixtes',
      series: [
        { ...serie, type: 'histogram', filters: filter },
        { ...serie, type: 'line', aggregate_y: 'max', filters: null },
      ],
    } as never)
    try {
      await mockTabular(page)
      await page.goto(`/admin/beta/charts/${chart.id}`)
      const banner = page.getByTestId('chart-publish-warnings').getByTestId('chart-mixed-series')
      await expect(banner).toBeVisible()
      const save = page.getByRole('button', { name: 'Publier les modifications' })
      await expect(save).toBeDisabled()
      await expect(save).toHaveAccessibleDescription(await banner.innerText())
      await page.getByRole('tab', { name: 'Assistant' }).click()
      await expect(banner).toBeVisible()
    }
    finally {
      await deleteChart(page.request, chart.id)
    }
  })
})

test('a double click on save creates one chart, with its image', async ({ page }) => {
  await page.route('**/assistant/chat/**', route => route.abort())
  const posts = trackChartCreations(page)
  const images: Array<string> = []
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/image/')) images.push(request.url())
  })
  await setupChart(page)
  await page.getByRole('tab', { name: 'Édition manuelle' }).click()
  await page.getByLabel('Titre').fill('Double clic')
  await page.getByLabel('Description').fill('Vérification du double clic.')
  // Every chart created is deleted, a second one too should the guard regress.
  const createdIds: Array<Promise<string>> = []
  page.on('response', (response) => {
    if (new URL(response.url()).pathname === '/api/1/visualizations/' && response.request().method() === 'POST' && response.ok()) {
      createdIds.push(response.json().then((chart: { id: string }) => chart.id))
    }
  })
  await page.getByRole('button', { name: 'Publier la visualisation' }).dblclick()
  try {
    await expect(page.getByText('Visualisation publiée !')).toBeVisible()
    expect(posts).toHaveLength(1)
    expect(images).toHaveLength(1)
  }
  finally {
    for (const id of await Promise.all(createdIds)) await deleteChart(page.request, id)
  }
})

test.describe('when a chart of several series changes resource', () => {
  // The save is answered with a 400 so that no chart is created.
  test.use({ allowedConsoleMessages: ['the server responded with a status of 400'] })

  test('opening a chart whose series read two resources keeps each on its own', async ({ page }) => {
    await page.route('**/assistant/chat/**', route => route.abort())
    const info = await (await page.request.get(`${API_BASE_URL}/api/2/datasets/resources/${RESOURCE_ID}/`)).json() as { dataset_id: string }
    const resources = await (await page.request.get(`${API_BASE_URL}/api/2/datasets/${info.dataset_id}/resources/?page_size=50`)).json() as { data: Array<{ id: string }> }
    const other = resources.data.map(resource => resource.id).find(id => id !== RESOURCE_ID)
    expect(other, 'the fixture dataset has another resource').toBeDefined()
    const serie = { type: 'histogram', column_y: 'valeur', aggregate_y: 'sum', column_x_name_override: null, filters: null }
    const chart = await createChart(page.request, {
      title: 'Deux ressources',
      series: [{ ...serie, resource_id: RESOURCE_ID }, { ...serie, resource_id: other }],
    } as never)
    try {
      await mockTabular(page)
      let saved: { series: Array<{ resource_id: string }> } | null = null
      await page.route(url => url.pathname === `/api/1/visualizations/${chart.id}/`, async (route) => {
        if (route.request().method() !== 'PATCH') return route.fallback()
        saved = route.request().postDataJSON()
        await route.fulfill({ status: 400, json: { message: 'Not saved by this test' } })
      })
      await page.goto(`/admin/beta/charts/${chart.id}`)
      const save = page.getByRole('button', { name: 'Publier les modifications' })
      await expect(save).toBeEnabled()
      await save.click()
      await expect.poll(() => saved).not.toBeNull()
      expect(saved!.series.map(s => s.resource_id)).toEqual([RESOURCE_ID, other])
    }
    finally {
      await deleteChart(page.request, chart.id)
    }
  })

  test('changing resource moves every series of the chart to it', async ({ page }) => {
    const output = createChartOutput(RESOURCE_ID)
    output.chart.series.push({ ...output.chart.series[0]!, aggregate_y: 'sum' })
    await routeAssistantStream(page, createChartStream(RESOURCE_ID, output))
    await withSecondTabularResource(page)
    await setupChart(page)
    await page.getByRole('tab', { name: 'Assistant' }).click()
    await sendAssistantMessage(page, 'Premières doses, maximum et somme')
    await expect(page.getByTestId('assistant-panel').locator('article').last()).toContainText('Graphique créé.')

    await page.getByRole('tab', { name: 'Édition manuelle' }).click()
    const secondResourceId = await otherResourceId(page)
    await page.getByLabel('Choix de la ressource').selectOption(secondResourceId)

    // Answered here: the series are read from the request, no chart is created.
    let saved: { series: Array<{ resource_id: string }> } | null = null
    await page.route(url => url.pathname === '/api/1/visualizations/', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback()
      saved = route.request().postDataJSON()
      await route.fulfill({ status: 400, json: { message: 'Not saved by this test' } })
    })
    await page.getByRole('button', { name: 'Publier la visualisation' }).click()
    await expect.poll(() => saved).not.toBeNull()
    expect(saved!.series.map(serie => serie.resource_id)).toEqual([secondResourceId, secondResourceId])
  })

  test('a resource chosen after switching datasets takes the series along', async ({ page }) => {
    await withSecondTabularResource(page)
    await setupChart(page)
    await page.getByLabel('Titre').fill('Changement de jeu de données')
    await page.getByLabel('Description').fill('La série suit la ressource choisie.')

    // Away and back: the resource select is emptied, the series still read the first resource.
    const datasetSelect = page.getByTestId('searchable-select-jeu-de-donn-es')
    await datasetSelect.click()
    await page.getByPlaceholder('Recherchez un jeu de données...').fill('Base SIRENE')
    await page.getByRole('option', { name: /Base SIRENE/i }).first().click()
    await expect(page.locator('#resource-select')).toHaveValue('')
    await datasetSelect.click()
    await page.getByPlaceholder('Recherchez un jeu de données...').fill('logements sociaux')
    await page.getByRole('option', { name: 'Logements sociaux et bailleurs par région', exact: true }).click()
    await expect(page.locator('#resource-select')).toHaveValue('')

    const secondResourceId = await otherResourceId(page)
    await page.getByLabel('Choix de la ressource').selectOption(secondResourceId)

    let saved: { series: Array<{ resource_id: string }> } | null = null
    await page.route(url => url.pathname === '/api/1/visualizations/', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback()
      saved = route.request().postDataJSON()
      await route.fulfill({ status: 400, json: { message: 'Not saved by this test' } })
    })
    await page.getByRole('button', { name: 'Publier la visualisation' }).click()
    await expect.poll(() => saved).not.toBeNull()
    expect(saved!.series.map(serie => serie.resource_id)).toEqual([secondResourceId])
  })
})
