import type { APIRequestContext, Locator, Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, deleteDatasets, gotoHydrated } from '../helpers'

type ApiNotificationSetting = {
  id: string
  scope: { class: string, id: string } | null
  event: string | null
  enabled: boolean
}

// Every test here reads and writes the rules of the same logged-in user.
test.describe.configure({ mode: 'serial' })

const createdDatasets: Array<string> = []

async function listSettings(request: APIRequestContext): Promise<Array<ApiNotificationSetting>> {
  const response = await request.get(`${API_BASE}/api/1/notifications/settings/`)
  return await response.json()
}

// The row of "Contenus suivis" or "Notifications coupées" holding this link, with its button.
function ruleRow(page: Page, link: Locator) {
  return page.locator('div.px-5.py-3', { has: link })
}

async function resetNotificationPreferences(request: APIRequestContext) {
  for (const { scope, event } of await listSettings(request)) {
    await request.put(`${API_BASE}/api/1/notifications/settings/`, {
      data: { scope, event, enabled: null },
    })
  }
  await request.put(`${API_BASE}/api/1/me/`, { data: { mail_cadence: 'immediate', notifications_paused: false } })
}

test.beforeEach(async ({ request }) => {
  await resetNotificationPreferences(request)
})

test.afterEach(async ({ request }) => {
  await resetNotificationPreferences(request)
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

test('a discussion is muted from its thread and reactivated from the settings', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test suivi de discussion ${uniqueId}`, 'Dataset pour tester le suivi des discussions')
  createdDatasets.push(dataset.id)
  const discussion = await (await request.post(`${API_BASE}/api/1/discussions/`, {
    data: {
      subject: { class: 'Dataset', id: dataset.id },
      title: `Discussion à suivre ${uniqueId}`,
      comment: 'Premier message de la discussion.',
    },
  })).json()

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions?discussion_id=${discussion.id}`)

  // The owner of the dataset hears about its threads without having followed them.
  await page.getByTitle('Ne plus suivre cette discussion').click()
  await expect(page.getByText('Vous ne serez plus prévenu')).toBeVisible()
  await expect.poll(() => listSettings(request)).toEqual([
    expect.objectContaining({ scope: { class: 'Discussion', id: discussion.id }, event: 'discussion', enabled: false }),
  ])
  await expect(page.getByTitle('Suivre cette discussion')).toBeVisible()

  await gotoHydrated(page, '/admin/me/notifications')
  const link = page.getByRole('link', { name: `Discussion à suivre ${uniqueId}` })
  await expect(link).toHaveAttribute('href', new RegExp(`discussion_id=${discussion.id}`))
  await ruleRow(page, link).getByRole('button', { name: 'Réactiver' }).click()
  await expect(page.getByText('Notifications réactivées')).toBeVisible()
  await expect.poll(() => listSettings(request)).toEqual([])
})

test('a followed subject is unfollowed from the settings page', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test contenu suivi ${uniqueId}`, 'Dataset pour tester la liste des contenus suivis')
  createdDatasets.push(dataset.id)
  await request.put(`${API_BASE}/api/1/notifications/settings/`, {
    data: { scope: { class: 'Dataset', id: dataset.id }, enabled: true },
  })

  await gotoHydrated(page, '/admin/me/notifications')
  const link = page.getByRole('link', { name: `Test contenu suivi ${uniqueId}` })
  await expect(link).toBeVisible()

  await ruleRow(page, link).getByRole('button', { name: 'Ne plus suivre' }).click()
  await expect(page.getByText('Vous ne suivez plus ce contenu')).toBeVisible()
  await expect.poll(() => listSettings(request)).toEqual([])
  await expect(link).not.toBeVisible()
})

test('the link of a mail only mutes its subject once confirmed', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test lien de mail ${uniqueId}`, 'Dataset pour tester les liens des mails')
  createdDatasets.push(dataset.id)

  await gotoHydrated(page, `/admin/me/notifications?scope=Dataset:${dataset.id}`)

  // Opening the link writes nothing: a mail scanner opening it must not unsubscribe anyone.
  await expect(page.getByText(`Ne plus rien recevoir sur « Test lien de mail ${uniqueId} » ?`)).toBeVisible()
  expect(await listSettings(request)).toEqual([])

  await page.getByRole('button', { name: 'Confirmer' }).click()
  await expect(page.getByText('Vous ne recevrez plus de notifications sur ce contenu')).toBeVisible()
  await expect.poll(() => listSettings(request)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: null, enabled: false }),
  ])
  await expect(page).toHaveURL(/\/admin\/me\/notifications$/)
})

test('the link of a mail about a type of notification can be dismissed', async ({ page, request }) => {
  await gotoHydrated(page, '/admin/me/notifications?event=discussion.comment')

  await expect(page.getByText('Ne plus recevoir : Réponses aux discussions ?')).toBeVisible()
  await page.getByRole('button', { name: 'Annuler' }).click()

  await expect(page).toHaveURL(/\/admin\/me\/notifications$/)
  await expect(page.getByRole('button', { name: 'Confirmer' })).not.toBeVisible()
  expect(await listSettings(request)).toEqual([])
})
