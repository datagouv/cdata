import type { APIRequestContext, Browser, Locator, Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, createOrganization, deleteDatasets, deleteOrganizations, gotoHydrated } from '../helpers'

type ApiNotificationSetting = {
  id: string
  scope: { class: string, id: string } | null
  event: string | null
  enabled: boolean
}

// The admin account is shared with every other spec, and with the other browser when run
// locally: each test only reads and cleans up the rules it wrote, never the whole list,
// and none of them touches the account itself (cadence, pause: see the normal-user spec).
test.describe.configure({ mode: 'serial' })

const createdDatasets: Array<string> = []
const createdOrganizations: Array<string> = []
const normalUserDatasets: Array<string> = []
// The subjects and the types the test wrote rules about, to withdraw them afterwards.
const touchedScopes = new Set<string>()
const touchedEvents = new Set<string>()

async function listSettings(request: APIRequestContext): Promise<Array<ApiNotificationSetting>> {
  const response = await request.get(`${API_BASE}/api/1/notifications/settings/`)
  return await response.json()
}

async function rulesOn(request: APIRequestContext, scopeId: string) {
  touchedScopes.add(scopeId)
  return (await listSettings(request)).filter(setting => setting.scope?.id === scopeId)
}

async function rulesAbout(request: APIRequestContext, event: string) {
  touchedEvents.add(event)
  return (await listSettings(request)).filter(setting => setting.scope === null && setting.event === event)
}

// The row of "Contenus suivis" or "Notifications coupées" holding this text.
function ruleRow(page: Page, content: Locator | string) {
  return page.getByRole('listitem').filter(typeof content === 'string' ? { hasText: content } : { has: content })
}

// Fixtures owned by somebody else than the admin, who then hears about nothing of them
// unless they follow it.
async function asNormalUser<T>(browser: Browser, run: (request: APIRequestContext) => Promise<T>): Promise<T> {
  const context = await browser.newContext({ storageState: 'playwright/.auth/normal-user.json' })
  try {
    return await run(context.request)
  }
  finally {
    await context.close()
  }
}

async function openDiscussion(request: APIRequestContext, datasetId: string, title: string) {
  const response = await request.post(`${API_BASE}/api/1/discussions/`, {
    data: { subject: { class: 'Dataset', id: datasetId }, title, comment: 'Premier message de la discussion.' },
  })
  return await response.json() as { id: string }
}

test.afterEach(async ({ request, browser }) => {
  for (const { scope, event } of await listSettings(request)) {
    if ((scope && touchedScopes.has(scope.id)) || (!scope && event && touchedEvents.has(event))) {
      await request.put(`${API_BASE}/api/1/notifications/settings/`, { data: { scope, event, enabled: null } })
    }
  }
  touchedScopes.clear()
  touchedEvents.clear()
  await deleteDatasets(request, createdDatasets)
  await deleteOrganizations(request, createdOrganizations)
  await asNormalUser(browser, request => deleteDatasets(request, normalUserDatasets))
})

test('a discussion is muted from its thread and reactivated from the settings', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test suivi de discussion ${uniqueId}`, 'Dataset pour tester le suivi des discussions')
  createdDatasets.push(dataset.id)
  const discussion = await openDiscussion(request, dataset.id, `Discussion à suivre ${uniqueId}`)

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions?discussion_id=${discussion.id}`)

  // The owner of the dataset hears about its threads without having followed them.
  await page.getByTitle('Ne plus suivre cette discussion').click()
  await expect(page.getByText('Vous ne serez plus prévenu')).toBeVisible()
  await expect.poll(() => rulesOn(request, discussion.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Discussion', id: discussion.id }, event: 'discussion', enabled: false }),
  ])
  await expect(page.getByTitle('Suivre cette discussion')).toBeVisible()

  await gotoHydrated(page, '/admin/me/notifications')
  const link = page.getByRole('link', { name: `Discussion à suivre ${uniqueId}` })
  await expect(link).toHaveAttribute('href', new RegExp(`discussion_id=${discussion.id}`))
  await ruleRow(page, link).getByRole('button', { name: 'Réactiver' }).click()
  await expect(page.getByText('Notifications réactivées')).toBeVisible()
  await expect.poll(() => rulesOn(request, discussion.id)).toEqual([])
})

