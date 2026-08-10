import { test, expect } from '../base'
import { createDatasetWithRemoteResources, deleteDatasets, enableNewExplorer } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

test('switching back to the old navigation drops ?resource_id', async ({ page, request }) => {
  const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test explorer toggle ${Date.now()}`, ['Fichier numero 01', 'Fichier numero 02'])
  createdDatasets.push(dataset.id)
  const target = resources[1]!

  await enableNewExplorer(page, `/datasets/${dataset.id}?resource_id=${target.id}`)

  await page.getByRole('button', { name: 'Revenir sur l\'ancienne navigation' }).click()

  // The old layout has no notion of a selected resource in the URL, so the flag is
  // dropped rather than left pointing at nothing.
  await expect(page).not.toHaveURL(/resource_id=/)
  await expect(page.locator('aside')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Tester la nouvelle navigation' })).toBeVisible()
})

test('the header explore button opens the fullscreen explorer from a tab that has none', async ({ page, request }) => {
  const { dataset } = await createDatasetWithRemoteResources(request, `Test explorer header button ${Date.now()}`, ['Fichier numero 01'])
  createdDatasets.push(dataset.id)

  await enableNewExplorer(page, `/datasets/${dataset.id}`)

  // The informations tab renders no explorer of its own, so this button is the only
  // way in — it must follow the explorer the visitor chose rather than disappear.
  await page.goto(`/datasets/${dataset.id}/informations`)

  const exploreButton = page.getByRole('link', { name: 'Explorer les données' })
  await expect(exploreButton).toBeVisible({ timeout: 30000 })

  await exploreButton.click()
  await expect(page).toHaveURL(/\/explore\//)
  await expect(page.locator('aside')).toBeVisible({ timeout: 30000 })
})

test('the explorer choice survives a reload', async ({ page, request }) => {
  const { dataset } = await createDatasetWithRemoteResources(request, `Test explorer toggle cookie ${Date.now()}`, ['Fichier numero 01'])
  createdDatasets.push(dataset.id)

  await enableNewExplorer(page, `/datasets/${dataset.id}`)

  // The flag is persisted in a cookie, so a fresh load keeps the new explorer.
  await page.goto(`/datasets/${dataset.id}`)
  await expect(page.locator('aside')).toBeVisible({ timeout: 30000 })

  await page.getByRole('button', { name: 'Revenir sur l\'ancienne navigation' }).click()
  await page.goto(`/datasets/${dataset.id}`)
  await expect(page.locator('aside')).toBeHidden()
})
