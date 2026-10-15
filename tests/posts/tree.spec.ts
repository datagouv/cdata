import { test, expect } from '../base'

test.describe('Pages tree', () => {
  const createdIds: Array<string> = []
  const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

  test.afterEach(async ({ request }) => {
    // Children first: the API refuses to delete a page that still has sub-pages
    for (const id of createdIds.reverse()) {
      await request.delete(`${API_BASE_URL}/api/1/posts/${id}/`)
    }
    createdIds.length = 0
  })

  test('a sub-page lives under its parent path, with a breadcrumb to it', async ({ page, request }) => {
    const uniqueId = Date.now()

    const createPage = async (name: string, parent?: string) => {
      const response = await request.post(`${API_BASE_URL}/api/1/posts/`, {
        data: { name, content: `Contenu de ${name}`, kind: 'page', body_type: 'markdown', parent },
      })
      expect(response.ok()).toBeTruthy()
      const post = await response.json()
      createdIds.push(post.id)
      return post
    }
    const parent = await createPage(`Parent ${uniqueId}`)
    const child = await createPage(`Enfant ${uniqueId}`, parent.id)

    await page.goto(`/pages/${parent.slug}/${child.slug}`)
    await expect(page.getByRole('heading', { level: 1, name: child.name })).toBeVisible()
    await expect(page.getByRole('link', { name: parent.name })).toHaveAttribute('href', `/pages/${parent.slug}`)

    // The /posts URL of a page, and a path that misses its parent, redirect to the canonical one
    await page.goto(`/posts/${child.slug}`)
    await expect(page).toHaveURL(new RegExp(`/pages/${parent.slug}/${child.slug}$`))
    await page.goto(`/pages/${child.slug}`)
    await expect(page).toHaveURL(new RegExp(`/pages/${parent.slug}/${child.slug}$`))
  })
})
