import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createPost, deletePosts, gotoHydrated } from '../helpers'
import { fillPostDescription } from './helpers'

async function createPostWithBlocs(page: Page, options: {
  title: string
  headline: string
  kind?: 'news' | 'page'
}) {
  await fillPostDescription(page, { ...options, bodyType: 'blocs' })
  await page.getByRole('button', { name: 'Suivant' }).click()
  // A page lands on its /pages URL, a news on its /posts one
  await expect(page).toHaveURL(/\/(pages|posts)\/[a-z0-9-]+\?edit=true/, { timeout: 10000 })

  const url = page.url()
  const postSlug = url.match(/\/(?:pages|posts)\/([a-z0-9-]+)\?/)?.[1]

  let postId: string | undefined
  if (postSlug) {
    const response = await page.request.get(`${API_BASE}/api/1/posts/${postSlug}/`)
    const postData = await response.json()
    postId = postData.id
  }

  return { postSlug, postId }
}

async function addHeroBlocAndSave(page: Page, title: string) {
  await page.getByRole('button', { name: 'Ajouter une section' }).first().click()
  await page.getByTestId('add-bloc-HeroBloc').click()

  const heroTitle = page.locator('.bg-new-blue-illustration [contenteditable="true"]').first()
  await heroTitle.click()
  await heroTitle.fill(title)
  await page.mouse.click(1, 1)

  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page.getByText('Page créée').or(page.getByText('Page sauvegardée'))).toBeVisible()
}

test.describe('Post with blocs', () => {
  let postId: string | undefined

  test.afterEach(async ({ request }) => {
    if (postId) {
      await request.delete(`${API_BASE}/api/1/posts/${postId}/`)
      postId = undefined
    }
  })

  test('creating a post with blocs redirects to the page editor', async ({ page }) => {
    const uniqueId = Date.now()
    const result = await createPostWithBlocs(page, {
      title: `Test Blocs ${uniqueId}`,
      headline: 'Un article avec blocs',
    })
    postId = result.postId

    await expect(page.getByRole('button', { name: 'Ajouter une section' })).toBeVisible()
  })

  test('page + blocs displays full page without header', async ({ page }) => {
    const uniqueId = Date.now()
    const result = await createPostWithBlocs(page, {
      title: `Test Full Page ${uniqueId}`,
      headline: 'A full page post',
      kind: 'page',
    })
    postId = result.postId

    await addHeroBlocAndSave(page, 'Full page content')

    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')

    // Full page mode: no breadcrumb, no title
    await expect(page.locator('nav').filter({ hasText: 'Accueil' })).not.toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: `Test Full Page ${uniqueId}` })).not.toBeVisible()
    await expect(page.getByText('Full page content')).toBeVisible()
  })

  test('news + blocs displays with header and breadcrumb', async ({ page }) => {
    const uniqueId = Date.now()
    const result = await createPostWithBlocs(page, {
      title: `Test News Blocs ${uniqueId}`,
      headline: 'A news post with blocs',
      kind: 'news',
    })
    postId = result.postId

    await addHeroBlocAndSave(page, 'News content')

    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')

    // News mode: breadcrumb, title, headline visible
    await expect(page.getByText('Accueil').first()).toBeVisible()
    await expect(page.getByText('Articles')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: `Test News Blocs ${uniqueId}` })).toBeVisible()
    await expect(page.getByText('A news post with blocs')).toBeVisible()
    await expect(page.getByText('News content')).toBeVisible()
  })

  test('a section added in the editor holds its blocs and is saved', async ({ page }) => {
    const uniqueId = Date.now()
    const result = await createPostWithBlocs(page, {
      title: `Test Section ${uniqueId}`,
      headline: 'A page with a section',
      kind: 'page',
    })
    postId = result.postId

    await page.getByRole('button', { name: 'Ajouter une section' }).first().click()
    await page.getByTestId('add-bloc-SectionBloc').click()
    await page.getByTestId('add-bloc-in-section').click()
    await page.getByTestId('add-bloc-TitleBloc').click()

    const title = page.getByTestId('bloc-TitleBloc').locator('[contenteditable="true"]').first()
    await title.click()
    await title.fill('Titre de la section')
    await page.mouse.click(1, 1)

    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.getByText('Page sauvegardée')).toBeVisible()

    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('page-SectionBloc').getByRole('heading', { level: 2, name: 'Titre de la section' })).toBeVisible()
  })
})

test.describe('Sections and grids', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  test('a section keeps its blocs on one band and a grid lays its cells out by width', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, {
      name: `Sections ${uniqueId}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [
        {
          class: 'SectionBloc',
          id: crypto.randomUUID(),
          blocs: [
            { class: 'TitleBloc', id: crypto.randomUUID(), title: 'Première section', subtitle: 'Son sous-titre' },
            {
              class: 'GridBloc',
              id: crypto.randomUUID(),
              cells: [
                { id: crypto.randomUUID(), width: '1/3', blocs: [{ class: 'MarkdownBloc', id: crypto.randomUUID(), content: 'Cellule étroite' }] },
                { id: crypto.randomUUID(), width: '2/3', blocs: [{ class: 'MarkdownBloc', id: crypto.randomUUID(), content: 'Cellule large' }] },
              ],
            },
          ],
        },
        {
          class: 'SectionBloc',
          id: crypto.randomUUID(),
          blocs: [{ class: 'MarkdownBloc', id: crypto.randomUUID(), content: 'Seconde section' }],
        },
      ],
    })
    createdIds.push(post.id)

    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}`)

    const sections = page.getByTestId('page-SectionBloc')
    await expect(sections).toHaveCount(2)
    await expect(sections.first().getByRole('heading', { level: 2, name: 'Première section' })).toBeVisible()
    await expect(sections.first().getByText('Son sous-titre')).toBeVisible()
    await expect(sections.last().getByText('Seconde section')).toBeVisible()

    // The two sections alternate their background
    const backgrounds = await sections.evaluateAll(elements => elements.map(element => getComputedStyle(element).backgroundColor))
    expect(backgrounds[0]).not.toBe(backgrounds[1])

    // Cells share a row, the 2/3 one being twice as wide as the 1/3 one
    const narrow = await sections.first().getByTestId('grid-cell').nth(0).boundingBox()
    const wide = await sections.first().getByTestId('grid-cell').nth(1).boundingBox()
    expect(narrow && wide).toBeTruthy()
    expect(Math.abs(narrow!.y - wide!.y)).toBeLessThan(1)
    expect(wide!.width / narrow!.width).toBeGreaterThan(1.8)
    expect(wide!.width / narrow!.width).toBeLessThan(2.3)

    // Below `sm`, every cell takes the full width
    await page.setViewportSize({ width: 400, height: 900 })
    const narrowMobile = await sections.first().getByTestId('grid-cell').nth(0).boundingBox()
    const wideMobile = await sections.first().getByTestId('grid-cell').nth(1).boundingBox()
    expect(narrowMobile!.width).toBeCloseTo(wideMobile!.width, 0)
    expect(wideMobile!.y).toBeGreaterThan(narrowMobile!.y)
  })
})
