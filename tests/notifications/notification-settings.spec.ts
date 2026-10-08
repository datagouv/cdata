import type { APIRequestContext, Browser, Locator, Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, createDiscussion, deleteDatasets, gotoHydrated, listSettings, openNotifications, setRule, withAccount } from '../helpers'
import type { NotificationEvent, NotificationScope } from '../../types/notifications'

// The admin account is shared with every other spec, and with the other browser when run
// locally: each test only reads and cleans up the rules it wrote on its own subjects, and
// none of them touches the account as a whole (cadence, pause, a type turned off
// anywhere: see the normal-user spec).
test.describe.configure({ mode: 'serial' })

const NORMAL_USER = 'playwright/.auth/normal-user.json'

const createdDatasets: Array<string> = []
const normalUserDatasets: Array<string> = []
// The subjects the test wrote rules about, to withdraw them afterwards.
const touchedScopes = new Set<string>()

async function rulesOn(request: APIRequestContext, scopeId: string) {
  touchedScopes.add(scopeId)
  return (await listSettings(request)).filter(setting => setting.scope?.id === scopeId)
}

// The row of "Contenus suivis" or "Notifications coupées" holding this text.
function ruleRow(page: Page, content: Locator | string) {
  return page.getByRole('listitem').filter(typeof content === 'string' ? { hasText: content } : { has: content })
}

// Fixtures owned by somebody else than the admin, who then hears about nothing of them
// unless they follow it.
function asNormalUser<T>(browser: Browser, run: (request: APIRequestContext) => Promise<T>) {
  return withAccount(browser, NORMAL_USER, run)
}

async function normalUserDataset(browser: Browser, title: string) {
  return asNormalUser(browser, async (normal) => {
    const dataset = await createDataset(normal, title, 'Dataset d\'un autre utilisateur')
    normalUserDatasets.push(dataset.id)
    return dataset
  })
}

function openDiscussion(request: APIRequestContext, datasetId: string, title: string) {
  return createDiscussion(request, { class: 'Dataset', id: datasetId }, title)
}

function putRule(request: APIRequestContext, scope: NotificationScope, event: NotificationEvent | null, enabled: boolean) {
  touchedScopes.add(scope.id)
  return setRule(request, { scope, event }, enabled)
}

test.afterEach(async ({ request, browser }) => {
  for (const { scope, event } of await listSettings(request)) {
    if (scope && touchedScopes.has(scope.id)) await setRule(request, { scope, event }, null)
  }
  touchedScopes.clear()
  await deleteDatasets(request, createdDatasets)
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
  await expect(page.getByText(`Vous ne suivez plus la discussion « Discussion à suivre ${uniqueId} »`)).toBeVisible()
  await expect.poll(() => rulesOn(request, discussion.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Discussion', id: discussion.id }, event: 'discussion', enabled: false }),
  ])
  await expect(page.getByTitle('Suivre cette discussion', { exact: true })).toBeEnabled()

  await gotoHydrated(page, '/admin/me/notifications')
  const link = page.getByRole('link', { name: `Discussion à suivre ${uniqueId}` })
  await expect(link).toHaveAttribute('href', new RegExp(`discussion_id=${discussion.id}`))
  await expect(ruleRow(page, link)).toContainText('Vous ne recevez rien sur cette discussion')
  await ruleRow(page, link).getByRole('button', { name: 'Réactiver' }).click()
  await expect(page.getByText('Notifications réactivées')).toBeVisible()
  await expect.poll(() => rulesOn(request, discussion.id)).toEqual([])
})

