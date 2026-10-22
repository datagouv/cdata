import { test, expect } from '../base'
import { createPost, deletePosts } from '../helpers'
import type { SectionBloc, SectionContentBloc } from '~/types/pages'

const title = (text: string): SectionContentBloc => ({ class: 'TitleBloc', id: crypto.randomUUID(), width: null, title: text, subtitle: null })
const markdown = (content: string): SectionContentBloc => ({ class: 'MarkdownBloc', id: crypto.randomUUID(), width: null, content })
const section = (blocs: Array<SectionContentBloc>, color: SectionBloc['color'] = null): SectionBloc => ({ class: 'SectionBloc', id: crypto.randomUUID(), color, blocs })

test.describe('Post side menu', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  test('a blocs page lists its titles and those of its Markdown, not its banner nor the titles of its cards', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, {
      name: `Inventaire ${uniqueId}`,
      kind: 'page',
      body_type: 'blocs',
      sidemenu: true,
      blocs: [
        section([title(`Inventaire ${uniqueId}`)], 'primary'),
        section([title('Santé'), markdown('## Données\n\nSur la santé.')]),
        section([title('Emploi'), markdown('## Données\n\nSur l\'emploi.')]),
        section([title('Liens utiles'), { class: 'LinksListBloc', id: crypto.randomUUID(), width: null, links: [{ title: 'Un lien', url: 'https://example.org', color: null }] }]),
      ],
    })
    createdIds.push(post.id)

    await page.goto(`/pages/${post.slug}`)
    await expect(page.getByRole('heading', { name: 'Un lien' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Sommaire' }).getByRole('link')).toHaveText(['Santé', 'Données', 'Emploi', 'Données', 'Liens utiles'])
  })

  test('a link to a bloc title opens the page on that title', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, {
      name: `Inventaire ${uniqueId}`,
      kind: 'page',
      body_type: 'blocs',
      sidemenu: true,
      blocs: [
        section([title('Santé'), markdown(Array(40).fill('Sur la santé.').join('\n\n'))]),
        section([title('Emploi'), markdown('Sur l\'emploi.')]),
      ],
    })
    createdIds.push(post.id)

    await page.goto(`/pages/${post.slug}#emploi`)
    await expect(page.getByRole('heading', { name: 'Emploi' })).toBeInViewport()
  })

  test('a Markdown news lists its headings, nested by level', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, {
      name: `Actualité ${uniqueId}`,
      kind: 'news',
      headline: 'Une actualité',
      content: '# Contexte\n\nDu contexte.\n\n## Chiffres\n\nDes chiffres.\n\n# Suite\n\nLa suite.',
      sidemenu: true,
    })
    createdIds.push(post.id)

    await page.goto(`/posts/${post.slug}`)
    const menu = page.getByRole('navigation', { name: 'Sommaire' })
    await expect(menu.getByRole('link')).toHaveText(['Contexte', 'Chiffres', 'Suite'])
    await expect(menu.getByRole('listitem').filter({ has: page.getByRole('link', { name: 'Contexte' }) }).getByRole('link')).toHaveText(['Contexte', 'Chiffres'])
    await expect(menu.getByRole('listitem').filter({ has: page.getByRole('link', { name: 'Suite' }) }).getByRole('link')).toHaveText(['Suite'])
  })

  test('a link to a heading of an HTML news opens the page on that heading', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, {
      name: `Actualité ${uniqueId}`,
      kind: 'news',
      headline: 'Une actualité',
      body_type: 'html',
      content: `<h2>Contexte</h2>${'<p>Du contexte.</p>'.repeat(40)}<h2>Suite</h2><p>La suite.</p>`,
      sidemenu: true,
    })
    createdIds.push(post.id)

    await page.goto(`/posts/${post.slug}#suite`)
    await expect(page.getByRole('heading', { name: 'Suite' })).toBeInViewport()
  })

  test('a post whose content has no heading has no side menu', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, { name: `Actualité ${uniqueId}`, kind: 'news', headline: 'Une actualité', content: 'Du contexte.', sidemenu: true })
    createdIds.push(post.id)

    await page.goto(`/posts/${post.slug}`)
    await expect(page.getByText('Du contexte.')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Sommaire' })).toHaveCount(0)
  })

  test('a post without side menu has none', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, { name: `Actualité ${uniqueId}`, kind: 'news', headline: 'Une actualité', content: '# Contexte\n\nDu contexte.' })
    createdIds.push(post.id)

    await page.goto(`/posts/${post.slug}`)
    await expect(page.getByRole('heading', { name: 'Contexte' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Sommaire' })).toHaveCount(0)
  })

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('the side menu is already in the page sent by the server', async ({ page, request }) => {
      const uniqueId = Date.now()
      const post = await createPost(request, {
        name: `Inventaire ${uniqueId}`,
        kind: 'page',
        body_type: 'blocs',
        sidemenu: true,
        // Behind the banner: alone, the first title would be the one of the page, not a part of it
        blocs: [section([title(`Inventaire ${uniqueId}`)], 'primary'), section([title('Santé'), markdown('## Données\n\nSur la santé.')])],
      })
      createdIds.push(post.id)

      await page.goto(`/pages/${post.slug}`)
      await expect(page.getByRole('navigation', { name: 'Sommaire' }).getByRole('link')).toHaveText(['Santé', 'Données'])
    })
  })
})
