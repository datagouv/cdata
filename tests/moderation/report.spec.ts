import type { APIRequestContext } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, deleteDatasets, gotoHydrated } from '../helpers'

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

async function reportDataset(request: APIRequestContext, datasetId: string, message: string) {
  const reasonsResponse = await request.get(`${API_BASE}/api/1/reports/reasons/`)
  const reasons = await reasonsResponse.json()
  await request.post(`${API_BASE}/api/1/reports/`, {
    data: {
      subject: { class: 'Dataset', id: datasetId },
      reason: reasons[0].value,
      message,
    },
  })
}

test.describe('Report and moderation', () => {
  test('can report a dataset and dismiss the report in moderation', async ({ page, request }) => {
    const title = `Test report dismiss ${Date.now()}`
    const dataset = await createDataset(request, title, 'Dataset pour tester le signalement')
    createdDatasets.push(dataset.id)

    // Report from the public page
    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Signalement' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Signaler ce contenu' })).toBeVisible()

    await dialog.getByLabel('Raison du signalement').selectOption({ index: 1 })
    await dialog.getByLabel('Votre message').fill('Signalement de test E2E')
    await dialog.getByRole('button', { name: 'Signalement' }).click()

    await expect(dialog.getByRole('heading', { name: 'Merci d\'avoir signalé ce contenu' })).toBeVisible()
    // Both the X button and the footer button are named "Fermer": use the footer one
    await dialog.getByRole('button', { name: 'Fermer', exact: true }).last().click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Find the report in the moderation page and dismiss it
    await page.goto('/admin/site/moderation?type=Dataset')
    await page.waitForLoadState('networkidle')

    const row = page.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()
    await expect(row.getByText('Signalement de test E2E')).toBeVisible()

    await row.getByRole('button', { name: 'Rejeter le signalement' }).click()

    // The default filter only shows pending reports: the dismissed one disappears
    await expect(row).not.toBeVisible()
  })

  test('can dismiss a pending report from the reported object page', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test report banner ${Date.now()}`, 'Dataset pour tester le bandeau de signalement')
    createdDatasets.push(dataset.id)

    await reportDataset(request, dataset.id, 'Signalement de test E2E (bandeau)')

    await gotoHydrated(page, `/datasets/${dataset.id}/`)

    const banner = page.getByText('Signalement de test E2E (bandeau)')
    await expect(banner).toBeVisible()

    await page.getByRole('button', { name: 'Rejeter le signalement' }).click()

    await expect(page.getByText('Signalement rejeté.')).toBeVisible()
    await expect(banner).not.toBeVisible()
    const pending = await (await request.get(`${API_BASE}/api/1/reports/`, { params: { subject: dataset.id, handled: false } })).json()
    expect(pending.total).toBe(0)
  })

  test('can dismiss a pending report from the object admin page', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test report banner admin ${Date.now()}`, 'Dataset pour tester le bandeau de signalement en administration')
    createdDatasets.push(dataset.id)

    await reportDataset(request, dataset.id, 'Signalement de test E2E (bandeau admin)')

    await gotoHydrated(page, `/admin/datasets/${dataset.id}`)

    const banner = page.getByText('Signalement de test E2E (bandeau admin)')
    await expect(banner).toBeVisible()
    // The admin page has its own visibility and deletion actions, with their own guards
    await expect(page.getByRole('button', { name: 'Cacher l\'objet' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Supprimer l\'objet' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Rejeter le signalement' }).click()

    await expect(page.getByText('Signalement rejeté.')).toBeVisible()
    await expect(banner).not.toBeVisible()
  })

  test('can hide a reported object from its page', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test report banner hide ${Date.now()}`, 'Dataset pour tester le masquage depuis le bandeau')
    createdDatasets.push(dataset.id)

    await reportDataset(request, dataset.id, 'Signalement de test E2E (bandeau, masquage)')

    await gotoHydrated(page, `/datasets/${dataset.id}/`)

    const hideButton = page.getByRole('button', { name: 'Cacher l\'objet' })
    await hideButton.click()

    // The object is a draft now: there is nothing left to hide
    await expect(hideButton).not.toBeVisible()
    await expect(page.getByText('Brouillon', { exact: true })).toBeVisible()
    const updated = await (await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.private).toBe(true)
  })

  test('can delete a reported object from its page', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test report banner delete ${Date.now()}`, 'Dataset pour tester la suppression depuis le bandeau')
    createdDatasets.push(dataset.id)

    await reportDataset(request, dataset.id, 'Signalement de test E2E (bandeau, suppression)')

    await gotoHydrated(page, `/datasets/${dataset.id}/`)

    await page.getByRole('button', { name: 'Supprimer l\'objet' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByText('Envoyer un mail automatique (voies de recours)').click()
    await dialog.getByRole('button', { name: 'Supprimer', exact: true }).click()

    // Deleting the object handles its reports
    await expect(page.getByText('Signalement de test E2E (bandeau, suppression)')).not.toBeVisible()
    await expect(page.getByText('Supprimé', { exact: true })).toBeVisible()
    const updated = await (await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.deleted).not.toBeNull()
  })

  test('removes the banner once the object is deleted from its admin page', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test report banner admin delete ${Date.now()}`, 'Dataset pour tester le bandeau après suppression en administration')
    createdDatasets.push(dataset.id)

    await reportDataset(request, dataset.id, 'Signalement de test E2E (bandeau, suppression admin)')

    await gotoHydrated(page, `/admin/datasets/${dataset.id}`)
    const banner = page.getByText('Signalement de test E2E (bandeau, suppression admin)')
    await expect(banner).toBeVisible()

    // The page's own deletion, not the banner's
    await page.getByRole('button', { name: 'Supprimer', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByText('Envoyer un mail automatique (voies de recours)').click()
    await dialog.getByRole('button', { name: 'Supprimer le jeu de données' }).click()

    await expect(page.getByRole('button', { name: 'Restaurer' })).toBeVisible()
    await expect(banner).not.toBeVisible()
  })

  test('links to the other pending reports of the object in moderation', async ({ page, request }) => {
    const title = `Test report banner others ${Date.now()}`
    const dataset = await createDataset(request, title, 'Dataset pour tester le lien vers les autres signalements')
    createdDatasets.push(dataset.id)
    const otherDataset = await createDataset(request, `Test report banner others, other ${Date.now()}`, 'Dataset signalé à côté')
    createdDatasets.push(otherDataset.id)

    await reportDataset(request, dataset.id, 'Signalement de test E2E (premier)')
    await reportDataset(request, dataset.id, 'Signalement de test E2E (second)')
    await reportDataset(request, otherDataset.id, 'Signalement de test E2E (autre objet)')

    await gotoHydrated(page, `/datasets/${dataset.id}/`)

    // Only the latest report is shown, the other one is behind the link
    await expect(page.getByText('Signalement de test E2E (second)')).toBeVisible()
    await expect(page.getByText('Signalement de test E2E (premier)')).not.toBeVisible()

    await page.getByRole('link', { name: 'Voir l\'autre signalement' }).click()
    await page.waitForURL(`**/admin/site/moderation?subject=${dataset.id}`)

    await expect(page.getByRole('row').filter({ hasText: 'Signalement de test E2E (premier)' })).toBeVisible()
    await expect(page.getByRole('row').filter({ hasText: 'Signalement de test E2E (second)' })).toBeVisible()
    await expect(page.getByRole('row').filter({ hasText: 'Signalement de test E2E (autre objet)' })).not.toBeVisible()

    // The filter is shown, by its title even once no pending report is left to read it from
    const filter = page.getByTitle(title)
    await expect(filter).toBeVisible()
    for (const message of ['Signalement de test E2E (premier)', 'Signalement de test E2E (second)']) {
      const row = page.getByRole('row').filter({ hasText: message })
      await row.getByRole('button', { name: 'Rejeter le signalement' }).click()
      await expect(row).not.toBeVisible()
    }
    await expect(filter).toBeVisible()

    // And it can be removed
    await page.getByRole('button', { name: 'Retirer le filtre sur l\'objet' }).click()
    await page.waitForURL(url => url.pathname === '/admin/site/moderation' && !url.searchParams.has('subject'))
    await expect(filter).not.toBeVisible()
  })

  test('does not show pending reports to the owner of the object who is not a sysadmin', async ({ browser, request }) => {
    const normalUserContext = await browser.newContext({ storageState: 'playwright/.auth/normal-user.json' })
    const normalUserPage = await normalUserContext.newPage()
    try {
      // Owned by the normal user, who can edit it but must not see its reports
      const dataset = await createDataset(normalUserPage.request, `Test report banner hidden ${Date.now()}`, 'Dataset pour tester le bandeau de signalement')
      createdDatasets.push(dataset.id)

      await reportDataset(request, dataset.id, 'Signalement de test E2E (bandeau caché)')

      // The reports API is restricted to sysadmins: the page must not even ask for them
      const reportFetches: Array<string> = []
      normalUserPage.on('request', (req) => {
        if (req.method() === 'GET' && new URL(req.url()).pathname === '/api/1/reports/') reportFetches.push(req.url())
      })
      // A server-side render fetches from Nitro, out of the browser's sight: reach the page
      // through a client-side navigation so that its fetches go through the browser
      await gotoHydrated(normalUserPage, '/')
      await normalUserPage.evaluate(path => window.useNuxtApp!().$router.push(path), `/datasets/${dataset.id}/`)
      await normalUserPage.waitForLoadState('networkidle')
      await expect(normalUserPage.getByRole('heading', { name: dataset.title })).toBeVisible()
      await expect(normalUserPage.getByText('Signalement de test E2E (bandeau caché)')).not.toBeVisible()
      expect(reportFetches).toEqual([])
    }
    finally {
      await normalUserContext.close()
    }
  })

  test('cannot send a report without a reason nor a message', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test report validation ${Date.now()}`, 'Dataset pour tester la validation du signalement')
    createdDatasets.push(dataset.id)

    const reportPosts: Array<string> = []
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/api/1/reports/')) reportPosts.push(req.url())
    })

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Signalement' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Signalement' }).click()

    await expect(dialog.getByText('Le champ est requis.')).toHaveCount(2)
    await expect(dialog.getByRole('heading', { name: 'Signaler ce contenu' })).toBeVisible()
    expect(reportPosts).toEqual([])
  })

  test('does not offer the auto-detected spam reason', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test report reasons ${Date.now()}`, 'Dataset pour tester les raisons de signalement')
    createdDatasets.push(dataset.id)

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Signalement' }).click()
    const select = page.getByRole('dialog').getByLabel('Raison du signalement')
    await expect(select.locator('option[value="spam"]')).toHaveCount(1)
    await expect(select.locator('option[value="auto_spam"]')).toHaveCount(0)
  })

  test.describe('when the API rejects the report', () => {
    // The rejection below is the point of the test: the browser logs it.
    test.use({ allowedConsoleMessages: ['the server responded with a status of 400'] })

    test('shows an error when the report cannot be sent', async ({ page, request }) => {
      const dataset = await createDataset(request, `Test report error ${Date.now()}`, 'Dataset pour tester l\'échec du signalement')
      createdDatasets.push(dataset.id)

      await page.route(url => url.pathname === '/api/1/reports/', route => route.request().method() === 'POST'
        ? route.fulfill({ status: 400, json: { message: 'Validation error' } })
        : route.fallback())

      await page.goto(`/datasets/${dataset.id}/`)
      await page.waitForLoadState('networkidle')

      await page.getByRole('button', { name: 'Signalement' }).click()
      const dialog = page.getByRole('dialog')
      await dialog.getByLabel('Raison du signalement').selectOption('spam')
      await dialog.getByLabel('Votre message').fill('Signalement de test E2E (échec)')
      await dialog.getByRole('button', { name: 'Signalement' }).click()

      await expect(page.getByText('Impossible d\'envoyer le signalement.')).toBeVisible()
      await expect(dialog.getByRole('heading', { name: 'Signaler ce contenu' })).toBeVisible()
    })
  })

  test('can hide a reported object (switch to private)', async ({ page, request }) => {
    const title = `Test report hide ${Date.now()}`
    const dataset = await createDataset(request, title, 'Dataset pour tester le masquage via modération')
    createdDatasets.push(dataset.id)

    // Report via API (the report UI itself is covered by the dismiss test)
    await reportDataset(request, dataset.id, 'Signalement de test E2E (masquage)')

    await page.goto('/admin/site/moderation?type=Dataset')
    await page.waitForLoadState('networkidle')

    const row = page.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()

    const hideButton = row.getByRole('button', { name: 'Cacher l\'objet' })
    await expect(hideButton).toBeEnabled()
    await hideButton.click()

    // Once hidden the object is private and the button is disabled
    await expect(hideButton).toBeDisabled()
    const updated = await (await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.private).toBe(true)
  })

  test('can delete a reported object from moderation', async ({ page, request }) => {
    const title = `Test report delete ${Date.now()}`
    const dataset = await createDataset(request, title, 'Dataset pour tester la suppression via modération')
    createdDatasets.push(dataset.id)

    await reportDataset(request, dataset.id, 'Signalement de test E2E (suppression)')

    await page.goto('/admin/site/moderation?type=Dataset')
    await page.waitForLoadState('networkidle')

    const row = page.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: 'Supprimer l\'objet' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Êtes-vous sûr de vouloir supprimer cet objet ?' })).toBeVisible()

    // As site admin, a mail option must be chosen before deleting
    await dialog.getByText('Envoyer un mail automatique (voies de recours)').click()
    await dialog.getByRole('button', { name: 'Supprimer', exact: true }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    const updated = await (await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.deleted).not.toBeNull()
  })
})
