import type { Page, Browser } from '@playwright/test'
import { test, expect } from '../base'
import { createOrganization, deleteOrganizations } from '../helpers'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

// A dedicated organization per test, so the browser projects running in parallel
// don't fight over the same pending request.
const organizationWithPendingRequest = async (page: Page, browser: Browser, name: string) => {
  const org = await createOrganization(page.request, `${name} ${Date.now()}`)

  const normalUserContext = await browser.newContext({ storageState: 'playwright/.auth/normal-user.json' })
  const normalUserPage = await normalUserContext.newPage()
  const response = await normalUserPage.request.post(`${API_BASE}/api/1/organizations/${org.id}/membership/`, {
    data: { comment: 'Please let me in' },
  })
  expect(response.ok()).toBe(true)
  await normalUserContext.close()

  return org
}

test.describe('Membership requests', () => {
  test('accepting a request twice in a row only accepts it once', async ({ page, browser }) => {
    const org = await organizationWithPendingRequest(page, browser, 'Double accept test')

    let acceptCalls = 0
    await page.route(/\/membership\/[^/]+\/accept/, async (route) => {
      acceptCalls++
      await route.continue()
    })

    try {
      await page.goto(`/admin/organizations/${org.id}/members`)

      const acceptButton = page.getByRole('button', { name: 'Accepter la demande' })
      await expect(acceptButton).toBeVisible({ timeout: 10000 })

      // A second accept while the first one is in flight makes the API answer 409
      // ("already a member"), which surfaces as an unexpected API error toast.
      await acceptButton.dblclick()

      await expect(page.locator('tr').filter({ hasText: 'Normal User' })).toBeVisible({ timeout: 10000 })
      await expect(page.getByText('L\'API a retourné une erreur inattendue')).not.toBeVisible()
      expect(acceptCalls).toBe(1)
    }
    finally {
      await deleteOrganizations(page.request, [org.id])
    }
  })

  test('cannot invite someone who already applied to the organization', async ({ page, browser }) => {
    const org = await organizationWithPendingRequest(page, browser, 'Invite applicant test')

    try {
      await page.goto(`/admin/organizations/${org.id}/members`)
      await expect(page.getByRole('button', { name: 'Accepter la demande' })).toBeVisible({ timeout: 10000 })

      await page.getByRole('button', { name: 'Inviter un membre' }).click()
      await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

      // A role is needed too, otherwise the submit button stays disabled on its own
      // and would prove nothing about the pending request.
      await page.locator('select').selectOption('editor')

      await page.getByTestId('searchable-select-utilisateur').click()
      await page.getByPlaceholder('Rechercher un utilisateur').fill('Normal')
      await page.getByRole('option', { name: 'Normal User' }).click()

      await expect(page.getByText('Cet utilisateur a déjà demandé à rejoindre l\'organisation')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Envoyer l\'invitation' })).toBeDisabled()
    }
    finally {
      await deleteOrganizations(page.request, [org.id])
    }
  })
})
