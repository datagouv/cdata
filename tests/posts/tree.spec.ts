import { test, expect } from '../base'
import { createPost, deletePosts, gotoHydrated } from '../helpers'
import { createMarkdownPost, fillPostContent, fillPostDescription, saveNewPost } from './helpers'

test.describe('Pages tree', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  test('a sub-page lives under its parent path, with a breadcrumb to it', async ({ page, request }) => {
    const uniqueId = Date.now()
    const parent = await createPost(request, { name: `Parent ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(parent.id)
    const child = await createPost(request, { name: `Enfant ${uniqueId}`, content: 'Contenu', kind: 'page', parent: parent.id })
    createdIds.push(child.id)

    await page.goto(`/pages/${parent.slug}/${child.slug}`)
    await expect(page.getByRole('heading', { level: 1, name: child.name })).toBeVisible()
    await expect(page.getByRole('link', { name: parent.name })).toHaveAttribute('href', `/pages/${parent.slug}`)

    // The /posts URL of a page, and a path that misses its parent, are redirected by the
    // server to the canonical one
    for (const url of [`/posts/${child.slug}`, `/pages/${child.slug}`]) {
      const response = await request.get(url, { maxRedirects: 0 })
      expect(response.status()).toBe(301)
      expect(response.headers().location).toContain(`/pages/${parent.slug}/${child.slug}`)
    }
  })

  test('a full page blocs sub-page shows the breadcrumb of its parents, without header', async ({ page, request }) => {
    const uniqueId = Date.now()
    const parent = await createPost(request, { name: `Parent ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(parent.id)
    const child = await createPost(request, { name: `Enfant blocs ${uniqueId}`, kind: 'page', body_type: 'blocs', blocs: [], parent: parent.id })
    createdIds.push(child.id)

    await page.goto(`/pages/${parent.slug}/${child.slug}`)
    await expect(page.getByRole('link', { name: parent.name })).toHaveAttribute('href', `/pages/${parent.slug}`)
    await expect(page.getByRole('heading', { level: 1, name: child.name })).not.toBeVisible()
  })

  test('the parent picked in the form puts the page under it', async ({ page, request }) => {
    const uniqueId = Date.now()
    const parent = await createPost(request, { name: `Parent ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(parent.id)

    const childId = await createMarkdownPost(page, {
      title: `Enfant ${uniqueId}`,
      headline: 'Une sous-page',
      kind: 'page',
      parentName: parent.name,
      content: 'Contenu de la sous-page',
    })
    createdIds.push(childId)

    const response = await request.get(`/posts/${childId}`, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toMatch(new RegExp(`/pages/${parent.slug}/enfant-${uniqueId}$`))
  })

  test('the parent picker of a page proposes neither the page nor its sub-pages', async ({ page, request }) => {
    const uniqueId = Date.now()
    const parent = await createPost(request, { name: `Parent ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(parent.id)
    const child = await createPost(request, { name: `Enfant ${uniqueId}`, content: 'Contenu', kind: 'page', parent: parent.id })
    createdIds.push(child.id)
    const other = await createPost(request, { name: `Autre ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(other.id)

    await gotoHydrated(page, `/admin/posts/${parent.id}`)
    await page.getByTestId('searchable-select-page-parente').click()
    await page.getByPlaceholder('Aucune, la page est à la racine').fill(String(uniqueId))

    // The other page shows the suggestions are loaded
    await expect(page.getByRole('option', { name: new RegExp(other.name) })).toBeVisible()
    await expect(page.getByRole('option', { name: new RegExp(parent.name) })).toHaveCount(0)
    await expect(page.getByRole('option', { name: new RegExp(child.name) })).toHaveCount(0)
  })

  test('switching a page back to a news drops the parent picked for it', async ({ page, request }) => {
    const uniqueId = Date.now()
    const parent = await createPost(request, { name: `Parent ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(parent.id)

    // Saving lands on the admin page only if the API accepted the news, which it refuses with a parent
    await fillPostDescription(page, {
      title: `Actualité ${uniqueId}`,
      headline: 'Une actualité',
      kind: 'page',
      parentName: parent.name,
    })
    await page.getByText('Actualité', { exact: true }).click()
    await fillPostContent(page, 'Contenu de l\'actualité')
    const newsId = await saveNewPost(page)
    createdIds.push(newsId)

    const response = await request.get(`/posts/${newsId}`, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toMatch(new RegExp(`/posts/actualite-${uniqueId}$`))
  })
})
