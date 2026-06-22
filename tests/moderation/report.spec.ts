import type { APIRequestContext } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

async function reportDataset(request: APIRequestContext, datasetId: string, message: string) {
  const reasonsResponse = await request.get(`${API_BASE}/api/1/reports/reasons/`)
  const reasons = await reasonsResponse.json()
  await request.post(`${API_BASE}/api/1/reports/`, {
    data: {
      subject: { class: 'Dataset', id: datasetId },
      reason: reasons[0].value,
      message,
    },
  })
}

test.describe('Report and moderation', () => {
  test('can report a dataset and dismiss the report in moderation', async ({ page, request }) => {
    const title = `Test report dismiss ${Date.now()}`
    const dataset = await createDataset(request, title, 'Dataset pour tester le signalement')
    createdDatasets.push(dataset.id)

    // Report from the public page
    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Signalement' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Signaler ce contenu' })).toBeVisible()

    await dialog.getByLabel('Raison du signalement').selectOption({ index: 1 })
    await dialog.getByLabel('Votre message').fill('Signalement de test E2E')
    await dialog.getByRole('button', { name: 'Signalement' }).click()

    await expect(dialog.getByRole('heading', { name: 'Merci d\'avoir signalé ce contenu' })).toBeVisible()
    // Both the X button and the footer button are named "Fermer": use the footer one
    await dialog.getByRole('button', { name: 'Fermer', exact: true }).last().click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Find the report in the moderation page and dismiss it
    await page.goto('/admin/site/moderation?type=Dataset')
    await page.waitForLoadState('networkidle')

    const row = page.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()
    await expect(row.getByText('Signalement de test E2E')).toBeVisible()

    await row.getByRole('button', { name: 'Rejeter le signalement' }).click()

    // The default filter only shows pending reports: the dismissed one disappears
    await expect(row).not.toBeVisible()
  })

  test('can hide a reported object (switch to private)', async ({ page, request }) => {
    const title = `Test report hide ${Date.now()}`
    const dataset = await createDataset(request, title, 'Dataset pour tester le masquage via modération')
    createdDatasets.push(dataset.id)

    // Report via API (the report UI itself is covered by the dismiss test)
    await reportDataset(request, dataset.id, 'Signalement de test E2E (masquage)')

    await page.goto('/admin/site/moderation?type=Dataset')
    await page.waitForLoadState('networkidle')

    const row = page.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()

    const hideButton = row.getByRole('button', { name: 'Cacher l\'objet' })
    await expect(hideButton).toBeEnabled()
    await hideButton.click()

    // Once hidden the object is private and the button is disabled
    await expect(hideButton).toBeDisabled()
    const updated = await (await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.private).toBe(true)
  })

  test('can delete a reported object from moderation', async ({ page, request }) => {
    const title = `Test report delete ${Date.now()}`
    const dataset = await createDataset(request, title, 'Dataset pour tester la suppression via modération')
    createdDatasets.push(dataset.id)

    await reportDataset(request, dataset.id, 'Signalement de test E2E (suppression)')

    await page.goto('/admin/site/moderation?type=Dataset')
    await page.waitForLoadState('networkidle')

    const row = page.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: 'Supprimer l\'objet' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Êtes-vous sûr de vouloir supprimer cet objet ?' })).toBeVisible()

    // As site admin, a mail option must be chosen before deleting
    await dialog.getByText('Envoyer un mail automatique (voies de recours)').click()
    await dialog.getByRole('button', { name: 'Supprimer', exact: true }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    const updated = await (await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.deleted).not.toBeNull()
  })
})
