import { test, expect } from '@playwright/test'
import * as path from 'path'
import { clickOutside } from '../helpers'

const __dirname = import.meta.dirname

test.describe('Delete modal for reuse', () => {
  // Note: Mail options (auto mail / custom mail) only appear when:
  // 1. User is sysadmin (isMeAdmin() returns true)
  // 2. Recipient email is available (owner.email or org admin emails)
  //
  // In the test environment, the API does not expose owner email in the response
  // (UserReference type doesn't include email). Therefore, mail options won't appear.
  // To test the full mail flow with options, the backend would need to include
  // email for admin requests, or we'd need to fetch owner data separately.

  test('opens delete modal and confirms deletion', async ({ page }) => {
    const uniqueId = Date.now()

    // Create a reuse
    await page.goto('/')
    await page.getByRole('button', { name: 'Publier sur data.gouv.fr' }).click()
    await page.getByRole('link', { name: 'Une réutilisation' }).click()
    await page.waitForURL('**/admin/reuses/new**')

    // Select producer
    await page.getByTestId('producer-select').click()
    await page.getByRole('option', { name: 'Admin User' }).click()

    // Fill the form
    await page.getByRole('textbox', { name: 'Nom de la réutilisation' }).fill(`Test suppression ${uniqueId}`)
    await page.getByRole('textbox', { name: 'Lien' }).fill(`https://example.com/test-delete-${uniqueId}`)

    // Select type
    await page.getByTestId('searchable-select-type').click()
    await page.getByRole('option', { name: 'Application' }).click()
    await clickOutside(page)

    // Select thématique
    await page.getByTestId('searchable-select-thmatique').click()
    await page.getByRole('option', { name: 'Culture et loisirs' }).click()
    await clickOutside(page)

    // Fill description
    await page.getByTestId('markdown-editor').click()
    await page.getByTestId('markdown-editor').fill('Une description de ma réutilisation qui utilise des données ouvertes. Cette réutilisation permet de visualiser et d\'analyser des données publiques de manière innovante et accessible à tous les citoyens.')
    await page.getByTestId('markdown-editor').press('Tab')

    // Upload image
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))
    await clickOutside(page)
    await page.waitForTimeout(500)

    // Go to step 2
    await page.getByRole('button', { name: 'Suivant' }).click()
    await expect(page.getByText('Étape 2 sur 3')).toBeVisible()

    // Go to step 3
    await page.getByRole('button', { name: 'Suivant' }).click()
    await expect(page.getByText('Étape 3 sur 3')).toBeVisible()

    // Publish the reuse
    await page.getByRole('button', { name: 'Publier la réutilisation' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(`Test suppression ${uniqueId}`)

    // Go to edit page
    await page.getByRole('link', { name: 'Modifier' }).click()
    await expect(page.getByRole('button', { name: 'Supprimer' })).toBeVisible()

    // Open delete modal
    await page.getByRole('button', { name: 'Supprimer' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Verify modal content
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Êtes-vous sûr de vouloir supprimer cette réutilisation ?' })).toBeVisible()
    await expect(dialog.getByText('Cette action ne peut pas être annulée.', { exact: true })).toBeVisible()

    // Delete button should be enabled (no mail options when email is not available)
    const deleteButton = dialog.getByRole('button', { name: 'Supprimer cette réutilisation' })
    await expect(deleteButton).toBeEnabled()

    // Confirm deletion
    await deleteButton.click()

    // Modal should close and reuse should be marked as deleted
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Restaurer la réutilisation')).toBeVisible()
  })
})
