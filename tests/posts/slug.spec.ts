import { test, expect } from '../base'
import { API_BASE } from '../helpers'
import { createMarkdownPost } from './helpers'

test.describe('Post slug', () => {
  let postId: string | undefined

  test.afterEach(async ({ request }) => {
    if (postId) {
      await request.delete(`${API_BASE}/api/1/posts/${postId}/`)
      postId = undefined
    }
  })

  test('a sysadmin chooses the slug, and the form shows the one the server kept', async ({ page }) => {
    const uniqueId = Date.now()
    const title = `Test Slug ${uniqueId}`
    const chosenSlug = `slug-choisi-${uniqueId}`

    postId = await createMarkdownPost(page, {
      title,
      headline: 'Une page au slug choisi',
      content: 'Contenu de la page',
      slug: chosenSlug,
    })

    const slugInput = page.getByRole('textbox', { name: 'Identifiant dans l\'URL' })
    await expect(slugInput).toHaveValue(chosenSlug)

    // Typed unnormalized: once saved, the field shows the normalized slug, not the input
    await slugInput.fill(`Slug Modifié ${uniqueId}`)
    await slugInput.press('Tab')
    const saved = page.waitForResponse(response => response.url().includes(`/api/1/posts/${postId}/`) && response.request().method() === 'PUT')
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    expect((await saved).ok()).toBeTruthy()
    await expect(slugInput).toHaveValue(`slug-modifie-${uniqueId}`)

    await page.goto(`/posts/slug-modifie-${uniqueId}`)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  })
})
