import { test, expect } from '@playwright/test'
import * as path from 'path'

const __dirname = import.meta.dirname

test.describe('Post with blocs', () => {
  const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'
  let postId: string | undefined

  test.afterEach(async ({ request }) => {
    if (postId) {
      const res = await request.delete(`${API_BASE_URL}/api/1/posts/${postId}/`)
      console.log(`DELETE post ${postId}: ${res.status()}`)
      postId = undefined
    }
  })

  test('creating a post with blocs redirects to the page editor', async ({ page }) => {
    const uniqueId = Date.now()

    await page.goto('/admin/posts/new')
    await page.getByRole('textbox', { name: 'Titre de l\'article' }).fill(`Test Blocs ${uniqueId}`)
    await page.getByRole('textbox', { name: 'Entête' }).fill('Un article avec blocs')
    await page.getByText('Blocs', { exact: true }).click()

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))

    await page.getByRole('button', { name: 'Suivant' }).click()

    // Should redirect to the post page with edit=true (the page editor)
    await expect(page).toHaveURL(/\/posts\/[a-z0-9-]+\?edit=true/, { timeout: 10000 })

    // Extract post ID from the URL for cleanup
    const url = page.url()
    const postSlug = url.match(/\/posts\/([a-z0-9-]+)\?/)?.[1]

    // Get post ID from API using slug
    if (postSlug) {
      const response = await page.request.get(`${API_BASE_URL}/api/1/posts/${postSlug}/`)
      const postData = await response.json()
      postId = postData.id
    }

    // Verify we're in edit mode (the "Ajouter un bloc" button should be visible)
    await expect(page.getByRole('button', { name: 'Ajouter un bloc' })).toBeVisible()
  })

  test('page + blocs post displays full page without header', async ({ page }) => {
    const uniqueId = Date.now()

    // Create post via UI with kind=page and body_type=blocs
    await page.goto('/admin/posts/new')
    await page.getByRole('textbox', { name: 'Titre de l\'article' }).fill(`Test Full Page ${uniqueId}`)
    await page.getByRole('textbox', { name: 'Entête' }).fill('A full page post')
    await page.locator('label').filter({ hasText: /^Page$/ }).click()
    await page.getByText('Blocs', { exact: true }).click()

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))

    await page.getByRole('button', { name: 'Suivant' }).click()

    // Should redirect to the post page with edit=true
    await expect(page).toHaveURL(/\/posts\/[a-z0-9-]+\?edit=true/, { timeout: 10000 })

    // Extract post slug and ID
    const url = page.url()
    const postSlug = url.match(/\/posts\/([a-z0-9-]+)\?/)?.[1]

    if (postSlug) {
      const response = await page.request.get(`${API_BASE_URL}/api/1/posts/${postSlug}/`)
      const postData = await response.json()
      postId = postData.id
    }

    // Add a Hero bloc
    await page.getByRole('button', { name: 'Ajouter un bloc' }).first().click()
    await page.getByText('Hero').click()
    await page.waitForTimeout(300)

    // Edit the hero title
    const heroTitle = page.locator('.bg-new-blue-illustration [contenteditable="true"]').first()
    await heroTitle.click()
    await heroTitle.fill('Full page content')
    await page.mouse.click(1, 1)

    // Save the page
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await page.waitForTimeout(1000)
    await expect(page.getByText('Page créée').or(page.getByText('Page sauvegardée'))).toBeVisible()

    // Now visit the post page in view mode (without edit=true)
    await page.goto(`/posts/${postSlug}`)
    await page.waitForLoadState('networkidle')

    // Verify no breadcrumb is visible (full page mode)
    await expect(page.locator('nav').filter({ hasText: 'Accueil' })).not.toBeVisible()

    // Verify no title h1 with post name is visible
    await expect(page.getByRole('heading', { level: 1, name: `Test Full Page ${uniqueId}` })).not.toBeVisible()

    // Verify the bloc content is visible
    await expect(page.getByText('Full page content')).toBeVisible()
  })

  test('news + blocs post displays with header and breadcrumb', async ({ page }) => {
    const uniqueId = Date.now()

    // Create post via UI with kind=news and body_type=blocs
    await page.goto('/admin/posts/new')
    await page.getByRole('textbox', { name: 'Titre de l\'article' }).fill(`Test News Blocs ${uniqueId}`)
    await page.getByRole('textbox', { name: 'Entête' }).fill('A news post with blocs')
    // news is default, no need to click
    await page.getByText('Blocs', { exact: true }).click()

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))

    await page.getByRole('button', { name: 'Suivant' }).click()

    // Should redirect to the post page with edit=true
    await expect(page).toHaveURL(/\/posts\/[a-z0-9-]+\?edit=true/, { timeout: 10000 })

    // Extract post slug and ID
    const url = page.url()
    const postSlug = url.match(/\/posts\/([a-z0-9-]+)\?/)?.[1]

    if (postSlug) {
      const response = await page.request.get(`${API_BASE_URL}/api/1/posts/${postSlug}/`)
      const postData = await response.json()
      postId = postData.id
    }

    // Add a Hero bloc
    await page.getByRole('button', { name: 'Ajouter un bloc' }).first().click()
    await page.getByText('Hero').click()
    await page.waitForTimeout(300)

    // Edit the hero title
    const heroTitle = page.locator('.bg-new-blue-illustration [contenteditable="true"]').first()
    await heroTitle.click()
    await heroTitle.fill('News content')
    await page.mouse.click(1, 1)

    // Save the page
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await page.waitForTimeout(1000)
    await expect(page.getByText('Page créée').or(page.getByText('Page sauvegardée'))).toBeVisible()

    // Now visit the post page in view mode
    await page.goto(`/posts/${postSlug}`)
    await page.waitForLoadState('networkidle')

    // Verify breadcrumb is visible (news mode with header)
    await expect(page.getByText('Accueil').first()).toBeVisible()
    await expect(page.getByText('Articles')).toBeVisible()

    // Verify title h1 with post name is visible
    await expect(page.getByRole('heading', { level: 1, name: `Test News Blocs ${uniqueId}` })).toBeVisible()

    // Verify headline is visible
    await expect(page.getByText('A news post with blocs')).toBeVisible()

    // Verify the bloc content is visible
    await expect(page.getByText('News content')).toBeVisible()
  })
})
