import type { APIRequestContext, Browser } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, deleteDatasets, deleteReuses, gotoHydrated } from '../helpers'

type ApiNotificationSetting = {
  scope: { class: string, id: string } | null
  event: string | null
  enabled: boolean
}

// What changes the whole account (cadence, pause) lives here: only one project runs the
// normal user, so no other test sees these changes while they last.
test.describe.configure({ mode: 'serial' })

const createdDatasets: Array<string> = []
const adminReuses: Array<string> = []

// One page large enough for every rule of the account, the automatic follows included.
async function listSettings(request: APIRequestContext): Promise<Array<ApiNotificationSetting>> {
  const response = await request.get(`${API_BASE}/api/1/notifications/settings/?page_size=1000`)
  return (await response.json()).data
}

async function resetNotificationPreferences(request: APIRequestContext) {
  for (const { scope, event } of await listSettings(request)) {
    await request.put(`${API_BASE}/api/1/notifications/settings/`, { data: { scope, event, enabled: null } })
  }
  await request.put(`${API_BASE}/api/1/me/`, { data: { mail_cadence: 'immediate', notifications_paused: false } })
}

async function asAdmin<T>(browser: Browser, run: (request: APIRequestContext) => Promise<T>): Promise<T> {
  const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' })
  try {
    return await run(context.request)
  }
  finally {
    await context.close()
  }
}

test.beforeEach(async ({ request }) => {
  await resetNotificationPreferences(request)
})

test.afterEach(async ({ request, browser }) => {
  await resetNotificationPreferences(request)
  await asAdmin(browser, request => deleteReuses(request, adminReuses))
  await deleteDatasets(request, createdDatasets)
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

test('a follow button keeps telling and changing the follow during a pause', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test pause ${uniqueId}`, 'Dataset pour tester le suivi en pause')
  createdDatasets.push(dataset.id)
  await request.put(`${API_BASE}/api/1/me/`, { data: { notifications_paused: true } })

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions`)

  // The owner hears about the discussions of their dataset, pause aside.
  await page.getByRole('button', { name: 'Ne plus suivre les discussions' }).click()
  await expect(page.getByText('Vous ne serez plus prévenu')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Suivre les discussions' })).toBeVisible()
})

test('the menu of a notification says why it came and turns it off', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test cloche ${uniqueId}`, 'Dataset pour tester le menu de la cloche')
  createdDatasets.push(dataset.id)
  const reuseTitle = `Réutilisation de la cloche ${uniqueId}`
  // A reuse of one's dataset is announced at once, without any worker.
  await asAdmin(browser, async (admin) => {
    const response = await admin.post(`${API_BASE}/api/1/reuses/`, {
      data: {
        title: reuseTitle,
        url: `https://example.org/cloche-${uniqueId}`,
        description: 'Réutilisation créée par les tests end to end',
        type: 'application',
        topic: 'transport_and_mobility',
        datasets: [dataset.id],
      },
    })
    adminReuses.push((await response.json()).id)
  })

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
