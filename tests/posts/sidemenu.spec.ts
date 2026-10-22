import { test, expect } from '../base'
import { createPost, deletePosts } from '../helpers'

test.describe('Post side menu', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  test('a blocs page lists the titles of its blocs and of their Markdown, not the titles of their cards', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, {
      name: `Inventaire ${uniqueId}`,
      kind: 'page',
      body_type: 'blocs',
      sidemenu: true,
      blocs: [
        { class: 'HeroBloc', title: `Inventaire ${uniqueId}`, description: null, color: 'primary', main_link_title: null, main_link_url: null },
        { class: 'MarkdownBloc', title: 'Santé', subtitle: null, content: '## Données\n\nSur la santé.' },
        { class: 'MarkdownBloc', title: 'Emploi', subtitle: null, content: '## Données\n\nSur l\'emploi.' },
        { class: 'LinksListBloc', title: 'Liens utiles', subtitle: null, paragraph: null, main_link_title: null, main_link_url: null, links: [{ title: 'Un lien', url: 'https://example.org', color: null }] },
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
        { class: 'MarkdownBloc', title: 'Santé', subtitle: null, content: Array(40).fill('Sur la santé.').join('\n\n') },
        { class: 'MarkdownBloc', title: 'Emploi', subtitle: null, content: 'Sur l\'emploi.' },
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
        blocs: [{ class: 'MarkdownBloc', title: 'Santé', subtitle: null, content: '## Données\n\nSur la santé.' }],
      })
      createdIds.push(post.id)

      await page.goto(`/pages/${post.slug}`)
      await expect(page.getByRole('navigation', { name: 'Sommaire' }).getByRole('link')).toHaveText(['Santé', 'Données'])
    })
  })
})
