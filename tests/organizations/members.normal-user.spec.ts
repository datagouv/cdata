import { test, expect } from '../base'
import { createOrganization, deleteOrganizations, joinOrganization, withAccount } from '../helpers'

test('an editor opens the members page without being refused the membership requests', async ({ page, browser }) => {
  // Creating the organization and inviting need an organization admin, which the normal user is not.
  await withAccount(browser, 'playwright/.auth/user.json', async (admin) => {
    const org = await createOrganization(admin, `Members editor test ${Date.now()}`)

    try {
      await joinOrganization(admin, page.request, org.id, 'editor')

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
      await deleteOrganizations(admin, [org.id])
    }
  })
})
