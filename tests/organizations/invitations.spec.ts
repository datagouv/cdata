import { test, expect } from '@playwright/test'
import { clickOutside } from '../helpers'

test.describe('Organization member invitations', () => {
  test('can view members page with invite button', async ({ page }) => {
    // Navigate to an organization's members page (admin view)
    await page.goto('/admin/organizations/6461fa1f4e1de2ee027048b7/members')

    // Verify the page loaded correctly
    await expect(page.getByRole('heading', { name: 'Membres', level: 1 })).toBeVisible()

    // Verify the invite button is visible
    await expect(page.getByRole('button', { name: 'Inviter un membre' })).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/members-page.png', fullPage: true })
  })

  test('can open invite member modal', async ({ page }) => {
    await page.goto('/admin/organizations/6461fa1f4e1de2ee027048b7/members')

    // Click on the invite button
    await page.getByRole('button', { name: 'Inviter un membre' }).click()

    // Verify the modal opened
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

    await page.screenshot({ path: 'tests/screenshots/invite-modal.png', fullPage: true })

    // Verify form fields are present
    await expect(page.getByText('Utilisateur', { exact: true })).toBeVisible()
    await expect(page.getByPlaceholder('Rechercher un utilisateur')).toBeVisible()
    await expect(page.getByText('Email', { exact: true })).toBeVisible()
    await expect(page.getByText('Rôle', { exact: true })).toBeVisible()
    await expect(page.getByText('Message (optionnel)', { exact: true })).toBeVisible()

    // Verify buttons
    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Envoyer l\'invitation' })).toBeVisible()
  })

  test('can invite member by email', async ({ page }) => {
    // Use unique email to avoid conflicts
    const uniqueEmail = `invite-${Date.now()}@example.com`

    await page.goto('/admin/organizations/6461fa1f4e1de2ee027048b7/members')

    // Open the invite modal
    await page.getByRole('button', { name: 'Inviter un membre' }).click()
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

    // Fill in email
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill(uniqueEmail)

    // Select role (native <select>)
    const roleSelect = page.locator('select')
    await roleSelect.selectOption('editor')

    // Click outside to ensure Vue updates
    await clickOutside(page)

    // Add optional message
    await page.locator('input').last().fill('Bienvenue dans notre organisation!')

    await page.screenshot({ path: 'tests/screenshots/invite-form-filled.png', fullPage: true })

    // Submit the invitation
    await page.getByRole('button', { name: 'Envoyer l\'invitation' }).click()

    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).not.toBeVisible({ timeout: 10000 })

    await page.screenshot({ path: 'tests/screenshots/invite-sent.png', fullPage: true })

    // The invitation should now appear in the pending invitations section
    await expect(page.getByText(uniqueEmail)).toBeVisible()
  })

  test('can cancel a sent invitation', async ({ page }) => {
    // Use unique email to avoid conflicts with previous test runs
    const uniqueEmail = `cancel-${Date.now()}@example.com`

    await page.goto('/admin/organizations/6461fa1f4e1de2ee027048b7/members')

    // First, create an invitation to cancel
    await page.getByRole('button', { name: 'Inviter un membre' }).click()
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

    // Wait for the roles to load and select to be available
    const roleSelect = page.locator('select')
    await expect(roleSelect).toBeVisible()

    // Fill in email
    await page.locator('input[type="email"]').fill(uniqueEmail)

    // Select role
    await roleSelect.selectOption('editor')

    // Click outside to trigger blur/change events
    await clickOutside(page)
    await page.waitForTimeout(200)

    // Submit
    const submitButton = page.getByRole('button', { name: 'Envoyer l\'invitation' })
    await expect(submitButton).toBeEnabled({ timeout: 5000 })
    await submitButton.click()

    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).not.toBeVisible({ timeout: 10000 })

    // Wait for the invitation to appear
    await expect(page.getByText(uniqueEmail)).toBeVisible({ timeout: 10000 })

    await page.screenshot({ path: 'tests/screenshots/invite-created.png', fullPage: true })

    // Cancel the invitation - find the card containing this email and click its cancel button
    const invitationRow = page.locator('.relative').filter({ hasText: uniqueEmail })
    await invitationRow.getByRole('button', { name: 'Annuler l\'invitation' }).click()

    // Wait for refresh
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/invite-cancelled.png', fullPage: true })

    // Verify the invitation is gone
    await expect(page.getByText(uniqueEmail)).not.toBeVisible()
  })

  test('user search works in invite modal', async ({ page }) => {
    await page.goto('/admin/organizations/6461fa1f4e1de2ee027048b7/members')

    // Open the invite modal
    await page.getByRole('button', { name: 'Inviter un membre' }).click()
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

    // Click on the searchable select using its testid (button that wraps the input)
    await page.getByTestId('searchable-select-utilisateur').click()

    // Fill the search input
    await page.getByPlaceholder('Rechercher un utilisateur').fill('Admin')

    // Wait for search results to appear
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/invite-user-search.png', fullPage: true })

    // Verify search results appear (option list)
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5000 })
  })
})
