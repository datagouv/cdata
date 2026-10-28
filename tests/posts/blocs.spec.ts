import type { Locator, Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, createDatasetWithRemoteResources, createPost, deleteDatasets, deletePosts, dragEditItem, focusedDragHandle, gotoHydrated, startEditItemDrag } from '../helpers'
import { fillPostDescription } from './helpers'
import type { BlocWidth, DatasetBloc, MarkdownBloc, SectionContentBloc } from '~/types/pages'

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

// A section holding a title
async function addTitledSection(page: Page, title: string) {
  // Sections are the only blocs of a page: no menu to pick one from
  await page.getByRole('button', { name: 'Ajouter une section' }).first().click()
  await page.getByTestId('add-bloc-in-section').click()
  await page.getByTestId('add-bloc-TitleBloc').click()

  const titleInput = page.getByTestId('bloc-TitleBloc').locator('[contenteditable="true"]').first()
  await titleInput.click()
  await titleInput.fill(title)
  await page.mouse.click(1, 1)
}

async function addTitledSectionAndSave(page: Page, title: string) {
  await addTitledSection(page, title)
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

    await addTitledSectionAndSave(page, 'Full page content')

    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')

    // Full page mode: the breadcrumb at the top of the first section, no title of its own, the
    // first title bloc is the page's
    await expect(page.getByTestId('page-SectionBloc').first().getByLabel('Vous êtes ici :')).toContainText(`Test Full Page ${uniqueId}`)
    await expect(page.getByRole('heading', { level: 1, name: `Test Full Page ${uniqueId}` })).not.toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Full page content' })).toBeVisible()
  })

  test('news + blocs displays with header and breadcrumb', async ({ page }) => {
    const uniqueId = Date.now()
    const result = await createPostWithBlocs(page, {
      title: `Test News Blocs ${uniqueId}`,
      headline: 'A news post with blocs',
      kind: 'news',
    })
    postId = result.postId

    await addTitledSectionAndSave(page, 'News content')

    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')

    // News mode: breadcrumb, title, headline visible; the title bloc stays under the page's
    await expect(page.getByText('Accueil').first()).toBeVisible()
    await expect(page.getByText('Articles')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: `Test News Blocs ${uniqueId}` })).toBeVisible()
    await expect(page.getByText('A news post with blocs')).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'News content' })).toBeVisible()
  })

  test('a section gets a background color, its title and its button turning white', async ({ page }) => {
    const uniqueId = Date.now()
    const result = await createPostWithBlocs(page, {
      title: `Test Section ${uniqueId}`,
      headline: 'A page with a colored section',
      kind: 'page',
    })
    postId = result.postId

    await addTitledSection(page, 'Titre sur fond vert')
    await page.getByTestId('add-bloc-in-section').click()
    await page.getByTestId('add-bloc-ButtonBloc').click()
    const url = page.getByLabel('URL du bouton')
    await url.fill('https://www.data.gouv.fr/datasets')
    await url.press('Tab')

    // From the menu of the section's tab
    const section = page.getByTestId('page-SectionBloc')
    await section.hover({ position: { x: 20, y: 20 } })
    await section.getByRole('button', { name: 'Actions sur Section' }).click()
    await page.getByRole('menuitem', { name: 'Fond vert' }).click()

    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.getByText('Page sauvegardée')).toBeVisible()

    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')
    const style = (locator: Locator) => locator.evaluate((element) => {
      const { backgroundColor, color } = getComputedStyle(element)
      return { backgroundColor, color }
    })
    const white = 'rgb(255, 255, 255)'
    const band = await style(page.getByTestId('page-SectionBloc'))
    expect(band.backgroundColor).not.toBe(white)
    expect(band.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect((await style(page.getByRole('heading', { name: 'Titre sur fond vert' }))).color).toBe(white)
    const button = page.getByRole('link', { name: 'Titre du bouton' })
    await expect(button).toHaveAttribute('href', 'https://www.data.gouv.fr/datasets')
    expect((await style(button)).backgroundColor).toBe(white)
  })

  test('a button is saved as added, to the home page of the site', async ({ page }) => {
    const result = await createPostWithBlocs(page, {
      title: `Test Button ${Date.now()}`,
      headline: 'A page with a button',
      kind: 'page',
    })
    postId = result.postId

    await page.getByRole('button', { name: 'Ajouter une section' }).first().click()
    await page.getByTestId('add-bloc-in-section').click()
    await page.getByTestId('add-bloc-ButtonBloc').click()
    // A URL is required: emptying it keeps the previous one
    const url = page.getByLabel('URL du bouton')
    await url.fill('')
    await url.press('Tab')
    await expect(url).toHaveValue('/')
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.getByText('Page sauvegardée')).toBeVisible()

    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('link', { name: 'Titre du bouton' })).toHaveAttribute('href', '/')
  })

  test('a bloc keeping the focus does not hide the menu of the section hovered', async ({ page, request }) => {
    const post = await createPost(request, {
      name: `Test Focus ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{ class: 'SectionBloc', id: crypto.randomUUID(), color: null, blocs: [{ class: 'ButtonBloc', id: crypto.randomUUID(), width: null, title: 'Bouton', url: '/' }] }],
    })
    postId = post.id
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    // The URL input keeps the focus
    await page.getByLabel('URL du bouton').fill('https://www.data.gouv.fr/datasets')

    const section = page.getByTestId('page-SectionBloc')
    await section.hover({ position: { x: 20, y: 20 } })
    const tab = section.locator(':scope > [data-edit-tab]')
    await expect(tab).toHaveCSS('opacity', '1')
    await expect(tab).toHaveCSS('pointer-events', 'auto')
    await section.getByRole('button', { name: 'Actions sur Section' }).click()
    await expect(page.getByRole('menuitem', { name: 'Fond vert' })).toBeVisible()
  })

  test.describe('when the save is rejected', () => {
    // The rejection below is the point of the test: the browser logs it.
    test.use({ allowedConsoleMessages: ['the server responded with a status of 400'] })

    test('the changes stay in the editor when they cannot be saved', async ({ page }) => {
      const result = await createPostWithBlocs(page, {
        title: `Test Failure ${Date.now()}`,
        headline: 'A page failing to save',
        kind: 'page',
      })
      postId = result.postId
      await addTitledSection(page, 'Titre non sauvegardé')

      await page.route(url => url.pathname.endsWith(`/api/1/posts/${postId}/`), route => route.request().method() === 'PUT'
        ? route.fulfill({ status: 400, json: { message: 'Validation error' } })
        : route.continue())
      await page.getByRole('button', { name: 'Sauvegarder' }).click()

      await expect(page.getByText('Erreur lors de la sauvegarde')).toBeVisible()
      await expect(page).toHaveURL(/edit=true/)
      await expect(page.getByTestId('bloc-TitleBloc')).toContainText('Titre non sauvegardé')
    })
  })

  test('emptying a title keeps the previous one, a title being required', async ({ page }) => {
    const result = await createPostWithBlocs(page, {
      title: `Test Title ${Date.now()}`,
      headline: 'A page with a title',
      kind: 'page',
    })
    postId = result.postId

    await addTitledSection(page, 'Titre de la section')
    const title = page.getByTestId('bloc-TitleBloc').locator('[contenteditable="true"]').first()
    await title.click()
    await title.fill('')
    await page.mouse.click(1, 1)

    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.getByText('Page sauvegardée')).toBeVisible()
    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Titre de la section' })).toBeVisible()
  })
})

test.describe('Sections', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  function markdown(content: string, width: BlocWidth | null = null): MarkdownBloc {
    return { class: 'MarkdownBloc', id: crypto.randomUUID(), width, content }
  }

  // A page of a single section holding these blocs
  async function createSectionPage(request: Parameters<typeof createPost>[0], blocs: Array<SectionContentBloc>) {
    const post = await createPost(request, {
      name: `Section ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{ class: 'SectionBloc', id: crypto.randomUUID(), color: null, blocs }],
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

  function contents(section: { blocs: Array<{ content: string }> }) {
    return section.blocs.map(bloc => bloc.content)
  }

  test('a section keeps its blocs on one band, side by side by width', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, {
      name: `Sections ${uniqueId}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [
        {
          class: 'SectionBloc',
          id: crypto.randomUUID(),
          color: null,
          blocs: [
            { class: 'TitleBloc', id: crypto.randomUUID(), width: null, title: 'Première section', subtitle: 'Son sous-titre' },
            markdown('Bloc étroit', '1/3'),
            markdown('Bloc large', '2/3'),
          ],
        },
        { class: 'SectionBloc', id: crypto.randomUUID(), color: null, blocs: [markdown('Seconde section')] },
      ],
    })
    createdIds.push(post.id)

    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}`)

    const sections = page.getByTestId('page-SectionBloc')
    await expect(sections).toHaveCount(2)
    // The page has no title of its own: its first title is the page's
    await expect(sections.first().getByRole('heading', { level: 1, name: 'Première section' })).toBeVisible()
    await expect(sections.first().getByText('Son sous-titre')).toBeVisible()
    await expect(sections.last().getByText('Seconde section')).toBeVisible()

    // The two sections alternate their background
    const backgrounds = await sections.evaluateAll(elements => elements.map(element => getComputedStyle(element).backgroundColor))
    expect(backgrounds[0]).not.toBe(backgrounds[1])

    // The title takes the whole row; the texts share the next one, the 2/3 one being twice
    // as wide as the 1/3 one
    const texts = sections.first().getByTestId('bloc-MarkdownBloc')
    const title = (await sections.first().getByTestId('bloc-TitleBloc').boundingBox())!
    const narrow = (await texts.nth(0).boundingBox())!
    const wide = (await texts.nth(1).boundingBox())!
    expect(narrow.y).toBeGreaterThan(title.y + title.height)
    expect(Math.abs(narrow.y - wide.y)).toBeLessThan(1)
    expect(wide.width / narrow.width).toBeGreaterThan(1.8)
    expect(wide.width / narrow.width).toBeLessThan(2.3)

    // Below `sm`, the blocs are stacked
    await page.setViewportSize({ width: 400, height: 900 })
    const narrowMobile = (await texts.nth(0).boundingBox())!
    const wideMobile = (await texts.nth(1).boundingBox())!
    expect(narrowMobile.width).toBeCloseTo(wideMobile.width, 0)
    expect(wideMobile.y).toBeGreaterThan(narrowMobile.y)
  })

  test('nothing moves in the page while dragging, an indicator shows where the bloc lands', async ({ page, request }) => {
    const post = await createSectionPage(request, [markdown('Gauche', '1/2'), markdown('Droite', '1/2'), markdown('Dessous')])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const texts = page.getByTestId('bloc-MarkdownBloc')
    const target = texts.filter({ hasText: 'Dessous' })
    const targetBefore = (await target.boundingBox())!
    await startEditItemDrag(texts.filter({ hasText: 'Gauche' }), targetBefore.x + targetBefore.width / 2, targetBefore.y + 10)

    await expect(page.getByTestId('drop-indicator')).toBeVisible()
    const indicator = (await page.getByTestId('drop-indicator').boundingBox())!
    // Above the target, across the section: the bloc starts a row there
    expect(indicator.y).toBeLessThan(targetBefore.y)
    expect(targetBefore.y - indicator.y).toBeLessThan(40)
    expect(indicator.width).toBeGreaterThan(targetBefore.width * 0.9)
    expect(await target.boundingBox()).toEqual(targetBefore)

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('drop-indicator')).toHaveCount(0)
    await page.mouse.up()
    await expect(texts.first()).toContainText('Gauche')
  })

  test('a bloc dragged down lands where the indicator showed it', async ({ page, request }) => {
    const post = await createSectionPage(request, ['Premier', 'Deuxième', 'Troisième'].map(text => markdown(text)))
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    // On the upper half of the third: right before it, the list counting the first until
    // it is dropped
    const texts = page.getByTestId('bloc-MarkdownBloc')
    await dragEditItem(texts.filter({ hasText: 'Premier' }), texts.filter({ hasText: 'Troisième' }), 0.25)

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(contents(section)).toEqual(['Deuxième', 'Premier', 'Troisième'])
  })

  test('a bloc dropped between two blocs of a row joins it', async ({ page, request }) => {
    const post = await createSectionPage(request, [
      markdown('Avant', '1/3'),
      markdown('Gauche', '1/3'),
      markdown('Droite', '1/3'),
      markdown('Dessous', '1/3'),
    ])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const texts = page.getByTestId('bloc-MarkdownBloc')
    const right = (await texts.filter({ hasText: 'Droite' }).boundingBox())!
    // On the left part of the last bloc of the first row
    await startEditItemDrag(texts.filter({ hasText: 'Dessous' }), right.x + right.width / 4, right.y + right.height / 2)

    // A vertical line, in the gap between the two blocs
    const indicator = (await page.getByTestId('drop-indicator').boundingBox())!
    expect(indicator.height).toBeGreaterThan(indicator.width)
    expect(Math.abs(indicator.x - right.x)).toBeLessThan(20)
    await page.mouse.up()

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(contents(section)).toEqual(['Avant', 'Gauche', 'Dessous', 'Droite'])
  })

  test('a bloc dropped on the free space of a row stays on it when it fits', async ({ page, request }) => {
    // `Gauche` is alone on its row, the full width bloc not fitting next to it
    const post = await createSectionPage(request, [markdown('Gauche', '1/2'), markdown('Pleine largeur'), markdown('Dessous', '1/2')])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const texts = page.getByTestId('bloc-MarkdownBloc')
    await expect(texts.filter({ hasText: 'Gauche' })).toBeVisible()
    const left = (await texts.filter({ hasText: 'Gauche' }).boundingBox())!

    async function dragToFreeSpace(text: string) {
      // On the right half of the first row, which `Gauche` leaves empty
      await startEditItemDrag(texts.filter({ hasText: text }), left.x + left.width * 1.5, left.y + left.height / 2)
      const indicator = (await page.getByTestId('drop-indicator').boundingBox())!
      await page.mouse.up()
      return indicator
    }

    // A full width bloc does not fit: the line shows it stays after the row, across the list
    const fullWidth = await dragToFreeSpace('Pleine largeur')
    expect(fullWidth.width).toBeGreaterThan(fullWidth.height)
    // A half does: the line is in the row, right after `Gauche`
    const half = await dragToFreeSpace('Dessous')
    expect(half.height).toBeGreaterThan(half.width)
    expect(half.x).toBeGreaterThan(left.x + left.width)

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(contents(section)).toEqual(['Gauche', 'Dessous', 'Pleine largeur'])
  })

  test('a bloc dropped in the margin above or below the blocs of a section goes first or last', async ({ page, request }) => {
    const post = await createSectionPage(request, ['Un', 'Deux', 'Trois', 'Quatre'].map(text => markdown(text, '1/2')))
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const texts = page.getByTestId('bloc-MarkdownBloc')
    const section = page.getByTestId('page-SectionBloc')

    async function dragToMargin(text: string, margin: 'top' | 'bottom') {
      const band = (await section.boundingBox())!
      const blocs = (await page.locator('[data-blocs-level="section"]').boundingBox())!
      // Halfway between the edge of the section and its blocs
      const y = margin === 'top' ? (band.y + blocs.y) / 2 : (blocs.y + blocs.height + band.y + band.height) / 2
      await startEditItemDrag(texts.filter({ hasText: text }), blocs.x + blocs.width / 2, y)
      await expect(page.getByTestId('drop-indicator')).toBeVisible()
      await page.mouse.up()
    }

    await dragToMargin('Quatre', 'top')
    await expect(texts.first()).toContainText('Quatre')
    await dragToMargin('Deux', 'bottom')
    await expect(texts.last()).toContainText('Deux')

    const [saved] = await saveAndFetchBlocs(page, post.slug)
    expect(contents(saved)).toEqual(['Quatre', 'Un', 'Trois', 'Deux'])
  })

  test('a section left empty in the editor is not saved', async ({ page, request }) => {
    const post = await createSectionPage(request, [markdown('Seule section remplie')])
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    await page.getByRole('button', { name: 'Ajouter une section' }).last().click()
    await expect(page.getByTestId('page-SectionBloc')).toHaveCount(2)

    const sections = await saveAndFetchBlocs(page, post.slug)
    expect(sections.map(contents)).toEqual([['Seule section remplie']])
  })

  // `page.keyboard`, not `Locator.press`: the latter focuses the handle again before each
  // press, which would hide a handle losing the focus after a move.
  test('a bloc moves several steps with the keyboard, up as down', async ({ page, request }) => {
    const post = await createSectionPage(request, ['Un', 'Deux', 'Trois'].map(text => markdown(text)))
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const texts = page.getByTestId('bloc-MarkdownBloc')
    await focusedDragHandle(texts.filter({ hasText: 'Trois' }))
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect(texts.first()).toContainText('Trois')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(contents(section)).toEqual(['Un', 'Deux', 'Trois'])
  })

  test('an accordion item moves several steps with the keyboard', async ({ page, request }) => {
    const post = await createPost(request, {
      name: `Accordion ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{
        class: 'SectionBloc',
        id: crypto.randomUUID(),
        color: null,
        blocs: [{
          class: 'AccordionListBloc',
          id: crypto.randomUUID(),
          width: null,
          items: ['A', 'B', 'C'].map(name => ({ id: crypto.randomUUID(), title: `Item ${name}`, content: [markdown(name)] })),
        }],
      }],
    })
    createdIds.push(post.id)
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    await focusedDragHandle(page.locator('[data-drop-item]').filter({ hasText: 'Item A' }).last())
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs[0].items.map((item: { title: string }) => item.title)).toEqual(['Item B', 'Item C', 'Item A'])
  })

  test('a bloc is inserted first, above a row, and beside a bloc of a row at its width', async ({ page, request }) => {
    const post = await createSectionPage(request, [markdown('Avant'), markdown('Gauche', '1/3'), markdown('Droite', '1/3')])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    // Waits for the menu to be gone: leaving, it would still be there when opening the next
    async function addTitle() {
      await page.getByTestId('add-bloc-TitleBloc').click()
      await expect(page.getByTestId('add-bloc-TitleBloc')).toHaveCount(0)
    }

    // The line above the first bloc
    await page.getByTestId('prepend-bloc-in-section').click()
    await addTitle()
    // The line in the gap above the row
    await page.getByTestId('insert-bloc-in-section').last().click()
    await addTitle()
    // The boundary between the two blocs of the row
    await page.getByTestId('insert-bloc-beside-in-section').click()
    await addTitle()

    const [section] = await saveAndFetchBlocs(page, post.slug)
    const blocs = section.blocs.map((bloc: { class: string, width: string | null }) => [bloc.class, bloc.width])
    expect(blocs).toEqual([
      ['TitleBloc', null],
      ['MarkdownBloc', null],
      ['TitleBloc', null],
      ['MarkdownBloc', '1/3'],
      ['TitleBloc', '1/3'],
      ['MarkdownBloc', '1/3'],
    ])
  })

  test('a card does not leave the editor when clicked', async ({ page, request }) => {
    const dataset = await createDataset(request, `Carte ${Date.now()}`, 'Un jeu de données à la une')
    const post = await createPost(request, {
      name: `Card ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{
        class: 'SectionBloc',
        id: crypto.randomUUID(),
        color: null,
        blocs: [{ class: 'DatasetBloc', id: crypto.randomUUID(), width: '1/2', dataset: { id: dataset.id } as DatasetBloc['dataset'] }],
      }],
    })
    createdIds.push(post.id)
    try {
      await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

      // Where a user clicks: on the title of the card, whatever receives the click there
      const title = (await page.getByText(dataset.title).boundingBox())!
      await page.mouse.click(title.x + title.width / 2, title.y + title.height / 2)
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(new RegExp(`/pages/${post.slug}\\?edit=true`))
    }
    finally {
      await deleteDatasets(request, [dataset.id])
    }
  })

  test('a bloc moves from a section to another', async ({ page, request }) => {
    const post = await createPost(request, {
      name: `Sections ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [
        { class: 'SectionBloc', id: crypto.randomUUID(), color: null, blocs: [markdown('Reste'), markdown('Part')] },
        { class: 'SectionBloc', id: crypto.randomUUID(), color: null, blocs: [markdown('Là')] },
      ],
    })
    createdIds.push(post.id)
    // Tall enough for both sections: the texts are editors, high ones
    await page.setViewportSize({ width: 1280, height: 1600 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    // On the upper half of the text of the other section: right before it
    const texts = page.getByTestId('bloc-MarkdownBloc')
    await dragEditItem(texts.filter({ hasText: 'Part' }), texts.filter({ hasText: 'Là' }), 0.25)

    const [first, second] = await saveAndFetchBlocs(page, post.slug)
    expect(contents(first)).toEqual(['Reste'])
    expect(contents(second)).toEqual(['Part', 'Là'])
  })

  // The containers a bloc moves into, each one holding two texts: the bloc, its content once
  // fetched, and the hash opening it
  const accordionId = crypto.randomUUID()
  const itemId = crypto.randomUUID()
  const containers = [
    {
      name: 'an accordion item',
      bloc: { class: 'AccordionListBloc', id: accordionId, width: null, items: [{ id: itemId, title: 'Item', content: [markdown('Dedans A'), markdown('Dedans B')] }] },
      content: (fetched: { items: Array<{ content: Array<{ content: string }> }> }) => fetched.items[0].content,
      hash: `#accordion-${accordionId}-${itemId}`,
    },
    {
      name: 'a column',
      bloc: { class: 'ColumnBloc', id: crypto.randomUUID(), width: null, blocs: [markdown('Dedans A'), markdown('Dedans B')] },
      content: (fetched: { blocs: Array<{ content: string }> }) => fetched.blocs,
      hash: '',
    },
  ] satisfies Array<{ name: string, bloc: SectionContentBloc, content: unknown, hash: string }>

  for (const container of containers) {
    test(`a bloc moves into ${container.name}, but not the explorer`, async ({ page, request }) => {
      const { dataset, resources: [resource] } = await createDatasetWithRemoteResources(request, `Explorer ${Date.now()}`, ['Fichier'])
      const post = await createSectionPage(request, [
        { class: 'ExploreBloc', id: crypto.randomUUID(), width: null, resource_id: resource.id },
        markdown('Dehors'),
        container.bloc,
      ])
      try {
        // Tall enough for the whole section: the texts are editors, high ones
        await page.setViewportSize({ width: 1280, height: 1600 })
        await gotoHydrated(page, `/pages/${post.slug}?edit=true${container.hash}`)

        // On the upper half of the second text of the container: right before it
        const texts = page.getByTestId('bloc-MarkdownBloc')
        await dragEditItem(texts.filter({ hasText: 'Dehors' }), texts.filter({ hasText: 'Dedans B' }), 0.25)
        await expect(page.getByTestId(`bloc-${container.bloc.class}`).getByTestId('bloc-MarkdownBloc')).toHaveCount(3)
        // The same place refuses the explorer, too wide for the container: it lands in the
        // section holding it instead, after it, on the lower half of which it is
        await dragEditItem(page.getByTestId('bloc-ExploreBloc'), texts.filter({ hasText: 'Dedans B' }), 0.25)

        const [section] = await saveAndFetchBlocs(page, post.slug)
        expect(section.blocs.map((bloc: { class: string }) => bloc.class)).toEqual([container.bloc.class, 'ExploreBloc'])
        expect(contents({ blocs: container.content(section.blocs[0]) })).toEqual(['Dedans A', 'Dehors', 'Dedans B'])
      }
      finally {
        await deleteDatasets(request, [dataset.id])
      }
    })
  }

  test('a column stacks its title and its text beside a taller bloc, centered on it', async ({ page, request }) => {
    const post = await createPost(request, {
      name: `Column ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{
        class: 'SectionBloc',
        id: crypto.randomUUID(),
        color: null,
        blocs: [
          {
            class: 'ColumnBloc',
            id: crypto.randomUUID(),
            width: '1/2',
            blocs: [{ class: 'TitleBloc', id: crypto.randomUUID(), width: null, title: 'Titre en colonne', subtitle: null }, markdown('Son texte')],
          },
          markdown(Array.from({ length: 30 }, (_, index) => `Ligne ${index}`).join('\n\n'), '1/2'),
        ],
      }],
    })
    createdIds.push(post.id)
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}`)

    // The title in a column stays the first title of the page, drawn as that of a section
    const column = page.getByTestId('bloc-ColumnBloc')
    await expect(column.getByRole('heading', { level: 1, name: 'Titre en colonne' })).toBeVisible()

    // The title and the text stacked in the column, the column beside the tall text, centered
    // on it
    const title = (await column.getByTestId('bloc-TitleBloc').boundingBox())!
    const text = (await column.getByTestId('bloc-MarkdownBloc').boundingBox())!
    const box = (await column.boundingBox())!
    const tall = (await page.getByTestId('bloc-MarkdownBloc').filter({ hasText: 'Ligne 29' }).boundingBox())!
    expect(text.y).toBeGreaterThan(title.y + title.height - 1)
    expect(tall.x).toBeGreaterThan(box.x + box.width)
    expect(tall.height).toBeGreaterThan(box.height * 2)
    expect(Math.abs((box.y + box.height / 2) - (tall.y + tall.height / 2))).toBeLessThan(2)
  })

  test('the title of a column in an accordion item is drawn as one of the item', async ({ page, request }) => {
    const accordionId = crypto.randomUUID()
    const itemId = crypto.randomUUID()
    const post = await createSectionPage(request, [
      markdown('Avant'),
      {
        class: 'AccordionListBloc',
        id: accordionId,
        width: null,
        items: [{
          id: itemId,
          title: 'Item',
          content: [{ class: 'ColumnBloc', id: crypto.randomUUID(), width: '1/2', blocs: [{ class: 'TitleBloc', id: crypto.randomUUID(), width: null, title: 'Titre en colonne', subtitle: null }] }],
        }],
      },
    ])
    await gotoHydrated(page, `/pages/${post.slug}#accordion-${accordionId}-${itemId}`)

    await expect(page.getByRole('heading', { level: 4, name: 'Titre en colonne' })).toBeVisible()
  })

  test('a column is added from the menu at half the row, then filled', async ({ page, request }) => {
    const post = await createSectionPage(request, [markdown('Avant')])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    await page.getByTestId('page-SectionBloc').hover()
    await page.getByTestId('add-bloc-in-section').click()
    await page.getByTestId('add-bloc-ColumnBloc').click()
    const column = page.getByTestId('bloc-ColumnBloc')
    // A column only holds the blocs a share of a row fits: neither an accordion nor a column
    await column.getByTestId('add-bloc-in-column').click()
    await expect(page.getByRole('menu')).toHaveCount(1)
    const menu = page.getByRole('menu')
    await expect(menu.getByTestId('add-bloc-TitleBloc')).toBeVisible()
    await expect(menu.getByTestId('add-bloc-AccordionListBloc')).toHaveCount(0)
    await expect(menu.getByTestId('add-bloc-ColumnBloc')).toHaveCount(0)
    await menu.getByTestId('add-bloc-TitleBloc').click()
    await expect(column.getByTestId('bloc-TitleBloc')).toHaveCount(1)

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs.map((bloc: { class: string }) => bloc.class)).toEqual(['MarkdownBloc', 'ColumnBloc'])
    expect(section.blocs[1].width).toBe('1/2')
    expect(section.blocs[1].blocs.map((bloc: { class: string }) => bloc.class)).toEqual(['TitleBloc'])
  })

  test('a bloc dropped on a folded accordion item stays in sight, in the section', async ({ page, request }) => {
    const post = await createPost(request, {
      name: `Folded ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{
        class: 'SectionBloc',
        id: crypto.randomUUID(),
        color: null,
        blocs: [
          markdown('Dehors'),
          {
            class: 'AccordionListBloc',
            id: crypto.randomUUID(),
            width: null,
            items: ['A', 'B'].map(name => ({ id: crypto.randomUUID(), title: `Item ${name}`, content: [markdown(`Dedans ${name}`)] })),
          },
        ],
      }],
    })
    createdIds.push(post.id)
    await page.setViewportSize({ width: 1280, height: 1200 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    // On the title of the last item, folded: its content is hidden, the bloc stays in the
    // section, before the accordion, on the upper half of which that title is
    await dragEditItem(page.getByTestId('bloc-MarkdownBloc').filter({ hasText: 'Dehors' }), page.locator('[data-drop-item]').filter({ hasText: 'Item B' }).last())

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs.map((bloc: { class: string }) => bloc.class)).toEqual(['MarkdownBloc', 'AccordionListBloc'])
    expect(section.blocs[1].items.map((item: { content: Array<unknown> }) => item.content.length)).toEqual([1, 1])
  })

  test('the menu of a section near the bottom of the window stays above the save bar', async ({ page, request }) => {
    const post = await createSectionPage(request, [markdown('Un')])
    // A low window: the tab of the section lands right above the save bar, with no room for
    // the menu below it
    await page.setViewportSize({ width: 1280, height: 340 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const section = page.getByTestId('page-SectionBloc')
    await section.hover({ position: { x: 20, y: 20 } })
    await section.getByRole('button', { name: 'Actions sur Section' }).click()

    const bar = (await page.locator('[data-blocs-save-bar]').boundingBox())!
    const menu = (await page.getByRole('menu').boundingBox())!
    expect(menu.y + menu.height).toBeLessThanOrEqual(bar.y)
  })

  test('the links and the bold text of a text are white on a colored section', async ({ page, request }) => {
    const post = await createPost(request, {
      name: `Colored ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{ class: 'SectionBloc', id: crypto.randomUUID(), color: 'green', blocs: [markdown('[Un lien](https://www.data.gouv.fr) et **du gras**')] }],
    })
    createdIds.push(post.id)
    await gotoHydrated(page, `/pages/${post.slug}`)

    const white = 'rgb(255, 255, 255)'
    await expect(page.getByRole('link', { name: 'Un lien' })).toHaveCSS('color', white)
    await expect(page.getByText('du gras')).toHaveCSS('color', white)
  })

  test('a section is dragged after another', async ({ page, request }) => {
    const post = await createPost(request, {
      name: `Sections ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: ['Un', 'Deux', 'Trois'].map(text => ({ class: 'SectionBloc' as const, id: crypto.randomUUID(), color: null, blocs: [markdown(text)] })),
    })
    createdIds.push(post.id)
    await page.setViewportSize({ width: 1280, height: 1600 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    // On the lower half of the last section: after it
    const sections = page.getByTestId('page-SectionBloc')
    await dragEditItem(sections.nth(0), sections.nth(2), 0.75)

    expect((await saveAndFetchBlocs(page, post.slug)).map(contents)).toEqual([['Deux'], ['Trois'], ['Un']])
  })

  test('an accordion item is dragged after another', async ({ page, request }) => {
    const post = await createPost(request, {
      name: `Accordion ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{
        class: 'SectionBloc',
        id: crypto.randomUUID(),
        color: null,
        blocs: [{
          class: 'AccordionListBloc',
          id: crypto.randomUUID(),
          width: null,
          items: ['A', 'B', 'C'].map(name => ({ id: crypto.randomUUID(), title: `Item ${name}`, content: [markdown(name)] })),
        }],
      }],
    })
    createdIds.push(post.id)
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const item = (name: string) => page.locator('[data-drop-item]').filter({ hasText: `Item ${name}` }).last()
    await dragEditItem(item('A'), item('C'), 0.75)

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs[0].items.map((item: { title: string }) => item.title)).toEqual(['Item B', 'Item C', 'Item A'])
  })

  test('a bloc is resized with its handle, snapping to the allowed widths', async ({ page, request }) => {
    const post = await createSectionPage(request, [markdown('Gauche', '1/3'), markdown('Droite', '1/3')])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const left = page.locator('[data-bloc-class]').first()
    const handle = left.getByTestId('bloc-resize')
    const list = await page.locator('[data-blocs-level="section"]').boundingBox()
    const start = await handle.boundingBox()

    // The line is grabbed near its top, its middle holding the button inserting a bloc.
    // Dragged to about the middle of the section: the bloc snaps to a half.
    await page.mouse.move(start!.x + start!.width / 2, start!.y + 8)
    await page.mouse.down()
    await page.mouse.move(list!.x + list!.width * 0.48, start!.y + 8, { steps: 10 })
    await page.mouse.up()
    await expect(handle).toHaveAttribute('aria-valuetext', '1/2')

    // The arrow keys go to the next allowed width
    await handle.press('ArrowRight')
    await expect(handle).toHaveAttribute('aria-valuetext', '2/3')

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs.map((bloc: { width: string | null }) => bloc.width)).toEqual(['2/3', '1/3'])
  })

  test('a double click on the handle gives the bloc the whole row', async ({ page, request }) => {
    const post = await createSectionPage(request, [markdown('Large', '2/3'), markdown('Étroit', '1/3')])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const blocs = page.locator('[data-bloc-class]')
    await blocs.nth(0).getByTestId('bloc-resize').dblclick({ position: { x: 10, y: 8 } })
    await expect(blocs.nth(0).getByTestId('bloc-resize')).toHaveAttribute('aria-valuetext', 'Pleine largeur')
    // The narrow bloc no longer fits next to it: it goes to the next row
    const large = (await blocs.nth(0).boundingBox())!
    const narrow = (await blocs.nth(1).boundingBox())!
    expect(narrow.y).toBeGreaterThanOrEqual(large.y + large.height)

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs.map((bloc: { width: string | null }) => bloc.width)).toEqual([null, '1/3'])
  })

  test('a bloc ending a row of a column and the column are each resized from their handle', async ({ page, request }) => {
    const post = await createSectionPage(request, [
      { class: 'ColumnBloc', id: crypto.randomUUID(), width: '1/2', blocs: [markdown('Dedans')] },
      markdown('Dehors', '1/2'),
    ])
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, `/pages/${post.slug}?edit=true`)

    const column = page.locator('[data-bloc-class="ColumnBloc"]')
    const columnHandle = column.getByTestId('bloc-resize').last()
    const inner = column.locator('[data-bloc-class="MarkdownBloc"]')
    const innerHandle = inner.getByTestId('bloc-resize')
    const list = (await page.locator('[data-blocs-level="section"]').boundingBox())!

    // The text takes the whole column: both handles share the gap on its right, each one
    // grabbed where it is drawn. Dragged to a quarter of the section, the text takes half of
    // the column, which keeps its width.
    const drag = async (handle: typeof innerHandle, to: number) => {
      const box = (await handle.boundingBox())!
      await page.mouse.move(box.x + box.width / 2, box.y + 8)
      await page.mouse.down()
      await page.mouse.move(list.x + list.width * to, box.y + 8, { steps: 10 })
      await page.mouse.up()
    }
    await drag(innerHandle, 0.24)
    await expect(innerHandle).toHaveAttribute('aria-valuetext', '1/2')
    await expect(columnHandle).toHaveAttribute('aria-valuetext', '1/2')

    await drag(columnHandle, 0.74)
    await expect(columnHandle).toHaveAttribute('aria-valuetext', '3/4')

    const [section] = await saveAndFetchBlocs(page, post.slug)
    expect(section.blocs[0].width).toBe('3/4')
    expect(section.blocs[0].blocs[0].width).toBe('1/2')
  })
})

