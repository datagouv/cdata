import { test, expect } from '../base'
import { API_BASE, gotoHydrated } from '../helpers'
import { fillNewPostForm } from './helpers'

const createdPosts: Array<string> = []

test.afterEach(async ({ request }) => {
  for (const id of createdPosts.splice(0)) {
    await request.delete(`${API_BASE}/api/1/posts/${id}/`)
  }
})

const newPost = (title: string) => ({ title, headline: 'Un article de test', content: 'Contenu de l\'article' })

test('clicking save again while the post is being created does not create it twice', async ({ page }) => {
  await fillNewPostForm(page, newPost(`Test double création ${Date.now()}`))

  // Hold the creation request so the second click happens while it is in flight
  let createRequests = 0
  let release: () => void = () => {}
  const released = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route(url => url.pathname === '/api/1/posts/', async (route) => {
    if (route.request().method() === 'POST') {
      createRequests++
      await released
    }
    await route.continue()
  })

  const saveButton = page.getByRole('button', { name: 'Sauvegarder' })
  await saveButton.click()
  await expect.poll(() => createRequests).toBe(1)
  await expect(saveButton).toBeDisabled()
  await saveButton.click({ force: true })
  release()

  await expect(page).toHaveURL(/\/admin\/posts\/(?!new)[a-z0-9-]+$/)
  createdPosts.push(page.url().split('/').pop()!)
  expect(createRequests).toBe(1)
})

test.describe('when the cover upload fails', () => {
  test.use({ allowedConsoleMessages: ['the server responded with a status of 413'] })

  test('the created post is opened instead of staying on the creation form', async ({ page }) => {
    await fillNewPostForm(page, newPost(`Test couverture refusée ${Date.now()}`))

    await page.route(/\/api\/1\/posts\/[^/]+\/image\/$/, route => route.fulfill({
      status: 413,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Request Entity Too Large' }),
    }))

    await page.getByRole('button', { name: 'Sauvegarder' }).click()

    await expect(page).toHaveURL(/\/admin\/posts\/(?!new)[a-z0-9-]+$/)
    createdPosts.push(page.url().split('/').pop()!)
  })
})

test('publishing a post keeps the edits not saved yet', async ({ page, request }) => {
  const response = await request.post(`${API_BASE}/api/1/posts/`, {
    data: { name: `Test publication ${Date.now()}`, headline: 'Entête enregistrée', content: 'Contenu', kind: 'news' },
  })
  expect(response.ok()).toBeTruthy()
  const post = await response.json()
  createdPosts.push(post.id)

  await gotoHydrated(page, `/admin/posts/${post.id}`)
  const headline = page.getByRole('textbox', { name: 'Entête' })
  await headline.fill('Entête en cours de saisie')

  await page.getByRole('button', { name: 'Publier', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Dépublier' })).toBeVisible()
  await expect(headline).toHaveValue('Entête en cours de saisie')
})

test('can delete a post from its admin page', async ({ page, request }) => {
  const name = `Test suppression ${Date.now()}`
  const response = await request.post(`${API_BASE}/api/1/posts/`, {
    data: {
      name,
      headline: 'Un article à supprimer',
      content: 'Contenu',
      body_type: 'markdown',
      kind: 'news',
    },
  })
  expect(response.ok()).toBeTruthy()
  const post = await response.json()
  createdPosts.push(post.id)

  await page.goto(`/admin/posts/${post.id}`)
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer l\'article' }).click()

  await expect(page).toHaveURL(/\/admin\/site\/posts$/)
  await expect(page.getByText('Article supprimé !')).toBeVisible()
  await expect(page.getByText(name)).not.toBeVisible()

  const deleted = await request.get(`${API_BASE}/api/1/posts/${post.id}/`)
  expect(deleted.status()).toBe(404)
})