test('stopping a thread one followed only withdraws the follow', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const dataset = await normalUserDataset(browser, `Test fil suivi ${uniqueId}`)
  const discussion = await asNormalUser(browser, normal => openDiscussion(normal, dataset.id, `Fil à suivre ${uniqueId}`))

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions?discussion_id=${discussion.id}`)

  await page.getByTitle('Suivre cette discussion', { exact: true }).click()
  await expect(page.getByText('Vous suivez cette discussion')).toBeVisible()
  await expect.poll(() => rulesOn(request, discussion.id)).toEqual([
    expect.objectContaining({ event: 'discussion', enabled: true }),
  ])

  // Nothing but this follow brought the thread in: no "no" is left behind.
  await page.getByTitle('Ne plus suivre cette discussion').click()
  await expect(page.getByText(`Vous ne suivez plus la discussion « Fil à suivre ${uniqueId} »`)).toBeVisible()
  await expect.poll(() => rulesOn(request, discussion.id)).toEqual([])
})

test('the discussions of a subject are followed from their list, each thread showing its own state', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const dataset = await normalUserDataset(browser, `Test liste suivie ${uniqueId}`)
  const followed = await asNormalUser(browser, async (normal) => {
    await openDiscussion(normal, dataset.id, `Fil non suivi ${uniqueId}`)
    return openDiscussion(normal, dataset.id, `Fil suivi ${uniqueId}`)
  })
  await putRule(request, { class: 'Discussion', id: followed.id }, 'discussion', true)

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions`)

  const followedThread = page.locator('article', { hasText: `Fil suivi ${uniqueId}` })
  const otherThread = page.locator('article', { hasText: `Fil non suivi ${uniqueId}` })
  await expect(followedThread.getByTitle('Ne plus suivre cette discussion')).toBeVisible()
  await expect(otherThread.getByTitle('Suivre cette discussion', { exact: true })).toBeEnabled()

  await page.getByRole('button', { name: 'Suivre les discussions', exact: true }).click()
  await expect(page.getByText('Vous serez prévenu des nouvelles discussions')).toBeVisible()
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
  const dataset = await normalUserDataset(browser, `Test encart restreint ${uniqueId}`)
  await putRule(request, { class: 'Dataset', id: dataset.id }, 'discussion.new', true)

  await gotoHydrated(page, `/admin/datasets/${dataset.id}`)

  await expect(page.getByText('Vous recevez seulement : Nouvelles discussions.')).toBeVisible()
  await page.getByRole('button', { name: 'Ne plus recevoir' }).click()
  await expect(page.getByText('Vous ne recevez pas les notifications de ce jeu de données.')).toBeVisible()
  // The admin was concerned by nothing else: withdrawing the follow is enough.
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([])

  await page.getByRole('button', { name: 'Suivre', exact: true }).click()
  await expect(page.getByText('Vous recevez les notifications de ce jeu de données, parce que vous suivez ce contenu.')).toBeVisible()
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([
    expect.objectContaining({ event: null, enabled: true }),
  ])
})

test('a follow restricted to some notifications reads before a no on the whole subject', async ({ page, request, browser }) => {
  // Muted from the box, then the new discussions followed from the list.
  const uniqueId = Date.now()
  const dataset = await normalUserDataset(browser, `Test coupé puis restreint ${uniqueId}`)
  await putRule(request, { class: 'Dataset', id: dataset.id }, null, false)
  await putRule(request, { class: 'Dataset', id: dataset.id }, 'discussion.new', true)

  await gotoHydrated(page, `/admin/datasets/${dataset.id}`)

  await expect(page.getByText('Vous recevez seulement : Nouvelles discussions.')).toBeVisible()
  await expect(page.getByText('Vous avez coupé les notifications')).not.toBeVisible()
})

test('an owner who muted their dataset but its new discussions reads it the same way', async ({ page, request }) => {
  // The role does not bring back what the no took away.
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test propriétaire restreint ${uniqueId}`, 'Dataset de l\'admin, coupé puis restreint')
  createdDatasets.push(dataset.id)
  await putRule(request, { class: 'Dataset', id: dataset.id }, null, false)
  await putRule(request, { class: 'Dataset', id: dataset.id }, 'discussion.new', true)

  await gotoHydrated(page, `/admin/datasets/${dataset.id}`)

  await expect(page.getByText('Vous recevez seulement : Nouvelles discussions.')).toBeVisible()
  await expect(page.getByText('en tant que propriétaire')).not.toBeVisible()
})

test('the link of a thread mail already confirmed offers nothing to confirm', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test fil déjà coupé ${uniqueId}`, 'Dataset pour tester un lien de fil déjà confirmé')
  createdDatasets.push(dataset.id)
  const discussion = await openDiscussion(request, dataset.id, `Fil déjà coupé ${uniqueId}`)
  await putRule(request, { class: 'Discussion', id: discussion.id }, 'discussion', false)

  await gotoHydrated(page, `/admin/me/notifications?scope=Discussion:${discussion.id}&event=discussion`)

  await expect(page.getByText(`Vous ne suivez déjà plus la discussion « Fil déjà coupé ${uniqueId} ».`)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmer' })).not.toBeVisible()
  await page.getByRole('button', { name: 'Fermer' }).click()
  await expect(page).toHaveURL(/\/admin\/me\/notifications$/)
})

