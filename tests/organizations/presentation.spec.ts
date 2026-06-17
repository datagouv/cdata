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
      // There is nothing to read yet, so an admin is dropped straight into edit mode.
      await expect(page).toHaveURL(/edit=true/)
      // The empty state invites the admin to add a first bloc.
      await expect(page.getByText('Personnalisez votre page de présentation')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Ajouter un bloc' })).toBeVisible()

      // Cancelling drops back to view mode, where the same empty state now offers
      // a CTA to re-enter the composer.
      await page.getByRole('button', { name: 'Annuler' }).click()
      await expect(page).not.toHaveURL(/edit=true/)
      await expect(page.getByRole('button', { name: 'Configurer la présentation' })).toBeVisible()

      // Without a presentation, the organization root lands on the datasets tab.
      await page.goto(`/organizations/${org.slug}/`)
      await expect(page).toHaveURL(new RegExp(`/organizations/${org.slug}/datasets`))

      // Configure the presentation through the API as a draft (no publication date).
      await page.request.put(`${API_BASE}/api/1/organizations/${org.id}/`, {
        data: {
          ...org,
          blocs: [
            { class: 'MarkdownBloc', title: 'Bienvenue', subtitle: null, content: '## Bienvenue\n\nNotre **présentation**.' },
          ],
        },
      })

      // A draft is not a public landing page: the org root still lands on datasets,
      // for the admin too — they reach the draft through the "Présentation" tab.
      await page.goto(`/organizations/${org.slug}/`)
      await expect(page).toHaveURL(new RegExp(`/organizations/${org.slug}/datasets`))

      await page.goto(`/organizations/${org.slug}/presentation`)
      await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible()
      await expect(page.getByText('Notre présentation.')).toBeVisible()
      // Configured but still a draft: the header CTA offers to edit or publish it.
      await expect(page.getByRole('button', { name: 'Modifier ou publier la présentation' })).toBeVisible()

      // Publishing happens in the composer: open it, flip the "public" toggle, save.
      await page.getByRole('button', { name: 'Modifier ou publier la présentation' }).click()
      const publicToggle = page.getByRole('switch', { name: 'Visible par le public' })
      await expect(publicToggle).toHaveAttribute('aria-checked', 'false')
      await publicToggle.click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()
      await expect(page.getByText('Présentation sauvegardée')).toBeVisible()
      // Once published, the header CTA drops "ou publier".
      await expect(page.getByRole('button', { name: 'Modifier la présentation', exact: true })).toBeVisible()

      const published = await page.request.get(`${API_BASE}/api/1/organizations/${org.id}/`, {
        headers: { 'X-Fields': '{blocs_published_at}' },
      })
      expect((await published.json()).blocs_published_at).not.toBeNull()

      // Regression: re-saving must not unpublish. The toggle re-opens already on, so
      // saving again keeps the publication date.
      await page.getByRole('button', { name: 'Modifier la présentation', exact: true }).click()
      await expect(page.getByRole('switch', { name: 'Visible par le public' })).toHaveAttribute('aria-checked', 'true')
      await page.getByRole('button', { name: 'Sauvegarder' }).click()
      await expect(page.getByText('Présentation sauvegardée')).toBeVisible()

      const stillPublished = await page.request.get(`${API_BASE}/api/1/organizations/${org.id}/`, {
        headers: { 'X-Fields': '{blocs_published_at}' },
      })
      expect((await stillPublished.json()).blocs_published_at).not.toBeNull()

      // Now that the presentation is published, the org root redirects to it.
      await page.goto(`/organizations/${org.slug}/`)
      await expect(page).toHaveURL(new RegExp(`/organizations/${org.slug}/presentation`))

      // Unpublishing: open the composer, flip the toggle off, save.
      await page.getByRole('button', { name: 'Modifier la présentation', exact: true }).click()
      const unpublishToggle = page.getByRole('switch', { name: 'Visible par le public' })
      await expect(unpublishToggle).toHaveAttribute('aria-checked', 'true')
      await unpublishToggle.click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()
      await expect(page.getByText('Présentation sauvegardée')).toBeVisible()
      // Back to a draft: the header CTA offers "ou publier" again.
      await expect(page.getByRole('button', { name: 'Modifier ou publier la présentation' })).toBeVisible()

      const draft = await page.request.get(`${API_BASE}/api/1/organizations/${org.id}/`, {
        headers: { 'X-Fields': '{blocs_published_at}' },
      })
      expect((await draft.json()).blocs_published_at).toBeNull()

      // Back to a draft: the org root lands on datasets again.
      await page.goto(`/organizations/${org.slug}/`)
      await expect(page).toHaveURL(new RegExp(`/organizations/${org.slug}/datasets`))
    }
    finally {
      await page.request.delete(`${API_BASE}/api/1/organizations/${org.id}/`)
    }
  })
})
