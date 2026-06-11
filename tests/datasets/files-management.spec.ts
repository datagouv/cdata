import type { APIRequestContext } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, createDatasetWithRemoteResources, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

// The admin files table displays resources in the API order (newest first), not
// in creation order: always read the expected order from the API.
async function getResourceTitles(request: APIRequestContext, datasetId: string): Promise<Array<string>> {
  const response = await request.get(`${API_BASE}/api/2/datasets/${datasetId}/resources/?page=1&page_size=20`)
  const { data } = await response.json()
  return data.map((resource: { title: string }) => resource.title)
}

test.describe('Dataset files management', () => {
  test('can reorder files and the order is persisted', async ({ page, request }) => {
    const { dataset } = await createDatasetWithRemoteResources(request, `Test files management ${Date.now()}`, ['Ressource A', 'Ressource B', 'Ressource C'])
    createdDatasets.push(dataset.id)

    const initialTitles = await getResourceTitles(request, dataset.id)

    await page.goto(`/admin/datasets/${dataset.id}/files`)
    await page.waitForLoadState('networkidle')

    const rows = page.locator('tbody tr')
    await expect(rows.nth(0)).toContainText(initialTitles[0])
    await expect(rows.nth(1)).toContainText(initialTitles[1])

    await page.getByRole('button', { name: 'Réordonner les fichiers' }).click()
    await rows.nth(0).getByRole('button', { name: 'Déplacer vers le bas' }).click()

    // Wait for the PUT saving the new order before asserting persistence
    const orderSaved = page.waitForResponse(response =>
      response.url().includes(`/api/1/datasets/${dataset.id}/resources/`)
      && response.request().method() === 'PUT',
    )
    await page.getByRole('button', { name: 'Sauvegarder le nouvel ordre' }).click()
    await orderSaved

    // The new order (first two resources swapped) survives a full reload
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(rows.nth(0)).toContainText(initialTitles[1])
    await expect(rows.nth(1)).toContainText(initialTitles[0])
    await expect(rows.nth(2)).toContainText(initialTitles[2])
  })

  test('can edit the metadata of a file', async ({ page, request }) => {
    const uniqueId = Date.now()
    const { dataset } = await createDatasetWithRemoteResources(request, `Test files management ${uniqueId}`, ['Ressource à éditer'])
    createdDatasets.push(dataset.id)

    await page.goto(`/admin/datasets/${dataset.id}/files`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Éditer le fichier' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Métadonnées du fichier' })).toBeVisible()

    await dialog.getByLabel('Titre *', { exact: true }).fill(`Ressource renommée ${uniqueId}`)
    await dialog.getByRole('button', { name: 'Valider' }).click()

    await expect(page.getByText('Fichier mis à jour !')).toBeVisible()
    await expect(page.locator('tbody tr').first()).toContainText(`Ressource renommée ${uniqueId}`)
  })

  test('can delete a file', async ({ page, request }) => {
    const { dataset } = await createDatasetWithRemoteResources(request, `Test files management ${Date.now()}`, ['Ressource conservée', 'Ressource à supprimer'])
    createdDatasets.push(dataset.id)

    await page.goto(`/admin/datasets/${dataset.id}/files`)
    await page.waitForLoadState('networkidle')

    const rowToDelete = page.locator('tbody tr').filter({ hasText: 'Ressource à supprimer' })
    await rowToDelete.getByRole('button', { name: 'Éditer le fichier' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Supprimer', exact: true }).click()

    const confirmDialog = page.getByRole('dialog').filter({ hasText: 'Êtes-vous sûr de vouloir supprimer cette ressource ?' })
    await confirmDialog.getByRole('button', { name: 'Supprimer la ressource' }).click()

    await expect(page.locator('tbody tr').filter({ hasText: 'Ressource à supprimer' })).not.toBeVisible()
    await expect(page.locator('tbody tr').filter({ hasText: 'Ressource conservée' })).toBeVisible()
  })

  test('can replace an uploaded file', async ({ page, request }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(request, `Test files replace ${uniqueId}`, 'Dataset pour tester le remplacement de fichier')
    createdDatasets.push(dataset.id)

    // Create a file resource via the upload API
    await request.post(`${API_BASE}/api/1/datasets/${dataset.id}/upload/`, {
      multipart: {
        file: {
          name: `original-${uniqueId}.csv`,
          mimeType: 'text/csv',
          buffer: Buffer.from('col_a,col_b\n1,2\n'),
        },
      },
    })

    await page.goto(`/admin/datasets/${dataset.id}/files`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Éditer le fichier' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Métadonnées du fichier' })).toBeVisible()

    // Upload the replacement file
    const fileChooserPromise = page.waitForEvent('filechooser')
    await dialog.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: `replacement-${uniqueId}.csv`,
      mimeType: 'text/csv',
      buffer: Buffer.from('col_a,col_b\n3,4\n'),
    })

    await dialog.getByRole('button', { name: 'Valider' }).click()
    await expect(page.getByText('Fichier mis à jour !')).toBeVisible()

    // The resource now points to the replacement file
    const resources = await (await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/resources/`)).json()
    expect(resources.data[0].url).toContain(`replacement-${uniqueId}`)
  })
})
