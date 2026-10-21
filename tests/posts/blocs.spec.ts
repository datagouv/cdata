import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createPost, deletePosts, dragEditItem, focusedDragHandle, gotoHydrated } from '../helpers'
import { fillPostDescription } from './helpers'
import type { GridCellWidth, MarkdownBloc } from '~/types/pages'

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

  function markdown(content: string): MarkdownBloc {
    return { class: 'MarkdownBloc', id: crypto.randomUUID(), content }
  }

  // A section holding a text, then a grid with a text per line of each cell
  async function createGridPage(
    request: Parameters<typeof createPost>[0],
    cells: Array<{ width: GridCellWidth | null, texts: Array<string> }>,
  ) {
    const post = await createPost(request, {
      name: `Grid ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{
        class: 'SectionBloc',
        id: crypto.randomUUID(),
        blocs: [
          markdown('Avant la grille'),
          {
            class: 'GridBloc',
            id: crypto.randomUUID(),
            cells: cells.map(cell => ({ id: crypto.randomUUID(), width: cell.width, blocs: cell.texts.map(markdown) })),
          },
        ],
      }],
    })
    createdIds.push(post.id)
    return post
  }

  async function saveAndFetchBlocs(page: Page, slug: string) {
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.getByText('Page sauvegardée')).toBeVisible()
    const response = await page.request.get(`${API_BASE}/api/1/posts/${slug}/`)
    return (await response.json()).blocs
  }

  test('a bloc is dragged by its handle from a cell to another', async ({ page, request }) => {
    const post = await createGridPage(request, [
      { width: '1/2', texts: ['Gauche A', 'Gauche B'] },
      { width: '1/2', texts: ['Droite'] },
    ])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const cells = page.getByTestId('grid-cell')
    await dragEditItem(cells.nth(0).getByTestId('bloc-MarkdownBloc').first(), cells.nth(1).getByTestId('bloc-MarkdownBloc'))

    await expect(cells.nth(0).getByTestId('bloc-MarkdownBloc')).toHaveCount(1)
    await expect(cells.nth(1).getByTestId('bloc-MarkdownBloc')).toHaveCount(2)

    const [section] = await saveAndFetchBlocs(page, post.slug)
    const [left, right] = section.blocs[1].cells
    expect(left.blocs.map((bloc: { content: string }) => bloc.content)).toEqual(['Gauche B'])
    expect(right.blocs.map((bloc: { content: string }) => bloc.content).sort()).toEqual(['Droite', 'Gauche A'])
  })

  test('a bloc alone in its cell moves up into the section, the cell going with it', async ({ page, request }) => {
    const post = await createGridPage(request, [
      { width: null, texts: ['Seul'] },
      { width: null, texts: ['Droite'] },
    ])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    // The cell holding a single bloc is dragged by its own handle
    await dragEditItem(page.getByTestId('grid-cell').first(), page.getByTestId('bloc-MarkdownBloc').filter({ hasText: 'Avant la grille' }))
    await expect(page.getByTestId('grid-cell')).toHaveCount(1)

    // The text left the grid for the section (next to the text it was dropped on), the
    // grid keeping its other cell
    const [section] = await saveAndFetchBlocs(page, post.slug)
    const texts = section.blocs.filter((bloc: { class: string }) => bloc.class === 'MarkdownBloc')
    expect(texts.map((bloc: { content: string }) => bloc.content).sort()).toEqual(['Avant la grille', 'Seul'])
    const grid = section.blocs.find((bloc: { class: string }) => bloc.class === 'GridBloc')
    expect(grid.cells.map((cell: { blocs: Array<{ content: string }> }) => cell.blocs[0].content)).toEqual(['Droite'])
  })

  test('a bloc dropped on the free space of a row becomes a cell', async ({ page, request }) => {
    const post = await createGridPage(request, [{ width: '1/2', texts: ['Gauche'] }])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const handle = await focusedDragHandle(page.getByTestId('bloc-MarkdownBloc').filter({ hasText: 'Avant la grille' }))
    const from = (await handle.boundingBox())!
    const cell = (await page.getByTestId('grid-cell').first().boundingBox())!
    // On the right half of the row, which the 1/2 cell leaves empty
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(cell.x + cell.width * 1.5, cell.y + cell.height / 2, { steps: 20 })
    await page.mouse.up()
    await expect(page.getByTestId('grid-cell')).toHaveCount(2)

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs.map((bloc: { class: string }) => bloc.class)).toEqual(['GridBloc'])
    const cells = section.blocs[0].cells
    expect(cells.map((c: { blocs: Array<{ content: string }> }) => c.blocs[0].content)).toEqual(['Gauche', 'Avant la grille'])
    expect(cells[1].width).toBeNull()
  })

  test('a grid moves within its section but cannot be dropped in a cell', async ({ page, request }) => {
    const post = await createGridPage(request, [
      { width: '1/2', texts: ['Gauche'] },
      { width: '1/2', texts: ['Droite'] },
    ])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const grid = page.getByTestId('bloc-GridBloc')
    await dragEditItem(grid, page.getByTestId('grid-cell').nth(1).getByTestId('bloc-MarkdownBloc'))
    // Refused: still two cells holding a text each, after the text of the section
    await expect(page.getByTestId('grid-cell')).toHaveCount(2)
    await expect(page.getByTestId('page-SectionBloc').locator('[data-bloc-class]').first()).toHaveAttribute('data-bloc-class', 'MarkdownBloc')

    // Allowed: above the text of the section
    await dragEditItem(grid, page.getByTestId('bloc-MarkdownBloc').filter({ hasText: 'Avant la grille' }))

    const [saved] = await saveAndFetchBlocs(page, post.slug)
    expect(saved.blocs.map((bloc: { class: string }) => bloc.class)).toEqual(['GridBloc', 'MarkdownBloc'])
    expect(saved.blocs[0].cells.map((cell: { blocs: Array<unknown> }) => cell.blocs.length)).toEqual([1, 1])
  })

  test('a cell is resized with its handle, snapping to the allowed widths', async ({ page, request }) => {
    const post = await createGridPage(request, [
      { width: '1/3', texts: ['Gauche'] },
      { width: '1/3', texts: ['Droite'] },
    ])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const firstCell = page.getByTestId('grid-cell').first()
    const handle = firstCell.getByTestId('grid-cell-resize')
    const grid = await page.getByTestId('bloc-GridBloc').boundingBox()
    const start = await handle.boundingBox()

    // Dragged to about the middle of the grid: the cell snaps to a half
    await page.mouse.move(start!.x + start!.width / 2, start!.y + start!.height / 2)
    await page.mouse.down()
    await page.mouse.move(grid!.x + grid!.width * 0.48, start!.y + start!.height / 2, { steps: 10 })
    await page.mouse.up()
    await expect(handle).toHaveAttribute('aria-valuetext', '1/2')

    // The arrow keys go to the next allowed width
    await handle.press('ArrowRight')
    await expect(handle).toHaveAttribute('aria-valuetext', '2/3')

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs[1].cells.map((cell: { width: string }) => cell.width)).toEqual(['2/3', '1/3'])
  })

  test('a cell without width takes what the others leave, and a double click gives it back', async ({ page, request }) => {
    const post = await createGridPage(request, [
      { width: '2/3', texts: ['Large'] },
      { width: null, texts: ['Automatique'] },
    ])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const cells = page.getByTestId('grid-cell')
    const large = await cells.nth(0).boundingBox()
    const automatic = await cells.nth(1).boundingBox()
    // Same row, the automatic cell taking the remaining third
    expect(Math.abs(large!.y - automatic!.y)).toBeLessThan(1)
    expect(large!.width / automatic!.width).toBeGreaterThan(1.8)
    expect(large!.width / automatic!.width).toBeLessThan(2.3)

    await cells.nth(0).getByTestId('grid-cell-resize').dblclick()
    await expect(cells.nth(0).getByTestId('grid-cell-resize')).toHaveAttribute('aria-valuetext', 'Automatique')
    const left = await cells.nth(0).boundingBox()
    const right = await cells.nth(1).boundingBox()
    expect(left!.width).toBeCloseTo(right!.width, 0)

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs[1].cells.map((cell: { width: string | null }) => cell.width)).toEqual([null, null])
  })
})
