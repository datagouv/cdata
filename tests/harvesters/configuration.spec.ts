import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createHarvestSource, deleteHarvestSources } from '../helpers'

const createdSources: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteHarvestSources(request, createdSources)
})

// The schedule shown above the tabs sits in the <span> following its "Planning :" label.
const scheduleShownAboveTabs = (page: Page) => page.getByText('Planning :').locator('xpath=following-sibling::span')

const save = async (page: Page) => {
  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page.getByText('Moissonneur mis à jour !')).toBeVisible()
}

test('a feature enabled on the source shows as enabled, even when reaching the tab from another page', async ({ page, request }) => {
  // `geodcatap` defaults to false on the csw-dcat backend, so a toggle showing as disabled
  // here would mean the stored value was replaced by the backend default.
  const source = await createHarvestSource(request, `Moissonneur features ${Date.now()}`, 'csw-dcat', {
    features: { geodcatap: true },
  })
  createdSources.push(source.id)

  // Through a client-side navigation: the backends list is fetched lazily, so it resolves
  // after the source itself.
  await page.goto(`/admin/harvesters/${source.id}/`)
  await page.getByRole('link', { name: 'Configuration' }).click()

  await expect(page.getByRole('switch', { name: 'GeoDCAT-AP' })).toBeChecked()
})

test('saving without touching anything keeps the features of the source', async ({ page, request }) => {
  const source = await createHarvestSource(request, `Moissonneur sauvegarde ${Date.now()}`, 'csw-dcat', {
    features: { geodcatap: true },
  })
  createdSources.push(source.id)

  await page.goto(`/admin/harvesters/${source.id}/configuration/`)
  await expect(page.getByRole('switch', { name: 'GeoDCAT-AP' })).toBeChecked()

  await save(page)

  const saved = await (await request.get(`${API_BASE}/api/1/harvest/source/${source.id}/`)).json()
  expect(saved.config.features).toEqual({ geodcatap: true })

  await page.reload()
  await expect(page.getByRole('switch', { name: 'GeoDCAT-AP' })).toBeChecked()
})

test('disabling a feature is persisted', async ({ page, request }) => {
  const source = await createHarvestSource(request, `Moissonneur désactivation ${Date.now()}`, 'csw-dcat', {
    features: { geodcatap: true },
  })
  createdSources.push(source.id)

  await page.goto(`/admin/harvesters/${source.id}/configuration/`)
  await page.getByRole('switch', { name: 'GeoDCAT-AP' }).click()
  await save(page)

  const saved = await (await request.get(`${API_BASE}/api/1/harvest/source/${source.id}/`)).json()
  expect(saved.config.features).toEqual({ geodcatap: false })

  await page.reload()
  await expect(page.getByRole('switch', { name: 'GeoDCAT-AP' })).not.toBeChecked()
})

test('the source shown around the tabs is up to date right after a save', async ({ page, request }) => {
  const source = await createHarvestSource(request, `Moissonneur entête ${Date.now()}`, 'csw-dcat')
  createdSources.push(source.id)
  const newName = `${source.name} renommé`

  await page.goto(`/admin/harvesters/${source.id}/configuration/`)
  await page.getByLabel('Nom', { exact: true }).fill(newName)
  await save(page)

  // No reload: the heading above the tabs is built from the same source object.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(newName)
})

test('a schedule can be set then removed, and saving again leaves it alone', async ({ page, request }) => {
  const source = await createHarvestSource(request, `Moissonneur planning ${Date.now()}`, 'csw-dcat')
  createdSources.push(source.id)

  const unscheduleCalls: Array<string> = []
  page.on('request', (request) => {
    if (request.method() === 'DELETE' && request.url().includes('/schedule')) {
      unscheduleCalls.push(request.url())
    }
  })

  await page.goto(`/admin/harvesters/${source.id}/configuration/`)
  await expect(scheduleShownAboveTabs(page)).toHaveText('N/A')

  await page.getByLabel('Planning', { exact: true }).fill('0 0 * * *')
  await save(page)
  await expect(scheduleShownAboveTabs(page)).toHaveText('0 0 * * *')

  await page.getByLabel('Planning', { exact: true }).fill('')
  await save(page)
  await expect(scheduleShownAboveTabs(page)).toHaveText('N/A')
  expect(unscheduleCalls).toHaveLength(1)

  // The source is now unscheduled: the API answers null for its schedule while the form
  // holds ''. Saving again must not try to unschedule it a second time.
  await expect(page.getByText('Moissonneur mis à jour !')).toBeHidden()
  await save(page)

  expect(unscheduleCalls).toHaveLength(1)
  await expect(scheduleShownAboveTabs(page)).toHaveText('N/A')
})

test('changing the backend drops the configs the new one does not know about', async ({ page, request }) => {
  // `remote_url_prefix` only exists on the CSW backends, not on plain DCAT.
  const source = await createHarvestSource(request, `Moissonneur backend ${Date.now()}`, 'csw-dcat', {
    extra_configs: [{ key: 'remote_url_prefix', value: 'https://example.com/prefix/' }],
  })
  createdSources.push(source.id)

  await page.goto(`/admin/harvesters/${source.id}/configuration/`)
  // The config label carries an empty `for`, so it can't be reached through its input.
  await expect(page.getByText('Préfixe d\'URL distante')).toBeVisible()
  await expect(page.getByLabel('Type de configuration')).toHaveValue('https://example.com/prefix/')

  await page.getByLabel('Type', { exact: true }).selectOption({ label: 'DCAT' })
  await expect(page.getByText('Préfixe d\'URL distante')).toBeHidden()

  await save(page)

  const saved = await (await request.get(`${API_BASE}/api/1/harvest/source/${source.id}/`)).json()
  expect(saved.backend).toEqual('dcat')
  expect(saved.config.extra_configs).toEqual([])
})
