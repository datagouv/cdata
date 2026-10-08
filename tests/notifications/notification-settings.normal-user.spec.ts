import type { APIRequestContext, Browser } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, createDiscussion, createOrganization, createReuse, deleteDatasets, deleteOrganizations, deleteReuses, gotoHydrated, joinOrganization, listSettings, openNotifications, setRule, withAccount } from '../helpers'

// What changes the whole account (cadence, pause, a type turned off anywhere) lives here:
// only one project runs the normal user, so no other test sees these changes while they
// last. The normal user is no sysadmin either, and so follows what they edit.
test.describe.configure({ mode: 'serial' })

const createdDatasets: Array<string> = []
const createdOrganizations: Array<string> = []
const adminReuses: Array<string> = []
const adminDatasets: Array<string> = []
const adminOrganizations: Array<string> = []

async function resetNotificationPreferences(request: APIRequestContext) {
  for (const { scope, event } of await listSettings(request)) {
    await setRule(request, { scope, event }, null)
  }
  await request.put(`${API_BASE}/api/1/me/`, { data: { mail_cadence: 'immediate', notifications_paused: false } })
}

function asAdmin<T>(browser: Browser, run: (request: APIRequestContext) => Promise<T>) {
  return withAccount(browser, 'playwright/.auth/user.json', run)
}

test.beforeEach(async ({ request }) => {
  await resetNotificationPreferences(request)
})

test.afterEach(async ({ request, browser }) => {
  await asAdmin(browser, async (admin) => {
    await deleteReuses(admin, adminReuses)
    await deleteDatasets(admin, adminDatasets)
    await deleteOrganizations(admin, adminOrganizations)
  })
  await deleteDatasets(request, createdDatasets)
  await deleteOrganizations(request, createdOrganizations)
  await resetNotificationPreferences(request)
})

test('the mail cadence is saved on the account', async ({ page, request }) => {
  await gotoHydrated(page, '/admin/me/notifications')

  await page.getByLabel('Un résumé par semaine').check({ force: true })
  await expect(page.getByText('Préférence enregistrée')).toBeVisible()

  const me = await (await request.get(`${API_BASE}/api/1/me/`)).json()
  expect(me.mail_cadence).toBe('weekly')

  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.getByLabel('Un résumé par semaine')).toBeChecked()
})

test('notifications are paused and resumed from the top of the page', async ({ page, request }) => {
  await gotoHydrated(page, '/admin/me/notifications')

  await page.getByRole('button', { name: 'Mettre en pause les notifications' }).click()
  await expect(page.getByText('Toutes vos notifications sont désactivées').first()).toBeVisible()
  await expect.poll(async () => (await (await request.get(`${API_BASE}/api/1/me/`)).json()).notifications_paused).toBe(true)

  await page.getByRole('button', { name: 'Réactiver' }).click()
  await expect.poll(async () => (await (await request.get(`${API_BASE}/api/1/me/`)).json()).notifications_paused).toBe(false)
  await expect(page.getByRole('button', { name: 'Mettre en pause les notifications' })).toBeVisible()
})

test('during a pause, the box says so and the follow buttons still work', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test pause ${uniqueId}`, 'Dataset pour tester le suivi en pause')
  createdDatasets.push(dataset.id)
  await request.put(`${API_BASE}/api/1/me/`, { data: { notifications_paused: true } })

  await gotoHydrated(page, `/admin/datasets/${dataset.id}`)
  await expect(page.getByText('Toutes vos notifications sont désactivées.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ne plus recevoir' })).not.toBeVisible()

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions`)
  // The owner hears about the discussions of their dataset, pause aside.
  await page.getByRole('button', { name: 'Ne plus suivre les discussions' }).click()
  await expect(page.getByText('Vous ne serez plus prévenu des nouvelles discussions')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Suivre les discussions' })).toBeVisible()

  // A no on the new discussions of the dataset alone, listed as such.
  await gotoHydrated(page, '/admin/me/notifications')
  const row = page.getByRole('listitem').filter({ has: page.getByRole('link', { name: `Test pause ${uniqueId}` }) })
  await expect(row).toContainText('Vous ne recevez plus : Nouvelles discussions')
  await expect(row.getByRole('button', { name: 'Réactiver' })).toBeVisible()
})