test('stopping a thread one followed only withdraws the follow', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const { dataset, discussion } = await asNormalUser(browser, async (normal) => {
    const dataset = await createDataset(normal, `Test fil suivi ${uniqueId}`, 'Dataset d\'un autre utilisateur')
    normalUserDatasets.push(dataset.id)
    return { dataset, discussion: await openDiscussion(normal, dataset.id, `Fil à suivre ${uniqueId}`) }
  })

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions?discussion_id=${discussion.id}`)

  await page.getByTitle('Suivre cette discussion').click()
  await expect(page.getByText('Vous serez prévenu', { exact: true })).toBeVisible()
  await expect.poll(() => rulesOn(request, discussion.id)).toEqual([
    expect.objectContaining({ event: 'discussion', enabled: true }),
  ])

  // Nothing but this follow brought the thread in: no "no" is left behind.
  await page.getByTitle('Ne plus suivre cette discussion').click()
  await expect(page.getByText('Vous ne serez plus prévenu')).toBeVisible()
  await expect.poll(() => rulesOn(request, discussion.id)).toEqual([])
})

test('the discussions of a subject are followed from their list, each thread showing its own state', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const { dataset, followed } = await asNormalUser(browser, async (normal) => {
    const dataset = await createDataset(normal, `Test liste suivie ${uniqueId}`, 'Dataset d\'un autre utilisateur')
    normalUserDatasets.push(dataset.id)
    await openDiscussion(normal, dataset.id, `Fil non suivi ${uniqueId}`)
    return { dataset, followed: await openDiscussion(normal, dataset.id, `Fil suivi ${uniqueId}`) }
  })
  await request.put(`${API_BASE}/api/1/notifications/settings/`, {
    data: { scope: { class: 'Discussion', id: followed.id }, event: 'discussion', enabled: true },
  })
  touchedScopes.add(followed.id)

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions`)

  const followedThread = page.locator('article', { hasText: `Fil suivi ${uniqueId}` })
  const otherThread = page.locator('article', { hasText: `Fil non suivi ${uniqueId}` })
  await expect(followedThread.getByTitle('Ne plus suivre cette discussion')).toBeVisible()
  await expect(otherThread.getByTitle('Suivre cette discussion')).toBeVisible()

  await page.getByRole('button', { name: 'Suivre les discussions' }).click()
  await expect(page.getByRole('button', { name: 'Ne plus suivre les discussions' })).toBeVisible()
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: 'discussion.new', enabled: true }),
  ])
})

test('the notification box of a dataset says no, then takes it back', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test encart ${uniqueId}`, 'Dataset pour tester l\'encart des notifications')
  createdDatasets.push(dataset.id)

  await gotoHydrated(page, `/admin/datasets/${dataset.id}`)

  await expect(page.getByText('Vous recevez les notifications de ce jeu de données, en tant que propriétaire.')).toBeVisible()
  await page.getByRole('button', { name: 'Ne plus recevoir' }).click()
  await expect(page.getByText('Vous avez coupé les notifications de ce jeu de données.')).toBeVisible()
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([
    expect.objectContaining({ event: null, enabled: false }),
  ])

  await page.getByRole('button', { name: 'Réactiver' }).click()
  await expect(page.getByText('Vous recevez les notifications de ce jeu de données, en tant que propriétaire.')).toBeVisible()
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([])
})

test('the notification box tells a follow restricted to some notifications, and drops it', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const dataset = await asNormalUser(browser, async (normal) => {
    const dataset = await createDataset(normal, `Test encart restreint ${uniqueId}`, 'Dataset d\'un autre utilisateur')
    normalUserDatasets.push(dataset.id)
    return dataset
  })
  await request.put(`${API_BASE}/api/1/notifications/settings/`, {
    data: { scope: { class: 'Dataset', id: dataset.id }, event: 'discussion.new', enabled: true },
  })
  touchedScopes.add(dataset.id)

  await gotoHydrated(page, `/admin/datasets/${dataset.id}`)

  await expect(page.getByText('Vous recevez seulement : Nouvelles discussions.')).toBeVisible()
  await page.getByRole('button', { name: 'Ne plus recevoir' }).click()
  await expect(page.getByText('Vous ne recevez pas les notifications de ce jeu de données.')).toBeVisible()
  // The admin was concerned by nothing else: withdrawing the follow is enough.
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([])
})

test('a followed subject is unfollowed from the settings page', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test contenu suivi ${uniqueId}`, 'Dataset pour tester la liste des contenus suivis')
  createdDatasets.push(dataset.id)
  await request.put(`${API_BASE}/api/1/notifications/settings/`, {
    data: { scope: { class: 'Dataset', id: dataset.id }, enabled: true },
  })
  touchedScopes.add(dataset.id)

  await gotoHydrated(page, '/admin/me/notifications')
  const link = page.getByRole('link', { name: `Test contenu suivi ${uniqueId}` })
  await expect(link).toBeVisible()

  await ruleRow(page, link).getByRole('button', { name: 'Ne plus suivre' }).click()
  await expect(page.getByText('Vous ne suivez plus ce contenu')).toBeVisible()
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([])
  await expect(link).not.toBeVisible()
})

