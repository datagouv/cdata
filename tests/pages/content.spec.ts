import type { APIRequestContext, Page } from '@playwright/test'
import { test, expect } from '../base'
import { createPost, deletePosts, gotoHydrated } from '../helpers'

// The footer link to the terms of use leads to /pages/legal/cgu by an in-app navigation,
// the only one where the browser calls the API itself.
const nextPage = '/pages/legal/cgu'
const nextPost = /\/api\/1\/posts\/cgu\/(\?|$)/

test.describe('Pages content', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  async function gotoNewPage(page: Page, request: APIRequestContext) {
    const post = await createPost(request, { name: `Page ${Date.now()}`, content: 'Contenu', kind: 'page' })
    createdIds.push(post.id)
    // Clicked before the hydration, the link would load the next page from the server,
    // which the routes below do not intercept.
    await gotoHydrated(page, `/pages/${post.slug}`)
    return post
  }

  test('the slug of a news is not a page', async ({ page, request }) => {
    const news = await createPost(request, { name: `Actualité ${Date.now()}`, kind: 'news', headline: 'Une actualité', content: 'Contenu' })
    createdIds.push(news.id)

    const response = await page.goto(`/pages/${news.slug}`)
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible()
  })

  test.describe('when the posts API fails', () => {
    // The 500 below is the point of the test: the browser logs it.
    test.use({ allowedConsoleMessages: ['the server responded with a status of 500'] })

    test('the page shows an error, not a 404', async ({ page, request }) => {
      await gotoNewPage(page, request)

      await page.route(nextPost, route => route.fulfill({ status: 500 }))
      await page.locator('footer').getByRole('link', { name: 'Modalités d\'utilisation' }).click()
      await page.waitForURL(`**${nextPage}`)

      await expect(page.getByText('Une erreur est survenue lors du chargement.')).toBeVisible()
      await expect(page.getByRole('heading', { name: '404' })).toHaveCount(0)
    })
  })

  test('going back before the next page is loaded shows the previous one, not a 404', async ({ page, request }) => {
    const post = await gotoNewPage(page, request)

    // The next page never answers: the back navigation always happens while it
    // is still loading, and the previous page is still the one displayed.
    let releaseNextPage = () => {}
    await page.route(nextPost, async (route) => {
      await new Promise<void>((resolve) => {
        releaseNextPage = resolve
      })
      await route.abort()
    })

    await page.locator('footer').getByRole('link', { name: 'Modalités d\'utilisation' }).click()
    await page.waitForURL(`**${nextPage}`)
    await page.goBack()
    await page.waitForURL(`**/pages/${post.slug}`)

    // The abandoned page used to raise its 404 a few ms after the back
    // navigation. Nothing marks the moment it would have, hence a fixed window.
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: '404' })).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1, name: post.name })).toBeVisible()
    releaseNextPage()
  })
})
