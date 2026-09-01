import { test, expect } from '../base'
import { createDatasetWithRemoteResources, deleteDatasets, enableNewExplorer } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ page, request }) => {
  await page.context().clearCookies({ name: 'new_explorer' })
  await deleteDatasets(request, createdDatasets)
})

test('the feedback link pre-fills the form with the current context', async ({ page, request }) => {
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explorer feedback ${Date.now()}`, ['Fichier numero 01'])
  createdDatasets.push(dataset.id)
  const resource = resources[0]!

  await enableNewExplorer(page, `/datasets/${dataset.id}?resource_id=${resource.id}`)

  const link = page.getByRole('link', { name: 'Donner votre avis' })
  // The resource params only appear once the explorer has forwarded its
  // selection client-side, so let the assertion retry instead of reading the
  // SSR href once.
  await expect(link).toHaveAttribute('href', /url_ressource=/)

  const hrefAttribute = await link.getAttribute('href')
  expect(hrefAttribute).toBeTruthy()
  const href = new URL(hrefAttribute!)
  expect(href.searchParams.get('dataset_id')).toBe(dataset.id)
  expect(href.searchParams.get('dataset_name')).toBe(dataset.title)
  expect(href.searchParams.get('dataset_url')).toContain(`/datasets/${dataset.slug}`)
  expect(href.searchParams.get('url_ressource')).toBe(resource.url)
  expect(href.searchParams.get('format_ressource')).toBe('csv')
  expect(href.searchParams.get('navigateur_appareil')).toBe('Chrome - desktop')
})
