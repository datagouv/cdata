import { test, expect } from '../base'
import { createPost, deletePosts } from '../helpers'

test.describe('Post side menu', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  test('a blocs page lists the titles of its blocs and of their Markdown, each leading to its own heading', async ({ page, request }) => {
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
      ],
    })
    createdIds.push(post.id)

    await page.goto(`/pages/${post.slug}`)
    const menu = page.getByRole('navigation', { name: 'Sommaire' })
    await expect(menu.getByRole('link')).toHaveText(['Santé', 'Données', 'Emploi', 'Données'])

    // Both "Données" sections are reachable, not twice the first one
    const links = menu.getByRole('link', { name: 'Données' })
    const firstHref = await links.first().getAttribute('href')
    const lastHref = await links.last().getAttribute('href')
    expect(firstHref).not.toBe(lastHref)
    await expect(page.locator(`${lastHref} + p`)).toHaveText('Sur l\'emploi.')
  })

  test('a Markdown news lists its headings', async ({ page, request }) => {
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
    await expect(page.getByRole('navigation', { name: 'Sommaire' }).getByRole('link')).toHaveText(['Contexte', 'Chiffres', 'Suite'])
  })

  test('a post without side menu has none', async ({ page, request }) => {
    const uniqueId = Date.now()
    const post = await createPost(request, { name: `Actualité ${uniqueId}`, kind: 'news', headline: 'Une actualité', content: '# Contexte\n\nDu contexte.' })
    createdIds.push(post.id)

    await page.goto(`/posts/${post.slug}`)
    await expect(page.getByRole('heading', { name: 'Contexte' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Sommaire' })).toHaveCount(0)
  })
})