test.describe('Links in blocs written by the team', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  test('are followed by search engines', async ({ page, request }) => {
    const post = await createPost(request, {
      name: `Partenaires ${Date.now()}`,
      kind: 'page',
      body_type: 'blocs',
      blocs: [{
        class: 'SectionBloc',
        id: crypto.randomUUID(),
        color: null,
        blocs: [
          { class: 'MarkdownBloc', id: crypto.randomUUID(), width: null, content: '[Partenaire](https://example.com/partner)' },
          { class: 'LinksListBloc', id: crypto.randomUUID(), width: null, links: [{ title: 'Lien externe', url: 'https://example.com/link', color: null }] },
          { class: 'ButtonBloc', id: crypto.randomUUID(), width: null, title: 'Notre site', url: 'https://example.com/main' },
          { class: 'CardBloc', id: crypto.randomUUID(), width: '1/4', title: 'Carte', url: 'https://example.com/card', description: null, image: null },
        ],
      }],
    })
    createdIds.push(post.id)

    await page.goto(`/pages/${post.slug}`)
    await expect(page.getByRole('link', { name: 'Partenaire' })).not.toHaveAttribute('rel', /nofollow/)
    await expect(page.getByRole('link', { name: 'Notre site' })).not.toHaveAttribute('rel', /nofollow/)
    await expect(page.getByRole('link', { name: 'Lien externe' })).not.toHaveAttribute('rel', /nofollow/)
    await expect(page.getByRole('link', { name: 'Carte' })).not.toHaveAttribute('rel', /nofollow/)
  })
})
