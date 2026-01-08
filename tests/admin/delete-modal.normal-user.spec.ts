import { test, expect } from '@playwright/test'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test.describe('Delete modal as normal user', () => {
  test('does not show mail options for non-admin user', async ({ page }) => {
    const uniqueId = Date.now()

    // Create dataset via API (authenticated as normal user via setup)
    const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
      data: {
        title: `Test delete normal user ${uniqueId}`,
        description: 'Description pour test de suppression',
        frequency: 'unknown',
      },
    })
    const dataset = await response.json()

    // Go to admin page for the dataset
    await page.goto(`/admin/datasets/${dataset.id}/`)
    await expect(page.getByRole('button', { name: 'Supprimer' })).toBeVisible()

    // Open delete modal
    await page.getByRole('button', { name: 'Supprimer' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const dialog = page.getByRole('dialog')

    // Verify mail options are NOT shown for non-admin users
    await expect(dialog.getByText('Notification par email')).not.toBeVisible()

    // Delete button should be enabled directly (no option to select)
    const deleteButton = dialog.getByRole('button', { name: 'Supprimer le jeu de données' })
    await expect(deleteButton).toBeEnabled()

    // Confirm deletion
    await deleteButton.click()

    // Modal should close and dataset should be marked as deleted
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Restaurer ce jeu de données')).toBeVisible()
  })
})
