import { test, expect } from '../base'

// These tests need the `blocs` field on organizations (udata PR #3780) to be
// available on the e2e backend. The default `admin@example.com` user is a sysadmin,
// so it is an admin of every organization and may configure their presentation.
const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test.describe('Organization presentation tab', () => {
  test('admin can configure and visitors can read the editorial blocs', async ({ page }) => {
    const uniqueId = Date.now()
    const createResp = await page.request.post(`${API_BASE}/api/1/organizations/`, {
      data: {
        name: `Presentation test ${uniqueId}`,
        description: 'Organization used to test the presentation tab.',
      },
    })
    const org = await createResp.json()

    try {
      // No blocs yet: the tab is hidden for the public but offered to the admin so
      // they can create it.
      await page.goto(`/organizations/${org.slug}/datasets`)
      const presentationTab = page.getByRole('link', { name: 'Présentation' })
      await expect(presentationTab).toBeVisible()

      await presentationTab.click()
      await expect(page).toHaveURL(new RegExp(`/organizations/${org.slug}/presentation`))
      await expect(page.getByRole('button', { name: 'Configurer la présentation' })).toBeVisible()

      // Configure the presentation through the API, then check it renders publicly.
      await page.request.put(`${API_BASE}/api/1/organizations/${org.id}/`, {
        data: {
          ...org,
          blocs: [
            { class: 'MarkdownBloc', title: 'Bienvenue', subtitle: null, content: '## Bienvenue\n\nNotre **présentation**.' },
          ],
        },
      })

      await page.goto(`/organizations/${org.slug}/presentation`)
      await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible()
      await expect(page.getByText('Notre présentation.')).toBeVisible()
      // Now configured, the CTA switches to "Modifier".
      await expect(page.getByRole('button', { name: 'Modifier la présentation' })).toBeVisible()
    }
    finally {
      await page.request.delete(`${API_BASE}/api/1/organizations/${org.id}/`)
    }
  })
})
