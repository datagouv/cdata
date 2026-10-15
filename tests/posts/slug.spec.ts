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

  test('a sysadmin chooses the slug at creation and changes it afterwards', async ({ page }) => {
    const uniqueId = Date.now()
    const title = `Test Slug ${uniqueId}`
    const chosenSlug = `slug-choisi-${uniqueId}`
    const changedSlug = `slug-modifie-${uniqueId}`

    postId = await createMarkdownPost(page, {
      title,
      headline: 'Une page au slug choisi',
      content: 'Contenu de la page',
      slug: chosenSlug,
    })

    const slugInput = page.getByRole('textbox', { name: 'Identifiant dans l\'URL' })
    await expect(slugInput).toHaveValue(chosenSlug)

    // Renaming keeps the chosen slug
    const titleInput = page.getByRole('textbox', { name: 'Titre de l\'article' })
    await titleInput.fill(`${title} renommé`)
    await titleInput.press('Tab')
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.getByText('Article mis à jour !')).toBeVisible()
    await expect(slugInput).toHaveValue(chosenSlug)

    await slugInput.fill(changedSlug)
    await slugInput.press('Tab')
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.getByText('Article mis à jour !').last()).toBeVisible()
    await expect(slugInput).toHaveValue(changedSlug)

    await page.goto(`/posts/${changedSlug}`)
    await expect(page.getByRole('heading', { level: 1, name: `${title} renommé` })).toBeVisible()

    // The previous slug keeps leading to the post
    await page.goto(`/posts/${chosenSlug}`)
    await expect(page.getByRole('heading', { level: 1, name: `${title} renommé` })).toBeVisible()
  })
})
