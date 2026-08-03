import { test, expect } from '../base'
import { createDatasetWithRemoteResources, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

function resourceTitles(count: number): Array<string> {
  return Array.from({ length: count }, (_, index) => `Fichier numero ${String(index + 1).padStart(2, '0')}`)
}

test('the fullscreen explorer opens on the resource carried by ?resource_id', async ({ page, request }) => {
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explore fullscreen ${Date.now()}`, resourceTitles(3))
  createdDatasets.push(dataset.id)
  const target = resources[2]!

  await page.goto(`/explore/${dataset.id}?resource_id=${target.id}`)

  // The viewer header names the resource the URL points at, not the first one.
  await expect(page.getByRole('heading', { name: dataset.title })).toBeHidden()
  await expect(page.locator('header').getByText(target.title, { exact: true })).toBeVisible({ timeout: 30000 })
})

test('a resource beyond the first page of its group can still be deep-linked', async ({ page, request }) => {
  // The sidebar loads 10 resources per group (RESOURCE_EXPLORER_PAGE_SIZE), so the
  // 12th is not in the first page: it is fetched on its own to stay selectable.
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explore deep link ${Date.now()}`, resourceTitles(12))
  createdDatasets.push(dataset.id)
  const last = resources[11]!

  await page.goto(`/explore/${dataset.id}?resource_id=${last.id}`)

  await expect(page.locator('header').getByText(last.title, { exact: true })).toBeVisible({ timeout: 30000 })
})

test('clicking a resource in the sidebar updates resource_id and the viewer', async ({ page, request }) => {
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explore sidebar ${Date.now()}`, resourceTitles(3))
  createdDatasets.push(dataset.id)
  const other = resources[0]!

  await page.goto(`/explore/${dataset.id}`)
  await expect(page.locator('aside')).toBeVisible({ timeout: 30000 })

  await page.locator('aside').getByRole('link', { name: other.title }).click()

  await expect(page).toHaveURL(new RegExp(`resource_id=${other.id}`))
  await expect(page.locator('header').getByText(other.title, { exact: true })).toBeVisible()
})

test('leaving fullscreen lands back on the dataset page, on the same resource', async ({ page, request }) => {
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explore exit ${Date.now()}`, resourceTitles(2))
  createdDatasets.push(dataset.id)
  const target = resources[1]!

  await page.goto(`/explore/${dataset.id}?resource_id=${target.id}`)
  await expect(page.locator('header').getByText(target.title, { exact: true })).toBeVisible({ timeout: 30000 })

  // The exit link uses the slug so the slug redirect doesn't drop the query.
  await page.getByRole('link', { name: 'Quitter le plein écran' }).click()

  await expect(page).toHaveURL(new RegExp(`/datasets/[^?]+\\?resource_id=${target.id}`))
})

test('the active tab is carried in the URL', async ({ page, request }) => {
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explore tab ${Date.now()}`, resourceTitles(1))
  createdDatasets.push(dataset.id)
  const target = resources[0]!

  await page.goto(`/explore/${dataset.id}?resource_id=${target.id}`)
  await expect(page.getByRole('tab', { name: 'Métadonnées' })).toBeVisible({ timeout: 30000 })

  await page.getByRole('tab', { name: 'Métadonnées' }).click()
  await expect(page).toHaveURL(/tab=metadata/)

  // A link shared from that tab opens on it rather than falling back to the first one.
  await page.reload()
  await expect(page.getByRole('tab', { name: 'Métadonnées', selected: true })).toBeVisible({ timeout: 30000 })
})

test('the explorer answers a 404 for a dataset that does not exist', async ({ page }) => {
  const response = await page.request.get('/explore/does-not-exist-at-all')

  expect(response.status()).toBe(404)
})
