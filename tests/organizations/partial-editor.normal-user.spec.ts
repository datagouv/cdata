import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'
const ORG_ID = '6461fa1f4e1de2ee027048b7'

test.describe('Partial editor without assignment', () => {
  test('sees a read-only dataset page', async ({ page, browser }) => {
    const uniqueId = Date.now()

    // The invitation and the dataset both need an organization admin, which the normal user is not.
    const adminContext = await browser.newContext({ storageState: 'playwright/.auth/user.json' })

    const datasetResponse = await adminContext.request.post(`${API_BASE}/api/1/datasets/`, {
      data: {
        title: `Test read-only dataset ${uniqueId}`,
        description: 'Dataset the partial editor is not assigned to',
        frequency: 'unknown',
        organization: ORG_ID,
      },
    })
    const dataset = await datasetResponse.json()

    const inviteResponse = await adminContext.request.post(`${API_BASE}/api/1/organizations/${ORG_ID}/member/`, {
      data: {
        email: 'normal@example.com',
        role: 'partial_editor',
      },
    })
    const invitation = await inviteResponse.json()
    await page.request.post(`${API_BASE}/api/1/me/org_invitations/${invitation.id}/accept/`, {})

    try {
      await page.goto(`/admin/datasets/${dataset.id}/`)

      await expect(page.getByText('Ce jeu de données est en lecture seule')).toBeVisible()
      await expect(page.getByLabel('Titre *', { exact: true })).toBeDisabled()
      await expect(page.getByRole('button', { name: 'Sauvegarder' })).toBeDisabled()

      // Actions reserved to editors must not be offered at all.
      await expect(page.getByRole('button', { name: 'Passer en brouillon' })).not.toBeVisible()
      await expect(page.getByRole('button', { name: 'Supprimer' })).not.toBeVisible()
    }
    finally {
      const orgResponse = await adminContext.request.get(`${API_BASE}/api/1/organizations/${ORG_ID}/`)
      const org = await orgResponse.json()
      const member = org.members.find((m: { user: { email: string } }) => m.user.email === 'normal@example.com')
      if (member) {
        await adminContext.request.delete(`${API_BASE}/api/1/organizations/${ORG_ID}/member/${member.user.id}`)
      }
      await adminContext.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
      await adminContext.close()
    }
  })
})