test('an automatic follow stays stopped when the subject is edited again', async ({ page, request }) => {
  const uniqueId = Date.now()
  const organization = await createOrganization(request, `Test suivi automatique ${uniqueId}`)
  createdOrganizations.push(organization.id)
  // Creating a dataset of one's organization by hand follows it.
  const dataset = await createDataset(request, `Test suivi automatique ${uniqueId}`, 'Dataset pour tester l\'arrêt d\'un suivi automatique', { organization: organization.id })
  createdDatasets.push(dataset.id)

  await gotoHydrated(page, '/admin/me/notifications')
  const row = page.getByRole('listitem').filter({ has: page.getByRole('link', { name: `Test suivi automatique ${uniqueId}` }) })
  await expect(row).toContainText('Suivi automatique : vous l\'avez modifié')
  await row.getByRole('button', { name: 'Ne plus suivre' }).click()
  await expect(page.getByText(`Vous ne suivez plus « Test suivi automatique ${uniqueId} »`)).toBeVisible()
  // Withdrawn, the automatic follow becomes a no: it moves to the cut notifications.
  await expect(row).toContainText('Vous ne recevez rien sur ce jeu de données')
  await expect(row.getByRole('button', { name: 'Réactiver' })).toBeVisible()

  // Failing, the edit would not even try to follow the dataset again.
  const edit = await request.put(`${API_BASE}/api/1/datasets/${dataset.id}/`, { data: { description: 'Modifié après l\'arrêt du suivi' } })
  expect(edit.ok()).toBe(true)

  await expect.poll(async () => (await listSettings(request)).filter(setting => setting.scope?.id === dataset.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: null, enabled: false }),
  ])
})

