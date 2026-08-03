import { test, expect } from '../base'
import { API_BASE, createDatasetWithRemoteResources, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

test('a search result opens the fullscreen explorer on that resource', async ({ page, request }) => {
  const { dataset } = await createDatasetWithRemoteResources(request, `Test explore search ${Date.now()}`, ['Fichier tabulaire'])
  createdDatasets.push(dataset.id)

  // The search results depend on indexed fixtures and on hydra having analysed the
  // resource, neither of which a test controls: serve the real dataset payload back,
  // marked as tabular so the page lists it.
  const payload = await (await request.get(`${API_BASE}/api/1/datasets/${dataset.id}/`)).json()
  const resource = payload.resources[0]
  resource.filetype = 'file'
  resource.extras['analysis:parsing:parsing_table'] = 'parsing-table-id'

  await page.route(/\/api\/1\/datasets\/\?/, route => route.fulfill({
    json: { data: [payload], total: 1, page: 1, page_size: 10, next_page: null, previous_page: null },
  }))

  await page.goto('/explore')
  await page.getByPlaceholder('Rechercher un fichier').fill('tabulaire')
  await page.getByPlaceholder('Rechercher un fichier').press('Enter')

  const card = page.getByRole('link', { name: payload.title })
  await expect(card).toBeVisible({ timeout: 30000 })
  await expect(card).toHaveAttribute('href', `/explore/${dataset.id}?resource_id=${resource.id}`)

  await card.click()

  await expect(page).toHaveURL(`/explore/${dataset.id}?resource_id=${resource.id}`)
  await expect(page.locator('header').getByText('Fichier tabulaire', { exact: true })).toBeVisible({ timeout: 30000 })
})
