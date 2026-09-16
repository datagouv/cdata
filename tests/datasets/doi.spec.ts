import { test, expect } from '../base'
import { createDataset, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

test('a dataset without a DOI offers to request one', async ({ page, request }) => {
  const dataset = await createDataset(request, `Test DOI request ${Date.now()}`, 'Dataset de test E2E')
  createdDatasets.push(dataset.id)

  await page.goto(`/datasets/${dataset.id}/informations`)

  await expect(page.getByText('Ce jeu de données n\'a pas de DOI.')).toBeVisible()

  await page.getByRole('button', { name: 'Demander un DOI' }).click()

  const modal = page.getByRole('dialog')
  await expect(modal.getByLabel('Votre adresse email')).toBeVisible()
  await expect(modal.getByRole('button', { name: 'Envoyer la demande' })).toBeVisible()
})
