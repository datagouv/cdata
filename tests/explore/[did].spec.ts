import { test, expect } from '../base'
import { createDatasetWithRemoteResources, deleteDatasets, enableNewExplorer } from '../helpers'

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
  // The API serves resources newest first, so the last created one is what the
  // explorer selects by default: target the first created one instead, otherwise
  // this passes whether ?resource_id is read or ignored.
  const target = resources[0]!
  const selectedByDefault = resources[2]!

  await page.goto(`/explore/${dataset.id}?resource_id=${target.id}`)

  await expect(page.locator('header').getByText(target.title, { exact: true })).toBeVisible({ timeout: 30000 })
  await expect(page.locator('header').getByText(selectedByDefault.title, { exact: true })).toBeHidden()
})

test('a resource beyond the first page of its group can still be deep-linked', async ({ page, request }) => {
  // The sidebar loads 10 resources per group (RESOURCE_EXPLORER_PAGE_SIZE), and the API
  // serves them newest first: the first created one lands in 12th position, out of that
  // first page, so it is only selectable through its own fetch.
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explore deep link ${Date.now()}`, resourceTitles(12))
  createdDatasets.push(dataset.id)
  const outOfFirstPage = resources[0]!

  await page.goto(`/explore/${dataset.id}?resource_id=${outOfFirstPage.id}`)

  await expect(page.locator('header').getByText(outOfFirstPage.title, { exact: true })).toBeVisible({ timeout: 30000 })
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

test('the viewer explore button enters fullscreen on the resource being viewed', async ({ page, request }) => {
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explore entry ${Date.now()}`, resourceTitles(2))
  createdDatasets.push(dataset.id)
  const shown = resources[1]!

  await enableNewExplorer(page, `/datasets/${dataset.slug}`)

  // Two links carry that name on this page — the dataset header one, which opens the
  // explorer on no resource in particular, and this one. Tell them apart by their
  // target rather than by their label.
  await page.locator('a[href*="/explore/"][href*="resource_id="]').click()

  await expect(page).toHaveURL(new RegExp(`/explore/[^?]+\\?resource_id=${shown.id}`))
  await expect(page.locator('header').getByText(shown.title, { exact: true })).toBeVisible({ timeout: 30000 })
})

test('loading more resources appends the next page to its group', async ({ page, request }) => {
  // 12 resources for a page size of 10: the two oldest sit on the second page.
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explore load more ${Date.now()}`, resourceTitles(12))
  createdDatasets.push(dataset.id)
  const onSecondPage = resources[0]!

  await page.goto(`/explore/${dataset.slug}`)
  await expect(page.locator('aside')).toBeVisible({ timeout: 30000 })
  await expect(page.locator('aside').getByRole('link', { name: onSecondPage.title })).toBeHidden()

  await page.locator('aside').getByRole('button', { name: 'Charger plus…' }).click()

  await expect(page.locator('aside').getByRole('link', { name: onSecondPage.title })).toBeVisible()
})

test('switching resources does not pile up history entries', async ({ page, request }) => {
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explore history ${Date.now()}`, resourceTitles(3))
  createdDatasets.push(dataset.id)

  await page.goto('/explore')
  await page.goto(`/explore/${dataset.slug}`)
  await expect(page.locator('aside')).toBeVisible({ timeout: 30000 })

  await page.locator('aside').getByRole('link', { name: resources[1]!.title }).click()
  await expect(page).toHaveURL(new RegExp(`resource_id=${resources[1]!.id}`))
  await page.locator('aside').getByRole('link', { name: resources[0]!.title }).click()
  await expect(page).toHaveURL(new RegExp(`resource_id=${resources[0]!.id}`))

  // Selections replace each other, so going back leaves the explorer instead of
  // stepping through the resources we just viewed.
  await page.goBack()
  await expect(page).toHaveURL(/\/explore$/)
})

test('the explorer answers a 404 for a dataset that does not exist', async ({ page }) => {
  const response = await page.request.get('/explore/does-not-exist-at-all')

  expect(response.status()).toBe(404)
})
