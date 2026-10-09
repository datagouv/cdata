import { test, expect } from '../base'

// These tests need the `presentation_blocs` field on organizations (udata PR #3780) to be
// available on the e2e backend. The default `admin@example.com` user is a sysadmin,
// so it is an admin of every organization and may configure their presentation.
const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

// Each step waits for networkidle before leaving a page: the header prefetches the
// organization layout and its middleware through NuxtLink, and navigating away aborts
// those module requests, which Firefox reports as a console error.
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
      await page.waitForLoadState('networkidle')

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
      await page.waitForLoadState('networkidle')
      await page.goto(`/organizations/${org.slug}/`)
      await expect(page).toHaveURL(new RegExp(`/organizations/${org.slug}/datasets`))

      // Configure the presentation through the API as a draft (no publication date).
      await page.request.put(`${API_BASE}/api/1/organizations/${org.id}/`, {
        data: {
          ...org,
          presentation_blocs: [
            { class: 'MarkdownBloc', title: 'Bienvenue', subtitle: null, content: '## Nos données\n\nNotre **présentation**.' },
          ],
        },
      })

      // A draft is not a public landing page: the org root still lands on datasets,
      // for the admin too — they reach the draft through the "Présentation" tab.
      await page.waitForLoadState('networkidle')
      await page.goto(`/organizations/${org.slug}/`)
      await expect(page).toHaveURL(new RegExp(`/organizations/${org.slug}/datasets`))

      await page.waitForLoadState('networkidle')
      await page.goto(`/organizations/${org.slug}/presentation`)
      // The bloc title and the markdown content render as distinct headings.
      await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Nos données' })).toBeVisible()
      await expect(page.getByText('Notre présentation.')).toBeVisible()
      // Configured but still a draft: the mode switch offers editing.
      await expect(page.getByTestId('presentation-mode-switch')).toBeVisible()

      // Publishing happens in the composer: switch to edit mode, flip the "public" toggle, save.
      await page.getByTestId('presentation-mode-switch').getByRole('button', { name: 'Modifier' }).click()
      const publicToggle = page.getByRole('switch', { name: 'Visible par le public' })
      await expect(publicToggle).toHaveAttribute('aria-checked', 'false')
      await publicToggle.click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()
      await expect(page.getByText('Présentation sauvegardée')).toBeVisible()
      // The save exits the composer to present the result: "Prévisualiser" is now active.
      await expect(page.getByTestId('presentation-mode-switch').getByRole('button', { name: 'Prévisualiser' })).toHaveAttribute('aria-pressed', 'true')

      const published = await page.request.get(`${API_BASE}/api/1/organizations/${org.id}/`, {
        headers: { 'X-Fields': '{presentation_blocs_published_at}' },
      })
      expect((await published.json()).presentation_blocs_published_at).not.toBeNull()

      // Regression: re-saving must not unpublish. The save dropped us back in
      // read mode, so re-enter the composer; the toggle re-opens already on.
      await page.getByTestId('presentation-mode-switch').getByRole('button', { name: 'Modifier' }).click()
      await expect(page.getByRole('switch', { name: 'Visible par le public' })).toHaveAttribute('aria-checked', 'true')
      await page.getByRole('button', { name: 'Sauvegarder' }).click()
      await expect(page.getByText('Présentation sauvegardée')).toBeVisible()

      const stillPublished = await page.request.get(`${API_BASE}/api/1/organizations/${org.id}/`, {
        headers: { 'X-Fields': '{presentation_blocs_published_at}' },
      })
      expect((await stillPublished.json()).presentation_blocs_published_at).not.toBeNull()

      // Now that the presentation is published, the org root redirects to it.
      await page.waitForLoadState('networkidle')
      await page.goto(`/organizations/${org.slug}/`)
      await expect(page).toHaveURL(new RegExp(`/organizations/${org.slug}/presentation`))

      // Unpublishing: open the composer, flip the toggle off, save.
      await page.getByTestId('presentation-mode-switch').getByRole('button', { name: 'Modifier' }).click()
      const unpublishToggle = page.getByRole('switch', { name: 'Visible par le public' })
      await expect(unpublishToggle).toHaveAttribute('aria-checked', 'true')
      await unpublishToggle.click()
      await page.getByRole('button', { name: 'Sauvegarder' }).click()
      await expect(page.getByText('Présentation sauvegardée')).toBeVisible()
      // The save exits the composer again: "Prévisualiser" is active.
      await expect(page.getByTestId('presentation-mode-switch').getByRole('button', { name: 'Prévisualiser' })).toHaveAttribute('aria-pressed', 'true')

      const draft = await page.request.get(`${API_BASE}/api/1/organizations/${org.id}/`, {
        headers: { 'X-Fields': '{presentation_blocs_published_at}' },
      })
      expect((await draft.json()).presentation_blocs_published_at).toBeNull()

      // Back to a draft: the org root lands on datasets again.
      await page.waitForLoadState('networkidle')
      await page.goto(`/organizations/${org.slug}/`)
      await expect(page).toHaveURL(new RegExp(`/organizations/${org.slug}/datasets`))
    }
    finally {
      await page.request.delete(`${API_BASE}/api/1/organizations/${org.id}/`)
    }
  })
})
