import { test, expect } from '../base'
import { API_BASE, createDataset, createRemoteResource, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

test.describe('Géoplateforme sync', () => {
  test('the geopf tab appears once an eligible file is uploaded, without a reload', async ({ page, request }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(request, `Test geopf eligibility ${uniqueId}`, 'Dataset pour tester la synchronisation cartes.gouv.fr')
    createdDatasets.push(dataset.id)

    // Seed a non-eligible file
    const uploadResponse = await request.post(`${API_BASE}/api/1/datasets/${dataset.id}/upload/`, {
      multipart: {
        file: {
          name: `original-${uniqueId}.csv`,
          mimeType: 'text/csv',
          buffer: Buffer.from('col_a,col_b\n1,2\n'),
        },
      },
    })
    if (!uploadResponse.ok()) {
      throw new Error(`Failed to seed the original file: ${uploadResponse.status()} ${(await uploadResponse.text()).slice(0, 300)}`)
    }
    const { id: resourceId } = await uploadResponse.json()

    await page.goto(`/admin/datasets/${dataset.id}/files`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('link', { name: 'Synchronisation cartes.gouv.fr' })).not.toBeVisible()

    // Replace the file with a .gpkg: the Files tab's own mutation should tell
    // the admin layout to recheck eligibility, surfacing the tab with no reload.
    await page.getByRole('button', { name: 'Éditer le fichier' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Métadonnées du fichier' })).toBeVisible()

    const fileChooserPromise = page.waitForEvent('filechooser')
    await dialog.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: `replacement-${uniqueId}.gpkg`,
      mimeType: 'application/geopackage+sqlite3',
      buffer: Buffer.from('not a real geopackage, only the extension matters here'),
    })
    await dialog.getByRole('button', { name: 'Valider' }).click()
    await expect(page.getByText('Fichier mis à jour !')).toBeVisible()

    // Disambiguates a future failure here: was the new format actually persisted
    // (a backend/upload concern), or is the eligibility-refresh wiring broken?
    const updatedResource = await (await request.get(`${API_BASE}/api/1/datasets/${dataset.id}/resources/${resourceId}/`)).json()
    expect(updatedResource.format).toBe('gpkg')

    await expect(page.getByRole('link', { name: 'Synchronisation cartes.gouv.fr' })).toBeVisible()
  })

  test('shows the disconnected banner and blocks push when not linked to Géoplateforme', async ({ page, request }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(request, `Test geopf disconnected ${uniqueId}`, 'Dataset pour tester l\'état déconnecté')
    createdDatasets.push(dataset.id)
    await createRemoteResource(request, dataset.id, `communes-${uniqueId}`, { format: 'gpkg' })

    await page.goto(`/admin/datasets/${dataset.id}/geopf`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Non connecté à cartes.gouv.fr')).toBeVisible()
    const connectLink = page.getByRole('link', { name: 'Se connecter' })
    await expect(connectLink).toBeVisible()
    await expect(connectLink).toHaveAttribute('href', new RegExp(`/api/1/geopf/login/\\?dataset_id=${dataset.id}`))

    await expect(page.getByRole('button', { name: 'Envoyer vers cartes.gouv.fr' })).toBeDisabled()
  })

  test('a resource synced with geopf cannot be edited from the Files tab', async ({ page, request }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(request, `Test geopf synced resource ${uniqueId}`, 'Dataset pour tester l\'édition')
    createdDatasets.push(dataset.id)
    await createRemoteResource(request, dataset.id, `geopf-done-${uniqueId}`, { extras: { 'geopf:push:status': 'done' } })
    await createRemoteResource(request, dataset.id, `geopf-untouched-${uniqueId}`)

    await page.goto(`/admin/datasets/${dataset.id}/files`)
    await page.waitForLoadState('networkidle')

    const syncedRow = page.locator('tbody tr').filter({ hasText: `geopf-done-${uniqueId}` })
    await expect(syncedRow.getByRole('button', { name: 'Vous ne pouvez pas modifier cette ressource car elle est synchronisée avec cartes.gouv.fr' })).toBeDisabled()

    const untouchedRow = page.locator('tbody tr').filter({ hasText: `geopf-untouched-${uniqueId}` })
    await expect(untouchedRow.getByRole('button', { name: 'Éditer le fichier' })).toBeEnabled()
  })
})
