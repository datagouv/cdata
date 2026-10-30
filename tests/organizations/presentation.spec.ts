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
      // The empty state invites the admin to add a first section.
      await expect(page.getByText('Personnalisez votre page de présentation')).toBeVisible()
      // Sections are all a page can add at its top level: no menu to pick from.
      await page.getByRole('button', { name: 'Ajouter une section' }).click()
      await expect(page.getByTestId('add-bloc-SectionBloc')).toHaveCount(0)
      await expect(page.getByTestId('add-bloc-in-section')).toBeVisible()
      // Under the banner of the organization, a section keeps a neutral background.
      const section = page.getByTestId('page-SectionBloc')
      await section.hover({ position: { x: 20, y: 20 } })
      await section.getByRole('button', { name: 'Actions sur Section' }).click()
      await expect(page.getByRole('menuitem', { name: 'Supprimer' })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: 'Fond vert' })).toHaveCount(0)
      await page.keyboard.press('Escape')

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
            { class: 'SectionBloc', blocs: [
              { class: 'TitleBloc', title: 'Bienvenue', subtitle: null },
              { class: 'MarkdownBloc', content: '## Nos données\n\nNotre **présentation**.' },
            ] },
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

  test('links leaving the site are not followed by search engines', async ({ page }) => {
    const uniqueId = Date.now()
    const createResp = await page.request.post(`${API_BASE}/api/1/organizations/`, {
      data: {
        name: `Presentation links test ${uniqueId}`,
        description: 'Organization used to test the links of the presentation tab.',
      },
    })
    const org = await createResp.json()

    try {
      const updateResp = await page.request.put(`${API_BASE}/api/1/organizations/${org.id}/`, {
        data: {
          ...org,
          presentation_blocs: [
            { class: 'SectionBloc', blocs: [
              { class: 'TitleBloc', title: 'Liens' },
              { class: 'MarkdownBloc', content: 'Nos liens.' },
              {
                class: 'LinksListBloc',
                links: [
                  { title: 'Lien externe', url: 'https://example.com/link', color: '#000000' },
                  { title: 'Lien interne', url: '/datasets', color: '#000000' },
                ],
              },
              { class: 'ButtonBloc', title: 'Notre site', url: 'https://example.com/main' },
              { class: 'CardBloc', width: '1/4', title: 'Carte', url: 'https://example.com/card' },
            ] },
          ],
        },
      })
      expect(updateResp.ok()).toBe(true)

      // The draft presentation is shown to the admin.
      await page.goto(`/organizations/${org.slug}/presentation`)
      const rel = 'ugc nofollow noopener'
      await expect(page.getByRole('link', { name: 'Notre site' })).toHaveAttribute('rel', rel)
      await expect(page.getByRole('link', { name: 'Carte' })).toHaveAttribute('rel', rel)
      await expect(page.getByRole('link', { name: 'Lien externe' })).toHaveAttribute('rel', rel)
      // Links to the site are marked too: telling them apart is not worth it for now
      await expect(page.getByRole('link', { name: 'Lien interne' })).toHaveAttribute('rel', rel)
      await page.waitForLoadState('networkidle')
    }
    finally {
      await page.request.delete(`${API_BASE}/api/1/organizations/${org.id}/`)
    }
  })

  test('admin invite banner toggles with the presentation publication state', async ({ page }) => {
    const uniqueId = Date.now()
    const createResp = await page.request.post(`${API_BASE}/api/1/organizations/`, {
      data: {
        name: `Invite banner test ${uniqueId}`,
        description: 'Organization used to test the admin invite banner.',
      },
    })
    const org = await createResp.json()

    const bannerTitle = page.getByText('Personnalisez votre page de présentation')
    try {
      // Fresh organization: the presentation was never published, so the admin
      // is invited to personalize it.
      await page.goto(`/admin/organizations/${org.id}/profile`)
      await page.waitForLoadState('networkidle')
      await expect(bannerTitle).toBeVisible()
      await expect(page.getByRole('link', { name: 'Personnaliser la page' })).toHaveAttribute('href', new RegExp(`/organizations/${org.slug}/presentation\\?edit=true$`))

      // Publishing the presentation through the API hides the invite banner.
      await page.request.put(`${API_BASE}/api/1/organizations/${org.id}/`, {
        data: {
          ...org,
          presentation_blocs: [
            { class: 'SectionBloc', blocs: [{ class: 'MarkdownBloc', content: 'Contenu.' }] },
          ],
          presentation_blocs_published_at: new Date().toISOString(),
        },
      })

      await page.waitForLoadState('networkidle')
      await page.goto(`/admin/organizations/${org.id}/profile`)
      await expect(bannerTitle).toBeHidden()

      // Unpublishing (published_at back to null) brings the invite banner back.
      await page.request.put(`${API_BASE}/api/1/organizations/${org.id}/`, {
        data: {
          ...org,
          presentation_blocs: [
            { class: 'SectionBloc', blocs: [{ class: 'MarkdownBloc', content: 'Contenu.' }] },
          ],
          presentation_blocs_published_at: null,
        },
      })

      await page.waitForLoadState('networkidle')
      await page.goto(`/admin/organizations/${org.id}/profile`)
      await expect(bannerTitle).toBeVisible()
    }
    finally {
      await page.request.delete(`${API_BASE}/api/1/organizations/${org.id}/`)
    }
  })
})
