import { test, expect } from '@playwright/test'
import * as path from 'path'

const __dirname = import.meta.dirname

test.describe('Post kind filter', () => {
  let newsPostId: string | undefined
  let pagePostId: string | undefined
  const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

  test.afterEach(async ({ request }) => {
    // Cleanup created posts to avoid affecting other tests (like homepage screenshot)
    if (newsPostId) {
      const res = await request.delete(`${API_BASE_URL}/api/1/posts/${newsPostId}/`)
      console.log(`DELETE news post ${newsPostId}: ${res.status()}`)
      newsPostId = undefined
    }
    if (pagePostId) {
      const res = await request.delete(`${API_BASE_URL}/api/1/posts/${pagePostId}/`)
      console.log(`DELETE page post ${pagePostId}: ${res.status()}`)
      pagePostId = undefined
    }
  })

  test('page posts should not appear in public news list, admin should show type and filter', async ({ page }) => {
    const uniqueId = Date.now()

    // Create a news post via form
    await page.goto('/admin/posts/new')
    await page.getByRole('textbox', { name: 'Titre de l\'article' }).fill(`Test News ${uniqueId}`)
    await page.getByRole('textbox', { name: 'Entête' }).fill('Une actualité de test')
    await page.getByText('Actualité', { exact: true }).click()

    const fileChooserPromise1 = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser1 = await fileChooserPromise1
    await fileChooser1.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))

    await page.getByRole('button', { name: 'Suivant' }).click()
    await page.locator('.milkdown .editor').click()
    await page.locator('.milkdown .editor').fill('Contenu de l\'actualité')
    await page.waitForTimeout(500) // Wait for milkdown to propagate content

    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/(?!new)[a-z0-9-]+$/)
    newsPostId = page.url().split('/').pop()

    // Publish the news post
    const publishButton = page.getByRole('button', { name: 'Publier', exact: true })
    await publishButton.scrollIntoViewIfNeeded()
    await publishButton.click()
    await expect(page.getByRole('button', { name: 'Dépublier' })).toBeVisible({ timeout: 10000 })

    // Create a page post via form (reload to clear state)
    await page.goto('/admin/posts/new?fresh=1')
    await page.reload()

    await page.getByRole('textbox', { name: 'Titre de l\'article' }).fill(`Test Page ${uniqueId}`)
    await page.getByRole('textbox', { name: 'Entête' }).fill('Une page de test')
    await page.locator('label').filter({ hasText: /^Page$/ }).click()

    const fileChooserPromise2 = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Parcourir' }).click()
    const fileChooser2 = await fileChooserPromise2
    await fileChooser2.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))

    await page.getByRole('button', { name: 'Suivant' }).click()
    await page.locator('.milkdown .editor').click()
    await page.locator('.milkdown .editor').fill('Contenu de la page')
    await page.waitForTimeout(500) // Wait for milkdown to propagate content

    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/(?!new)[a-z0-9-]+$/)
    pagePostId = page.url().split('/').pop()

    // Publish the page post
    const publishButton2 = page.getByRole('button', { name: 'Publier', exact: true })
    await publishButton2.scrollIntoViewIfNeeded()
    await publishButton2.click()
    await expect(page.getByRole('button', { name: 'Dépublier' })).toBeVisible({ timeout: 10000 })

    // Go to homepage and verify the latest news appears in the news section (not the page)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 3, name: `Test News ${uniqueId}` })).toBeVisible()
    await expect(page.getByText(`Test Page ${uniqueId}`)).not.toBeVisible()

    // Go to public news page and verify only news appears
    await page.goto('/posts')
    await expect(page.getByText(`Test News ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Test Page ${uniqueId}`)).not.toBeVisible()

    // Go to admin posts page
    await page.goto('/admin/site/posts')

    // Verify both posts appear with correct types
    await expect(page.getByText(`Test News ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Test Page ${uniqueId}`)).toBeVisible()

    const newsRow = page.locator('tr', { has: page.getByText(`Test News ${uniqueId}`) })
    const pageRow = page.locator('tr', { has: page.getByText(`Test Page ${uniqueId}`) })

    await expect(newsRow.getByRole('cell', { name: 'Actualité', exact: true })).toBeVisible()
    await expect(pageRow.getByRole('cell', { name: 'Page', exact: true })).toBeVisible()

    // Test filter: filter by "Page" type
    await page.getByTestId('searchable-select-filtrerpartype').click()
    await page.getByRole('option', { name: 'Page' }).click()

    await expect(page.getByText(`Test Page ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Test News ${uniqueId}`)).not.toBeVisible()

    // Test filter: filter by "Actualité" type
    await page.getByTestId('searchable-select-filtrerpartype').click()
    await page.getByRole('option', { name: 'Actualité' }).click()

    await expect(page.getByText(`Test News ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Test Page ${uniqueId}`)).not.toBeVisible()
  })
})
