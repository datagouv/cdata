import { test, expect } from '../base'
import * as path from 'path'

const __dirname = import.meta.dirname

test.describe('Post slug', () => {
  let postId: string | undefined
  const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

  test.afterEach(async ({ request }) => {
    if (postId) {
      await request.delete(`${API_BASE_URL}/api/1/posts/${postId}/`)
      postId = undefined
    }
  })

  test('a sysadmin chooses the slug at creation and changes it afterwards', async ({ page }) => {
    const uniqueId = Date.now()
    const title = `Test Slug ${uniqueId}`
    const chosenSlug = `slug-choisi-${uniqueId}`
    const changedSlug = `slug-modifie-${uniqueId}`

    await page.goto('/admin/posts/new')
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox', { name: 'Titre de l\'article' }).fill(title)
    await page.getByRole('textbox', { name: 'Identifiant dans l\'URL' }).fill(chosenSlug)
    await page.getByRole('textbox', { name: 'Entête' }).fill('Une page au slug choisi')

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))

    await page.getByRole('button', { name: 'Suivant' }).click()
    await expect(page.getByTestId('markdown-editor')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('markdown-editor').click()
    await page.getByTestId('markdown-editor').fill('Contenu de la page')
    await page.getByTestId('markdown-editor').press('Tab')
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/(?!new)[a-z0-9-]+$/)
    postId = page.url().split('/').pop()

    const slugInput = page.getByRole('textbox', { name: 'Identifiant dans l\'URL' })
    await expect(slugInput).toHaveValue(chosenSlug)

    await slugInput.fill(changedSlug)
    await slugInput.press('Tab')
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.getByText('Article mis à jour !')).toBeVisible()
    await expect(slugInput).toHaveValue(changedSlug)

    await page.goto(`/posts/${changedSlug}`)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()

    // The previous slug keeps leading to the post
    await page.goto(`/posts/${chosenSlug}`)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  })
})
