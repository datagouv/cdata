import { test, expect } from '@playwright/test'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test.describe('Discussions as normal user', () => {
  test('can create a discussion and delete it', async ({ page }) => {
    const uniqueId = Date.now()

    // Create a dataset via API
    const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
      data: {
        title: `Test discussions dataset ${uniqueId}`,
        description: 'Dataset pour tester les discussions',
        frequency: 'unknown',
      },
    })
    const dataset = await response.json()

    await page.goto(`/datasets/${dataset.id}/`)
    // Wait for Vue hydration before clicking NuxtLink (fix flaky test on Firefox)
    await page.waitForLoadState('networkidle')

    // Navigate to discussions tab
    await page.getByRole('link', { name: 'Discussions' }).click()
    await expect(page).toHaveURL(/\/discussions$/)

    // Start a new discussion
    await page.getByRole('button', { name: 'Démarrer une nouvelle discussion' }).click()

    // Select identity (Normal User)
    await page.getByTestId('producer-select').click()
    await page.getByRole('option', { name: 'Normal User' }).click()

    // Fill the discussion form
    await page.getByRole('textbox', { name: /Titre/ }).click()
    await page.getByRole('textbox', { name: /Titre/ }).fill('Ma discussion de test')
    await page.getByRole('textbox', { name: /Votre message/ }).click()
    await page.getByRole('textbox', { name: /Votre message/ }).fill('Ceci est le contenu de ma discussion de test.')

    // Submit the discussion
    await page.getByRole('button', { name: 'Envoyer' }).click()

    // Verify discussion was created
    await expect(page.getByText('Ma discussion de test', { exact: true })).toBeVisible()
    await expect(page.getByText('Ceci est le contenu de ma discussion de test.')).toBeVisible()

    // Delete the discussion
    const deleteButton = page.getByRole('button', { name: 'Supprimer' }).first()
    await deleteButton.click()

    // Confirm deletion in modal
    await expect(page.getByRole('dialog')).toBeVisible()
    const dialog = page.getByRole('dialog')

    // Verify mail options are NOT shown for non-admin users
    await expect(dialog.getByText('Notification par email')).not.toBeVisible()

    await dialog.getByRole('button', { name: 'Supprimer la discussion et les commentaires' }).click()

    // Verify discussion was deleted
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Ma discussion de test', { exact: true })).not.toBeVisible()

    // Cleanup: delete the dataset
    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can add a comment to a discussion and delete only the comment', async ({ page }) => {
    const uniqueId = Date.now()

    // Create a dataset via API
    const datasetResponse = await page.request.post(`${API_BASE}/api/1/datasets/`, {
      data: {
        title: `Test comments dataset ${uniqueId}`,
        description: 'Dataset pour tester les commentaires',
        frequency: 'unknown',
      },
    })
    const dataset = await datasetResponse.json()

    // Create a discussion via API
    const discussionResponse = await page.request.post(`${API_BASE}/api/1/discussions/`, {
      data: {
        subject: {
          class: 'Dataset',
          id: dataset.id,
        },
        title: 'Discussion pour tester les commentaires',
        comment: 'Premier message de la discussion.',
      },
    })
    const discussion = await discussionResponse.json()

    await page.goto(`/datasets/${dataset.id}/discussions`)

    // Open the discussion and click reply
    await page.getByText('Discussion pour tester les commentaires').click()
    await page.getByRole('button', { name: 'Répondre' }).first().click()

    // Select identity (Normal User)
    await page.getByTestId('producer-select').click()
    await page.getByRole('option', { name: 'Normal User' }).click()

    // Add a comment/reply
    await page.getByRole('textbox', { name: /Votre message/ }).click()
    await page.getByRole('textbox', { name: /Votre message/ }).fill('Mon commentaire ajouté à la discussion.')
    await page.getByRole('button', { name: 'Répondre', exact: true }).click()

    // Verify comment was added
    await expect(page.getByText('Mon commentaire ajouté à la discussion.')).toBeVisible()

    // Find and click delete button for the comment (not the discussion)
    // The comment delete button should be the second one (first is for the discussion)
    const commentDeleteButton = page.getByRole('button', { name: 'Supprimer' }).nth(1)
    await commentDeleteButton.click()

    // Confirm deletion in modal
    await expect(page.getByRole('dialog')).toBeVisible()
    const dialog = page.getByRole('dialog')

    // Verify mail options are NOT shown for non-admin users
    await expect(dialog.getByText('Notification par email')).not.toBeVisible()

    await dialog.getByRole('button', { name: 'Supprimer le commentaire' }).click()

    // Verify comment was deleted but discussion still exists
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Mon commentaire ajouté à la discussion.')).not.toBeVisible()
    await expect(page.getByText('Discussion pour tester les commentaires')).toBeVisible()
    await expect(page.getByText('Premier message de la discussion.')).toBeVisible()

    // Cleanup
    await page.request.delete(`${API_BASE}/api/1/discussions/${discussion.id}/`)
    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })
})
