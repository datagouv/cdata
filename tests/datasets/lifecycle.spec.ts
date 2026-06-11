import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

async function createDataset(page: import('@playwright/test').Page, title: string) {
  const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
    data: {
      title,
      description: 'Dataset pour tester le cycle de vie',
      frequency: 'unknown',
    },
  })
  return await response.json()
}

test.describe('Dataset lifecycle', () => {
  test('can switch a dataset to draft and back to public', async ({ page }) => {
    const dataset = await createDataset(page, `Test lifecycle private ${Date.now()}`)

    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    // Switch to draft
    await page.getByRole('button', { name: 'Passer en brouillon' }).click()
    await expect(page.getByText('Jeu de données passé en brouillon !')).toBeVisible()

    // The public page shows the draft badge
    await page.goto(`/datasets/${dataset.id}/`)
    await expect(page.getByText('Brouillon', { exact: true })).toBeVisible()

    // Publish again
    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Publier le jeu de données' }).click()
    await expect(page.getByText('Jeu de données publié !')).toBeVisible()

    await page.goto(`/datasets/${dataset.id}/`)
    await expect(page.getByText('Brouillon', { exact: true })).not.toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can archive and unarchive a dataset', async ({ page }) => {
    const dataset = await createDataset(page, `Test lifecycle archive ${Date.now()}`)

    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Archiver', exact: true }).click()
    await expect(page.getByText('Jeu de données archivé !')).toBeVisible()

    // The public page shows the archived badge
    await page.goto(`/datasets/${dataset.id}/`)
    await expect(page.getByText('Archivé', { exact: true })).toBeVisible()

    // Unarchive
    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Désarchiver', exact: true }).click()
    await expect(page.getByText('Jeu de données désarchivé !')).toBeVisible()

    await page.goto(`/datasets/${dataset.id}/`)
    await expect(page.getByText('Archivé', { exact: true })).not.toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can delete a dataset and restore it before the purge', async ({ page }) => {
    const dataset = await createDataset(page, `Test lifecycle restore ${Date.now()}`)

    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    // Delete (as site admin, a mail option must be chosen)
    await page.getByRole('button', { name: 'Supprimer', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Êtes-vous sûr de vouloir supprimer ce jeu de données ?' })).toBeVisible()
    await dialog.getByText('Envoyer un mail automatique (voies de recours)').click()
    await dialog.getByRole('button', { name: 'Supprimer le jeu de données' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // The restore banner appears, the public page shows the deleted badge
    await expect(page.getByText('Restaurer ce jeu de données')).toBeVisible()
    await page.goto(`/datasets/${dataset.id}/`)
    await expect(page.getByText('Supprimé', { exact: true })).toBeVisible()

    // Restore
    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Restaurer' }).click()
    await expect(page.getByText('Jeu de données restauré !')).toBeVisible()
    await expect(page.getByText('Restaurer ce jeu de données')).not.toBeVisible()

    await page.goto(`/datasets/${dataset.id}/`)
    await expect(page.getByText('Supprimé', { exact: true })).not.toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })
})
