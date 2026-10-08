import { test, expect } from '../base'
import { createOrganization, deleteOrganizations } from '../helpers'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test('an editor opens the members page without being refused the membership requests', async ({ page, browser }) => {
  // Creating the organization and inviting need an organization admin, which the normal user is not.
  const adminContext = await browser.newContext({ storageState: 'playwright/.auth/user.json' })
  const org = await createOrganization(adminContext.request, `Members editor test ${Date.now()}`)

  try {
    const inviteResponse = await adminContext.request.post(`${API_BASE}/api/1/organizations/${org.id}/member/`, {
      data: { email: 'normal@example.com', role: 'editor' },
    })
    const invitation = await inviteResponse.json()
    const acceptResponse = await page.request.post(`${API_BASE}/api/1/me/org_invitations/${invitation.id}/accept/`, {})
    expect(acceptResponse.ok()).toBe(true)

    const refused: Array<string> = []
    page.on('response', (response) => {
      if (response.status() === 403) refused.push(response.url())
    })

    // Reached from the menu, the page loads its data from the browser, where a request
    // the API refuses to an editor can be seen (it would only happen on the server otherwise).
    await page.goto(`/admin/organizations/${org.id}/datasets`)
    await page.locator(`a[href="/admin/organizations/${org.id}/members"]`).click()

    await expect(page.locator('tr').filter({ hasText: 'Normal User' })).toBeVisible()
    expect(refused).toEqual([])
  }
  finally {
    await deleteOrganizations(adminContext.request, [org.id])
    await adminContext.close()
  }
})