test('opening a discussion as an editor follows the subject, without reloading the page', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const dataset = await asAdmin(browser, async (admin) => {
    const organization = await createOrganization(admin, `Test éditeur ${uniqueId}`)
    adminOrganizations.push(organization.id)
    await joinOrganization(admin, request, organization.id, 'editor')
    const created = await createDataset(admin, `Test éditeur ${uniqueId}`, 'Dataset de l\'organisation de l\'éditeur', { organization: organization.id })
    adminDatasets.push(created.id)
    return created
  })

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions`)
  // An editor hears nothing of a dataset they never worked on.
  await expect(page.getByRole('button', { name: 'Suivre les discussions' })).toBeVisible()

  await page.getByRole('button', { name: 'Démarrer une nouvelle discussion' }).click()
  await page.getByTestId('producer-select').click()
  await page.getByRole('option', { name: 'Normal User' }).click()
  await page.getByRole('textbox', { name: /Titre/ }).fill(`Question de l'éditeur ${uniqueId}`)
  await page.getByRole('textbox', { name: /Votre message/ }).fill('Message de l\'éditeur.')
  await page.getByRole('button', { name: 'Envoyer' }).click()

  await expect(page.getByText(`Question de l'éditeur ${uniqueId}`, { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ne plus suivre les discussions' })).toBeVisible()
})

test('the menu of a discussion notification stops the thread, then the whole dataset', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test menu discussion ${uniqueId}`, 'Dataset pour tester le menu d\'une discussion')
  createdDatasets.push(dataset.id)
  const title = `Question dans la cloche ${uniqueId}`
  const discussion = await asAdmin(browser, admin => createDiscussion(admin, { class: 'Dataset', id: dataset.id }, title))

  await gotoHydrated(page, '/')
  const why = page.getByRole('list', { name: 'Notifications' }).getByRole('listitem').filter({ hasText: title }).getByTitle('Pourquoi je reçois ça ?')
  await openNotifications(page)
  await why.click()
  await expect(page.getByText('Vous recevez cette notification en tant que propriétaire.')).toBeVisible()
  await page.getByRole('button', { name: 'Ne plus suivre cette discussion' }).click()
  await expect(page.getByText(`Vous ne suivez plus la discussion « ${title} »`)).toBeVisible()
  await expect.poll(() => listSettings(request)).toEqual([
    expect.objectContaining({ scope: { class: 'Discussion', id: discussion.id }, event: 'discussion', enabled: false }),
  ])

  await page.keyboard.press('Escape')
  await openNotifications(page)
  await why.click()
  await page.getByRole('button', { name: 'Ne rien recevoir sur ce jeu de données' }).click()
  await expect(page.getByText('Vous ne recevrez plus de notifications sur ce jeu de données')).toBeVisible()
  await expect.poll(async () => (await listSettings(request)).filter(setting => setting.scope?.id === dataset.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: null, enabled: false }),
  ])
})

test('the menu of a badge tells a partial editor why, and stops the organization', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const organization = await asAdmin(browser, async (admin) => {
    const created = await createOrganization(admin, `Test badge ${uniqueId}`)
    adminOrganizations.push(created.id)
    await joinOrganization(admin, request, created.id, 'partial_editor')
    const badge = await admin.post(`${API_BASE}/api/1/organizations/${created.id}/badges/`, { data: { kind: 'certified' } })
    expect(badge.ok()).toBe(true)
    return created
  })

  await gotoHydrated(page, '/')
  const why = page.getByRole('list', { name: 'Notifications' }).getByRole('listitem').filter({ hasText: `Test badge ${uniqueId}` }).getByTitle('Pourquoi je reçois ça ?')
  await openNotifications(page)
  await why.click()
  // Nothing of a badge was assigned to them: the organization as a whole concerns them.
  await expect(page.getByText('Vous recevez cette notification en tant qu\'éditeur partiel de l\'organisation.')).toBeVisible()
  await page.getByRole('button', { name: 'Ne rien recevoir sur cette organisation' }).click()
  await expect(page.getByText(`Vous ne recevrez plus de notifications sur « Test badge ${uniqueId} »`)).toBeVisible()
  await expect.poll(() => listSettings(request)).toEqual([
    expect.objectContaining({ scope: { class: 'Organization', id: organization.id }, event: null, enabled: false }),
  ])

  // The badges as a whole, rather than the kind just received.
  await page.keyboard.press('Escape')
  await openNotifications(page)
  await why.click()
  await page.getByRole('button', { name: 'Ne plus recevoir : Badges de l\'organisation' }).click()
  await expect(page.getByText('Vous ne recevrez plus ce type de notification')).toBeVisible()
  await expect.poll(() => listSettings(request)).toEqual(expect.arrayContaining([
    expect.objectContaining({ scope: null, event: 'organization.badge', enabled: false }),
  ]))
})

test('each list of rules goes back a page once its last page is emptied', async ({ page, request }) => {
  const uniqueId = Date.now()
  for (let index = 0; index < 21; index++) {
    const dataset = await createDataset(request, `Test pagination ${uniqueId} ${index}`, 'Dataset pour tester la pagination des règles')
    createdDatasets.push(dataset.id)
    await setRule(request, { scope: { class: 'Dataset', id: dataset.id }, event: null }, true)
  }
  const unfollow = page.getByRole('button', { name: 'Ne plus suivre', exact: true })

  // Latest first: the first dataset is alone on the second page.
  await gotoHydrated(page, '/admin/me/notifications?page_suivis=2')
  await expect(unfollow).toHaveCount(1)
  await expect(page.getByRole('link', { name: `Test pagination ${uniqueId} 0`, exact: true })).toBeVisible()
  await unfollow.click()

  await expect(page).not.toHaveURL(/page_suivis=2/)
  await expect(unfollow).toHaveCount(20)
})

test('a type turned off anywhere is listed and reactivated', async ({ page, request }) => {
  await setRule(request, { scope: null, event: 'organization.badge.certified' }, false)

  await gotoHydrated(page, '/admin/me/notifications')

  // The five badge types read as badges.
  const row = page.getByRole('listitem').filter({ hasText: 'Vous ne recevez plus ce type de notification' }).filter({ hasText: 'Badges de l\'organisation' })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: 'Réactiver' }).click()
  await expect(page.getByText('Notifications réactivées')).toBeVisible()
  await expect.poll(() => listSettings(request)).toEqual([])
})

test('the menu of a notification says why it came and turns it off', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test cloche ${uniqueId}`, 'Dataset pour tester le menu de la cloche')
  createdDatasets.push(dataset.id)
  const reuseTitle = `Réutilisation de la cloche ${uniqueId}`
  // A reuse of one's dataset is announced at once, without any worker.
  const reuse = await asAdmin(browser, admin => createReuse(admin, reuseTitle, `https://example.org/cloche-${uniqueId}`, { datasets: [dataset.id] }))
  adminReuses.push(reuse.id)

  await gotoHydrated(page, '/')
  const notifications = page.getByRole('list', { name: 'Notifications' })
  const why = notifications.getByRole('listitem').filter({ hasText: reuseTitle }).getByTitle('Pourquoi je reçois ça ?')
  const reasons = page.getByText('Vous recevez cette notification en tant que propriétaire.')
  const openMenu = async () => {
    await openNotifications(page)
    await why.click()
  }

  // Escape closes the menu first, the notifications on the next one; its button toggles it.
  await openMenu()
  await expect(reasons).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(reasons).not.toBeVisible()
  await expect(notifications).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(notifications).not.toBeVisible()
  await openMenu()
  await why.click()
  await expect(reasons).not.toBeVisible()
  await page.keyboard.press('Escape')

  await openMenu()
  await expect(page.getByText('Vous recevez cette notification en tant que propriétaire.')).toBeVisible()
  await page.getByRole('button', { name: 'Ne plus recevoir : Nouvelles réutilisations' }).click()
  await expect(page.getByText('Vous ne recevrez plus ce type de notification')).toBeVisible()
  await expect.poll(() => listSettings(request)).toEqual([
    expect.objectContaining({ scope: null, event: 'reuse.created', enabled: false }),
  ])

  await page.keyboard.press('Escape')
  await openMenu()
  await page.getByRole('button', { name: 'Ne rien recevoir sur ce jeu de données' }).click()
  await expect(page.getByText(`Vous ne recevrez plus de notifications sur « Test cloche ${uniqueId} »`)).toBeVisible()
  await expect.poll(async () => (await listSettings(request)).filter(setting => setting.scope?.id === dataset.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: null, enabled: false }),
  ])
})

test('a subject out of reach is listed and linked to without its title', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const dataset = await asAdmin(browser, async (admin) => {
    const created = await createDataset(admin, `Test privé ${uniqueId}`, 'Dataset privé de l\'admin')
    adminDatasets.push(created.id)
    const hidden = await admin.put(`${API_BASE}/api/1/datasets/${created.id}/`, { data: { private: true } })
    expect(hidden.ok()).toBe(true)
    return created
  })
  await setRule(request, { scope: { class: 'Dataset', id: dataset.id }, event: null }, true)

  await gotoHydrated(page, '/admin/me/notifications')
  const row = page.getByRole('listitem').filter({ hasText: 'Contenu qui ne vous est plus accessible' })
  await expect(row).toBeVisible()
  await expect(row.getByRole('link')).toHaveCount(0)
  await expect(page.getByText(`Test privé ${uniqueId}`)).not.toBeVisible()

  await gotoHydrated(page, `/admin/me/notifications?scope=Dataset:${dataset.id}`)
  await expect(page.getByText('Vous ne recevez déjà rien sur ce jeu de données.')).toBeVisible()
  await expect(page.getByText(`Test privé ${uniqueId}`)).not.toBeVisible()
})
