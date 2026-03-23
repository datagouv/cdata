import { test, expect } from '@playwright/test'
import { clickOutside } from '../helpers'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'
const ORG_ID = '6461fa1f4e1de2ee027048b7'
const MEMBERS_URL = `/admin/organizations/${ORG_ID}/members`

test.describe('Partial editor', () => {
  test.describe.configure({ mode: 'serial' })

  test('can invite a partial editor with dataset selection', async ({ page }) => {
    const uniqueId = Date.now()
    const uniqueEmail = `partial-${uniqueId}@example.com`

    const datasetResponse = await page.request.post(`${API_BASE}/api/1/datasets/`, {
      data: {
        title: `Test partial editor ${uniqueId}`,
        description: 'Dataset for partial editor test',
        frequency: 'unknown',
        organization: ORG_ID,
      },
    })
    const dataset = await datasetResponse.json()

    try {
      await page.goto(MEMBERS_URL)
      await page.waitForLoadState('networkidle')

      await page.getByRole('button', { name: 'Inviter un membre' }).click()
      await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

      await page.locator('input[type="email"]').fill(uniqueEmail)

      // The dataset selector should NOT be visible before selecting partial_editor
      await expect(page.getByText('Choisir les jeux de données éditables par ce membre')).not.toBeVisible()

      await page.locator('select').selectOption('partial_editor')
      await clickOutside(page)

      // The dataset selector should now be visible
      await expect(page.getByText('Choisir les jeux de données éditables par ce membre')).toBeVisible()

      // Wait for the datasets table to load and check the created dataset
      const datasetRow = page.locator('tr').filter({ hasText: dataset.title })
      await expect(datasetRow).toBeVisible({ timeout: 10000 })
      await datasetRow.locator('input[type="checkbox"]').click()

      await expect(page.getByText('1 jeu de données sélectionné')).toBeVisible()

      await page.getByRole('button', { name: 'Envoyer l\'invitation' }).click()
      await expect(page.getByRole('heading', { name: 'Inviter un membre' })).not.toBeVisible({ timeout: 10000 })

      await expect(page.getByText(uniqueEmail)).toBeVisible()

      // Cleanup: cancel the invitation
      const invitationRow = page.locator('.relative').filter({ hasText: uniqueEmail })
      await invitationRow.getByRole('button', { name: 'Annuler l\'invitation' }).click()
      await expect(page.getByText(uniqueEmail)).not.toBeVisible({ timeout: 10000 })
    }
    finally {
      await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
    }
  })

  test('can edit a partial editor member and see dataset selector', async ({ page, browser }) => {
    // Invite normal@example.com as partial_editor via API
    const inviteResponse = await page.request.post(`${API_BASE}/api/1/organizations/${ORG_ID}/member/`, {
      data: {
        email: 'normal@example.com',
        role: 'partial_editor',
      },
    })
    const invitation = await inviteResponse.json()

    // Accept the invitation as the normal user
    const normalUserContext = await browser.newContext({ storageState: 'playwright/.auth/normal-user.json' })
    const normalUserPage = await normalUserContext.newPage()
    await normalUserPage.request.post(`${API_BASE}/api/1/me/org_invitations/${invitation.id}/accept/`, {})
    await normalUserContext.close()

    try {
      await page.goto(MEMBERS_URL)
      await page.waitForLoadState('networkidle')

      // Find the member row for "Normal User" and click edit
      const memberRow = page.locator('tr').filter({ hasText: 'Normal User' })
      await expect(memberRow).toBeVisible({ timeout: 10000 })
      await memberRow.getByTitle('Modifier').click()

      await expect(page.getByRole('heading', { name: 'Modifier le membre' })).toBeVisible()

      // The dataset selector should be visible for a partial editor
      await expect(page.getByText('Choisir les jeux de données éditables par ce membre')).toBeVisible({ timeout: 10000 })
    }
    finally {
      // Cleanup: remove the member
      const orgResponse = await page.request.get(`${API_BASE}/api/1/organizations/${ORG_ID}/`)
      const org = await orgResponse.json()
      const normalUser = org.members.find((m: { user: { email: string } }) => m.user.email === 'normal@example.com')
      if (normalUser) {
        await page.request.delete(`${API_BASE}/api/1/organizations/${ORG_ID}/member/${normalUser.user.id}`)
      }
    }
  })
})
