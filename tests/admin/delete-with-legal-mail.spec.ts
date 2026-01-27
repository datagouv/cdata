import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test.describe('Delete modal with legal mail option', () => {
  test.describe('Dataset deletion', () => {
    test('shows mail options and sends automatic legal notice', async ({ page }) => {
      const uniqueId = Date.now()

      // Create dataset via API
      const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
        data: {
          title: `Test delete auto mail ${uniqueId}`,
          description: 'Description pour test de suppression',
          frequency: 'unknown',
        },
      })
      const dataset = await response.json()

      // Go to admin page
      await page.goto(`/admin/datasets/${dataset.id}/`)
      await expect(page.getByRole('button', { name: 'Supprimer' })).toBeVisible()

      // Open delete modal
      await page.getByRole('button', { name: 'Supprimer' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()

      const dialog = page.getByRole('dialog')

      // Verify mail options are shown for admin
      await expect(dialog.getByText('Notification par email')).toBeVisible()
      await expect(dialog.getByText('Envoyer un mail automatique (voies de recours)')).toBeVisible()
      await expect(dialog.getByText('Envoyer un mail personnalisé')).toBeVisible()

      // Delete button should be disabled until an option is selected
      const deleteButton = dialog.getByRole('button', { name: 'Supprimer le jeu de données' })
      await expect(deleteButton).toBeDisabled()

      // Select automatic mail option
      await dialog.getByText('Envoyer un mail automatique (voies de recours)').click()
      await expect(deleteButton).toBeEnabled()

      // Confirm deletion
      await deleteButton.click()

      // Modal should close and dataset should be marked as deleted
      await expect(page.getByRole('dialog')).not.toBeVisible()
      await expect(page.getByText('Restaurer ce jeu de données')).toBeVisible()
    })

    test('shows mailto link when custom mail option is selected', async ({ page }) => {
      const uniqueId = Date.now()

      // Create dataset via API
      const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
        data: {
          title: `Test delete custom mail ${uniqueId}`,
          description: 'Description pour test de suppression',
          frequency: 'unknown',
        },
      })
      const dataset = await response.json()

      // Go to admin page
      await page.goto(`/admin/datasets/${dataset.id}/`)
      await expect(page.getByRole('button', { name: 'Supprimer' })).toBeVisible()

      // Open delete modal
      await page.getByRole('button', { name: 'Supprimer' }).click()
      await expect(page.getByRole('dialog')).toBeVisible()

      const dialog = page.getByRole('dialog')

      // Select custom mail option
      await dialog.getByText('Envoyer un mail personnalisé').click()

      // Confirm deletion
      await dialog.getByRole('button', { name: 'Supprimer le jeu de données' }).click()

      // Modal should stay open with mailto link
      await expect(dialog.getByText('Suppression effectuée')).toBeVisible()
      await expect(dialog.getByText('Vous pouvez maintenant envoyer un mail personnalisé au propriétaire.')).toBeVisible()
      await expect(dialog.getByRole('link', { name: 'Envoyer le mail personnalisé' })).toBeVisible()

      // Verify mailto link format
      const mailtoLink = dialog.getByRole('link', { name: 'Envoyer le mail personnalisé' })
      await expect(mailtoLink).toHaveAttribute('href', /^mailto:/)

      // Close the modal (use the footer button, not the X button)
      await dialog.getByRole('button', { name: 'Fermer', exact: true }).last().click()
      await expect(page.getByRole('dialog')).not.toBeVisible()
    })
  })
})
