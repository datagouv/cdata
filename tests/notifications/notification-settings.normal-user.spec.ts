import type { APIRequestContext, Browser } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, createOrganization, createReuse, deleteDatasets, deleteOrganizations, deleteReuses, gotoHydrated, listSettings, withAccount } from '../helpers'

// What changes the whole account (cadence, pause, a type turned off anywhere) lives here:
// only one project runs the normal user, so no other test sees these changes while they
// last. The normal user is no sysadmin either, and so follows what they edit.
test.describe.configure({ mode: 'serial' })

const createdDatasets: Array<string> = []
const createdOrganizations: Array<string> = []
const adminReuses: Array<string> = []

async function resetNotificationPreferences(request: APIRequestContext) {
  for (const { scope, event } of await listSettings(request)) {
    await request.put(`${API_BASE}/api/1/notifications/settings/`, { data: { scope, event, enabled: null } })
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
  await asAdmin(browser, request => deleteReuses(request, adminReuses))
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
  await expect(page.getByText('Vous ne suivez plus ce contenu')).toBeVisible()

  await request.put(`${API_BASE}/api/1/datasets/${dataset.id}/`, { data: { description: 'Modifié après l\'arrêt du suivi' } })

  await expect.poll(async () => (await listSettings(request)).filter(setting => setting.scope?.id === dataset.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: null, enabled: false }),
  ])
})

test('a type turned off anywhere is listed and reactivated', async ({ page, request }) => {
  await request.put(`${API_BASE}/api/1/notifications/settings/`, {
    data: { scope: null, event: 'organization.badge.certified', enabled: false },
  })

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
  const openMenu = async () => {
    // Right after the page loads, the bell can miss its first click.
    await expect(async () => {
      await page.getByTitle(/Voir les notifications/).click()
      await expect(notifications).toBeVisible({ timeout: 2000 })
    }).toPass()
    const notification = notifications.getByRole('listitem').filter({ hasText: reuseTitle })
    await notification.getByTitle('Pourquoi je reçois ça ?').click()
  }

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
  await expect(page.getByText('Vous ne recevrez plus de notifications sur ce jeu de données')).toBeVisible()
  await expect.poll(async () => (await listSettings(request)).filter(setting => setting.scope?.id === dataset.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: null, enabled: false }),
  ])
})