test('an automatic follow stays stopped when the subject is edited again', async ({ page, request }) => {
  const uniqueId = Date.now()
  const organization = await createOrganization(request, `Test suivi automatique ${uniqueId}`)
  createdOrganizations.push(organization.id)
  // Creating a dataset of one's organization by hand follows it.
  const dataset = await createDataset(request, `Test suivi automatique ${uniqueId}`, 'Dataset pour tester l\'arrêt d\'un suivi automatique', { organization: organization.id })
  createdDatasets.push(dataset.id)

  await gotoHydrated(page, '/admin/me/notifications')
  const link = page.getByRole('link', { name: `Test suivi automatique ${uniqueId}` })
  await expect(ruleRow(page, link)).toContainText('Suivi automatique : vous l\'avez modifié')
  await ruleRow(page, link).getByRole('button', { name: 'Ne plus suivre' }).click()
  await expect(page.getByText('Vous ne suivez plus ce contenu')).toBeVisible()

  await request.put(`${API_BASE}/api/1/datasets/${dataset.id}/`, { data: { description: 'Modifié après l\'arrêt du suivi' } })

  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: null, enabled: false }),
  ])
})

test('a type turned off anywhere is listed and reactivated', async ({ page, request }) => {
  await request.put(`${API_BASE}/api/1/notifications/settings/`, {
    data: { scope: null, event: 'organization.badge.certified', enabled: false },
  })
  touchedEvents.add('organization.badge.certified')

  await gotoHydrated(page, '/admin/me/notifications')

  // The five badge types read as badges.
  const row = ruleRow(page, 'Vous ne recevez plus ce type de notification').filter({ hasText: 'Badges de l\'organisation' })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: 'Réactiver' }).click()
  await expect(page.getByText('Notifications réactivées')).toBeVisible()
  await expect.poll(() => rulesAbout(request, 'organization.badge.certified')).toEqual([])
})

test('the link of a mail only mutes its subject once confirmed', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test lien de mail ${uniqueId}`, 'Dataset pour tester les liens des mails')
  createdDatasets.push(dataset.id)

  await gotoHydrated(page, `/admin/me/notifications?scope=Dataset:${dataset.id}`)

  // Opening the link writes nothing: a mail scanner opening it must not unsubscribe anyone.
  await expect(page.getByText(`Ne plus rien recevoir sur « Test lien de mail ${uniqueId} » ?`)).toBeVisible()
  expect(await rulesOn(request, dataset.id)).toEqual([])

  await page.getByRole('button', { name: 'Confirmer' }).click()
  await expect(page.getByText('Vous ne recevrez plus de notifications sur ce contenu')).toBeVisible()
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: null, enabled: false }),
  ])
  await expect(page).toHaveURL(/\/admin\/me\/notifications$/)
  // The page lists the rule the banner just wrote.
  await expect(ruleRow(page, page.getByRole('link', { name: `Test lien de mail ${uniqueId}` }))).toContainText('Vous ne recevez rien sur ce contenu')
})

test('the link of a mail about a type of notification can be dismissed', async ({ page, request }) => {
  await gotoHydrated(page, '/admin/me/notifications?event=discussion.comment')

  await expect(page.getByText('Ne plus recevoir : Réponses aux discussions ?')).toBeVisible()
  await page.getByRole('button', { name: 'Annuler' }).click()

  await expect(page).toHaveURL(/\/admin\/me\/notifications$/)
  await expect(page.getByRole('button', { name: 'Confirmer' })).not.toBeVisible()
  expect(await rulesAbout(request, 'discussion.comment')).toEqual([])
})
