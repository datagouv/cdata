import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

async function createDatasetWithRemoteResources(page: import('@playwright/test').Page, uniqueId: number, titles: Array<string>) {
  const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
    data: {
      title: `Test files management ${uniqueId}`,
      description: 'Dataset pour tester la gestion des fichiers',
      frequency: 'unknown',
    },
  })
  const dataset = await response.json()

  for (const title of titles) {
    await page.request.post(`${API_BASE}/api/1/datasets/${dataset.id}/resources/`, {
      data: {
        title,
        type: 'main',
        filetype: 'remote',
        url: `https://example.com/${uniqueId}/${encodeURIComponent(title)}.csv`,
        format: 'csv',
      },
    })
  }

  return dataset
}

test.describe('Dataset files management', () => {
  test('can reorder files and the order is persisted', async ({ page }) => {
    const uniqueId = Date.now()
    const dataset = await createDatasetWithRemoteResources(page, uniqueId, ['Ressource A', 'Ressource B', 'Ressource C'])

    await page.goto(`/admin/datasets/${dataset.id}/files`)
    await page.waitForLoadState('networkidle')

    const rows = page.locator('tbody tr')
    await expect(rows.nth(0)).toContainText('Ressource A')
    await expect(rows.nth(1)).toContainText('Ressource B')

    await page.getByRole('button', { name: 'Réordonner les fichiers' }).click()
    await rows.nth(0).getByRole('button', { name: 'Déplacer vers le bas' }).click()
    await page.getByRole('button', { name: 'Sauvegarder le nouvel ordre' }).click()

    await expect(rows.nth(0)).toContainText('Ressource B')
    await expect(rows.nth(1)).toContainText('Ressource A')

    // The new order survives a full reload
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(rows.nth(0)).toContainText('Ressource B')
    await expect(rows.nth(1)).toContainText('Ressource A')
    await expect(rows.nth(2)).toContainText('Ressource C')

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can edit the metadata of a file', async ({ page }) => {
    const uniqueId = Date.now()
    const dataset = await createDatasetWithRemoteResources(page, uniqueId, ['Ressource à éditer'])

    await page.goto(`/admin/datasets/${dataset.id}/files`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Éditer le fichier' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Métadonnées du fichier' })).toBeVisible()

    await dialog.getByLabel('Titre', { exact: true }).fill(`Ressource renommée ${uniqueId}`)
    await dialog.getByRole('button', { name: 'Valider' }).click()

    await expect(page.getByText('Fichier mis à jour !')).toBeVisible()
    await expect(page.locator('tbody tr').first()).toContainText(`Ressource renommée ${uniqueId}`)

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can delete a file', async ({ page }) => {
    const uniqueId = Date.now()
    const dataset = await createDatasetWithRemoteResources(page, uniqueId, ['Ressource conservée', 'Ressource à supprimer'])

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

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can replace an uploaded file', async ({ page }) => {
    const uniqueId = Date.now()

    const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
      data: {
        title: `Test files replace ${uniqueId}`,
        description: 'Dataset pour tester le remplacement de fichier',
        frequency: 'unknown',
      },
    })
    const dataset = await response.json()

    // Create a file resource via the upload API
    await page.request.post(`${API_BASE}/api/1/datasets/${dataset.id}/upload/`, {
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
    const tempDir = mkdtempSync(path.join(tmpdir(), 'e2e-replace-'))
    const replacementPath = path.join(tempDir, `replacement-${uniqueId}.csv`)
    writeFileSync(replacementPath, 'col_a,col_b\n3,4\n')

    const fileChooserPromise = page.waitForEvent('filechooser')
    await dialog.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(replacementPath)

    await dialog.getByRole('button', { name: 'Valider' }).click()
    await expect(page.getByText('Fichier mis à jour !')).toBeVisible()

    // The resource now points to the replacement file
    const resources = await (await page.request.get(`${API_BASE}/api/2/datasets/${dataset.id}/resources/`)).json()
    expect(resources.data[0].url).toContain(`replacement-${uniqueId}`)

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })
})
