import { test, expect } from '../base'
import { createDataset, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

// The public dataset page fires a client-side fetch to the metrics API: wait for
// networkidle before navigating away, otherwise the aborted fetch is reported as
// an uncaught error and fails the assertNoConsoleErrors fixture.
test.describe('Dataset lifecycle', () => {
  test('can switch a dataset to draft and back to public', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test lifecycle private ${Date.now()}`, 'Dataset pour tester le cycle de vie')
    createdDatasets.push(dataset.id)

    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    // Switch to draft
    await page.getByRole('button', { name: 'Passer en brouillon' }).click()
    await expect(page.getByText('Jeu de données passé en brouillon !')).toBeVisible()

    // The public page shows the draft badge
    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Brouillon', { exact: true })).toBeVisible()

    // Publish again
    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Publier le jeu de données' }).click()
    await expect(page.getByText('Jeu de données publié !')).toBeVisible()

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Brouillon', { exact: true })).not.toBeVisible()
  })

  test('can archive and unarchive a dataset', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test lifecycle archive ${Date.now()}`, 'Dataset pour tester le cycle de vie')
    createdDatasets.push(dataset.id)

    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Archiver', exact: true }).click()
    await expect(page.getByText('Jeu de données archivé !')).toBeVisible()

    // The public page shows the archived badge and is excluded from indexing
    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Archivé', { exact: true })).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

    // Unarchive
    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Désarchiver', exact: true }).click()
    await expect(page.getByText('Jeu de données désarchivé !')).toBeVisible()

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Archivé', { exact: true })).not.toBeVisible()
  })

  test('can delete a dataset and restore it before the purge', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test lifecycle restore ${Date.now()}`, 'Dataset pour tester le cycle de vie')
    createdDatasets.push(dataset.id)

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
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Supprimé', { exact: true })).toBeVisible()

    // Restore
    await page.goto(`/admin/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Restaurer' }).click()
    await expect(page.getByText('Jeu de données restauré !')).toBeVisible()
    await expect(page.getByText('Restaurer ce jeu de données')).not.toBeVisible()

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Supprimé', { exact: true })).not.toBeVisible()
  })
})
