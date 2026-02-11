import { test, expect } from '@playwright/test'
import { clickOutside } from '../helpers'

test.describe('Organization member invitations', () => {
  test('can invite member by email', async ({ page }) => {
    await page.goto('/admin/organizations/6461fa1f4e1de2ee027048b7/members')

    await page.getByRole('button', { name: 'Inviter un membre' }).click()
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

    await page.locator('input[type="email"]').fill('normal@example.com')
    await page.locator('select').selectOption('editor')
    await clickOutside(page)

    await page.getByRole('button', { name: 'Envoyer l\'invitation' }).click()
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).not.toBeVisible({ timeout: 10000 })

    await expect(page.getByText('normal@example.com')).toBeVisible()

    // Clean up: cancel the invitation so other browsers can re-run this test
    const invitationRow = page.locator('.relative').filter({ hasText: 'normal@example.com' })
    await invitationRow.getByRole('button', { name: 'Annuler l\'invitation' }).click()
    await expect(page.getByText('normal@example.com')).not.toBeVisible({ timeout: 10000 })
  })

  test('can cancel a sent invitation', async ({ page }) => {
    const uniqueEmail = `cancel-${Date.now()}@example.com`

    await page.goto('/admin/organizations/6461fa1f4e1de2ee027048b7/members')

    await page.getByRole('button', { name: 'Inviter un membre' }).click()
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

    await page.locator('input[type="email"]').fill(uniqueEmail)
    await page.locator('select').selectOption('editor')
    await clickOutside(page)

    await page.getByRole('button', { name: 'Envoyer l\'invitation' }).click()
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).not.toBeVisible({ timeout: 10000 })

    await expect(page.getByText(uniqueEmail)).toBeVisible({ timeout: 10000 })

    const invitationRow = page.locator('.relative').filter({ hasText: uniqueEmail })
    await invitationRow.getByRole('button', { name: 'Annuler l\'invitation' }).click()

    await expect(page.getByText(uniqueEmail)).not.toBeVisible({ timeout: 10000 })
  })

  test('can search and select a user in invite modal', async ({ page }) => {
    await page.goto('/admin/organizations/6461fa1f4e1de2ee027048b7/members')

    await page.getByRole('button', { name: 'Inviter un membre' }).click()
    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

    await page.getByTestId('searchable-select-utilisateur').click()
    await page.getByPlaceholder('Rechercher un utilisateur').fill('Admin')

    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5000 })
  })
})
