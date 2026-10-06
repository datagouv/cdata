import type { APIRequestContext } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, deleteDatasets, gotoHydrated } from '../helpers'

type ApiNotificationSetting = {
  id: string
  scope: { class: string, id: string } | null
  category: string
  channel: string
  enabled: boolean
}

// Every test here reads and writes the decisions of the same logged-in user.
test.describe.configure({ mode: 'serial' })

const createdDatasets: Array<string> = []

async function listSettings(request: APIRequestContext): Promise<Array<ApiNotificationSetting>> {
  const response = await request.get(`${API_BASE}/api/1/notifications/settings/`)
  return await response.json()
}

async function resetNotificationPreferences(request: APIRequestContext) {
  for (const setting of await listSettings(request)) {
    await request.delete(`${API_BASE}/api/1/notifications/settings/${setting.id}/`)
  }
  await request.put(`${API_BASE}/api/1/me/`, { data: { mail_cadence: 'immediate' } })
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

  await page.getByLabel('Une fois par semaine').check()
  await expect(page.getByText('Fréquence des e-mails enregistrée')).toBeVisible()

  const me = await (await request.get(`${API_BASE}/api/1/me/`)).json()
  expect(me.mail_cadence).toBe('weekly')

  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.getByLabel('Une fois par semaine')).toBeChecked()
})

test('a global decision is saved and can be withdrawn', async ({ page, request }) => {
  await gotoHydrated(page, '/admin/me/notifications')

  const everywhere = page.getByRole('row', { name: /Partout/ })
  const discussionsByMail = everywhere.getByRole('combobox', { name: 'Discussions, par e-mail' })

  await discussionsByMail.selectOption({ label: 'Désactivées' })
  await expect(page.getByText('Préférence enregistrée')).toBeVisible()

  expect(await listSettings(request)).toEqual([
    expect.objectContaining({ scope: null, category: 'discussions', channel: 'mail', enabled: false }),
  ])

  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(discussionsByMail).toHaveValue(/false/)

  await discussionsByMail.selectOption({ label: 'Par défaut' })
  await expect.poll(() => listSettings(request)).toEqual([])
})

test('a discussion can be followed from its thread and shows up in the settings', async ({ page, request }) => {
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

  await page.getByRole('button', { name: 'Notifications de cette discussion' }).click()
  await page.getByRole('menuitem', { name: /Suivre la discussion/ }).click()
  await expect(page.getByText('Vous suivez cette discussion').first()).toBeVisible()

  const followed = await listSettings(request)
  expect(followed).toHaveLength(2)
  for (const channel of ['app', 'mail']) {
    expect(followed).toContainEqual(expect.objectContaining({
      scope: { class: 'Discussion', id: discussion.id },
      category: 'discussions',
      channel,
      enabled: true,
    }))
  }

  await gotoHydrated(page, '/admin/me/notifications')
  const row = page.getByRole('row', { name: new RegExp(`Discussion à suivre ${uniqueId}`) })
  await expect(row.getByRole('link', { name: `Discussion à suivre ${uniqueId}` })).toHaveAttribute('href', new RegExp(`/discussions\\?discussion_id=${discussion.id}$`))
  await expect(row.getByRole('combobox', { name: 'Discussions, dans l\'application' })).toHaveValue(/true/)
  await expect(row.getByRole('combobox', { name: 'Discussions, par e-mail' })).toHaveValue(/true/)

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions?discussion_id=${discussion.id}`)
  await page.getByRole('button', { name: 'Vous suivez cette discussion' }).click()
  await page.getByRole('menuitem', { name: /Par défaut/ }).click()
  await expect.poll(() => listSettings(request)).toEqual([])
  await expect(page.getByRole('button', { name: 'Notifications de cette discussion' })).toBeVisible()
})