test('a followed subject is unfollowed from the settings page', async ({ page, request }) => {
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test contenu suivi ${uniqueId}`, 'Dataset pour tester la liste des contenus suivis')
  createdDatasets.push(dataset.id)
  await putRule(request, { class: 'Dataset', id: dataset.id }, null, true)

  await gotoHydrated(page, '/admin/me/notifications')
  const link = page.getByRole('link', { name: `Test contenu suivi ${uniqueId}` })
  await expect(link).toBeVisible()

  await ruleRow(page, link).getByRole('button', { name: 'Ne plus suivre' }).click()
  await expect(page.getByText(`Vous ne suivez plus « Test contenu suivi ${uniqueId} »`)).toBeVisible()
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([])
  await expect(link).not.toBeVisible()
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
  await expect(page.getByText(`Vous ne recevrez plus de notifications sur « Test lien de mail ${uniqueId} »`)).toBeVisible()
  await expect.poll(() => rulesOn(request, dataset.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Dataset', id: dataset.id }, event: null, enabled: false }),
  ])
  await expect(page).toHaveURL(/\/admin\/me\/notifications$/)
  // The page lists the rule the banner just wrote.
  await expect(ruleRow(page, page.getByRole('link', { name: `Test lien de mail ${uniqueId}` }))).toContainText('Vous ne recevez rien sur ce jeu de données')
})

test('the link of a mail about what one hears nothing of offers nothing to confirm', async ({ page, request, browser }) => {
  // Followed from a mail, then muted: the same link opened again.
  const uniqueId = Date.now()
  const dataset = await normalUserDataset(browser, `Test lien déjà coupé ${uniqueId}`)

  await gotoHydrated(page, `/admin/me/notifications?scope=Dataset:${dataset.id}`)

  await expect(page.getByText(`Vous ne recevez déjà rien sur « Test lien déjà coupé ${uniqueId} ».`)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmer' })).not.toBeVisible()
  await page.getByRole('button', { name: 'Fermer' }).click()
  await expect(page).toHaveURL(/\/admin\/me\/notifications$/)
  expect(await rulesOn(request, dataset.id)).toEqual([])
})

test('answering in a thread follows it, without reloading the page', async ({ page, browser }) => {
  const uniqueId = Date.now()
  const dataset = await normalUserDataset(browser, `Test réponse ${uniqueId}`)
  const discussion = await asNormalUser(browser, normal => openDiscussion(normal, dataset.id, `Fil rejoint ${uniqueId}`))

  await gotoHydrated(page, `/datasets/${dataset.id}/discussions?discussion_id=${discussion.id}`)
  await expect(page.getByTitle('Suivre cette discussion', { exact: true })).toBeEnabled()

  await page.getByRole('button', { name: 'Répondre' }).first().click()
  await page.getByTestId('producer-select').click()
  await page.getByRole('option', { name: /Admin/ }).first().click()
  await page.getByRole('textbox', { name: /Votre message/ }).fill('Réponse qui fait suivre le fil.')
  await page.getByRole('button', { name: 'Répondre', exact: true }).click()

  await expect(page.getByText('Réponse qui fait suivre le fil.')).toBeVisible()
  await expect(page.getByTitle('Ne plus suivre cette discussion')).toBeVisible()
})

test.describe('when udata cannot say what one hears about', () => {
  test.use({ allowedConsoleMessages: ['net::ERR_FAILED', 'CORS request did not succeed'] })

  test('the box says so and no follow button is offered', async ({ page, request }) => {
    const uniqueId = Date.now()
    const dataset = await createDataset(request, `Test échec ${uniqueId}`, 'Dataset pour tester l\'échec des notifications')
    createdDatasets.push(dataset.id)
    await page.route('**/api/1/notifications/resolved/**', route => route.abort())

    await gotoHydrated(page, `/admin/datasets/${dataset.id}`)
    await expect(page.getByText(/Vos notifications sur ce jeu de données n'ont pas pu être chargées/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ne plus recevoir' })).not.toBeVisible()

    await gotoHydrated(page, `/datasets/${dataset.id}/discussions`)
    // Control: the list itself is there, only the button stays away.
    await expect(page.getByText('Il n\'y a pas encore de discussion')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Suivre les discussions' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Ne plus suivre les discussions' })).not.toBeVisible()
  })
})

test('the link of a discussion mail stops following the thread once confirmed', async ({ page, request }) => {
  // What every discussion mail offers first.
  const uniqueId = Date.now()
  const dataset = await createDataset(request, `Test lien de fil ${uniqueId}`, 'Dataset pour tester les liens des mails de discussion')
  createdDatasets.push(dataset.id)
  const discussion = await openDiscussion(request, dataset.id, `Fil du mail ${uniqueId}`)

  await gotoHydrated(page, `/admin/me/notifications?scope=Discussion:${discussion.id}&event=discussion`)

  await expect(page.getByText(`Ne plus suivre la discussion « Fil du mail ${uniqueId} » ?`)).toBeVisible()
  expect(await rulesOn(request, discussion.id)).toEqual([])

  await page.getByRole('button', { name: 'Confirmer' }).click()
  await expect(page.getByText(`Vous ne suivez plus la discussion « Fil du mail ${uniqueId} »`)).toBeVisible()
  await expect.poll(() => rulesOn(request, discussion.id)).toEqual([
    expect.objectContaining({ scope: { class: 'Discussion', id: discussion.id }, event: 'discussion', enabled: false }),
  ])
})

test('the link of a mail about a type of notification can be dismissed', async ({ page, request }) => {
  await gotoHydrated(page, '/admin/me/notifications?event=discussion.comment')

  await expect(page.getByText('Ne plus recevoir : Réponses aux discussions ?')).toBeVisible()
  await page.getByRole('button', { name: 'Annuler' }).click()

  await expect(page).toHaveURL(/\/admin\/me\/notifications$/)
  await expect(page.getByRole('button', { name: 'Confirmer' })).not.toBeVisible()
  expect((await listSettings(request)).filter(setting => setting.scope === null && setting.event === 'discussion.comment')).toEqual([])
})

test('a link naming no known type shows nothing of what it says', async ({ page }) => {
  await gotoHydrated(page, `/admin/me/notifications?event=${encodeURIComponent('Votre compte est suspendu, appelez le 01 23 45 67 89')}`)

  await expect(page.getByRole('heading', { name: 'Contenus suivis' })).toBeVisible()
  await expect(page.getByText('Votre compte est suspendu')).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmer' })).not.toBeVisible()
})

test('a notification asking for an action offers no way out', async ({ page, request, browser }) => {
  const uniqueId = Date.now()
  const me = await (await request.get(`${API_BASE}/api/1/me/`)).json()
  const dataset = await normalUserDataset(browser, `Test transfert ${uniqueId}`)
  await asNormalUser(browser, normal => normal.post(`${API_BASE}/api/1/transfer/`, {
    data: {
      subject: { class: 'Dataset', id: dataset.id },
      recipient: { class: 'User', id: me.id },
      comment: 'Transfert créé par les tests end to end',
    },
  }))

  await gotoHydrated(page, '/')
  await openNotifications(page)
  const notifications = page.getByRole('list', { name: 'Notifications' })

  const transfer = notifications.getByRole('listitem').filter({ hasText: 'Demande de transfert' }).filter({ hasText: 'Normal User' })
  await expect(transfer.first()).toBeVisible()
  await expect(transfer.first().getByTitle('Pourquoi je reçois ça ?')).toHaveCount(0)
})
