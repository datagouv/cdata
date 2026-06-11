import { test, expect } from '../base'
import { createDataset, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

test('can edit a dataset and changes are visible on the public page', async ({ page, request }) => {
  const uniqueId = Date.now()
  const newTitle = `Dataset modifié ${uniqueId}`
  const newDescription = `Description modifiée par le test E2E ${uniqueId}`

  const dataset = await createDataset(request, `Test edition dataset ${uniqueId}`, 'Dataset pour tester l\'édition')
  createdDatasets.push(dataset.id)

  await page.goto(`/admin/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Titre *', { exact: true }).fill(newTitle)
  await page.getByTestId('markdown-editor').fill(newDescription)
  // The markdown editor emits its changes with a 300ms debounce: wait for the
  // model to be updated before saving
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Sauvegarder' }).click()

  await expect(page.getByText('Jeu de données mis à jour !')).toBeVisible()

  // The changes are persisted and visible on the public page
  await page.goto(`/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(newTitle)
  await expect(page.getByText(newDescription)).toBeVisible()
})
