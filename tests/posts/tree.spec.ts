import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { createPost, deletePosts } from '../helpers'
import * as path from 'path'

const __dirname = import.meta.dirname

// Fills the admin form of a markdown page under `parentName`, then optionally switches it
// back to a news before saving. Returns the id of the created post.
async function createPageThroughForm(page: Page, options: { title: string, parentName: string, switchToNews?: boolean }): Promise<string> {
  await page.goto('/admin/posts/new')
  await page.waitForLoadState('networkidle')
  await page.getByRole('textbox', { name: 'Titre de l\'article' }).fill(options.title)
  await page.getByRole('textbox', { name: 'Entête' }).fill('Une sous-page')
  await page.locator('label').filter({ hasText: /^Page$/ }).click()

  await page.getByTestId('searchable-select-page-parente').click()
  await page.getByPlaceholder('Aucune, la page est à la racine').fill(options.parentName)
  await page.getByRole('option', { name: new RegExp(options.parentName) }).click()

  if (options.switchToNews) {
    await page.getByText('Actualité', { exact: true }).click()
  }

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Parcourir' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))

  await page.getByRole('button', { name: 'Suivant' }).click()
  await expect(page.getByTestId('markdown-editor')).toBeVisible({ timeout: 30000 })
  await page.getByTestId('markdown-editor').click()
  await page.getByTestId('markdown-editor').fill('Contenu de la sous-page')
  await page.getByTestId('markdown-editor').press('Tab')
  await page.waitForTimeout(500)

  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page).toHaveURL(/\/admin\/posts\/(?!new)[a-z0-9-]+$/)
  return page.url().split('/').pop()!
}

test.describe('Pages tree', () => {
  const createdIds: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deletePosts(request, createdIds)
  })

  test('a sub-page lives under its parent path, with a breadcrumb to it', async ({ page, request }) => {
    const uniqueId = Date.now()
    const parent = await createPost(request, { name: `Parent ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(parent.id)
    const child = await createPost(request, { name: `Enfant ${uniqueId}`, content: 'Contenu', kind: 'page', parent: parent.id })
    createdIds.push(child.id)

    await page.goto(`/pages/${parent.slug}/${child.slug}`)
    await expect(page.getByRole('heading', { level: 1, name: child.name })).toBeVisible()
    await expect(page.getByRole('link', { name: parent.name })).toHaveAttribute('href', `/pages/${parent.slug}`)

    // The /posts URL of a page, and a path that misses its parent, are redirected by the
    // server to the canonical one
    for (const url of [`/posts/${child.slug}`, `/pages/${child.slug}`]) {
      const response = await request.get(url, { maxRedirects: 0 })
      expect(response.status()).toBe(301)
      expect(response.headers().location).toContain(`/pages/${parent.slug}/${child.slug}`)
    }
  })

  test('a full page blocs sub-page shows the breadcrumb of its parents, without header', async ({ page, request }) => {
    const uniqueId = Date.now()
    const parent = await createPost(request, { name: `Parent ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(parent.id)
    const child = await createPost(request, { name: `Enfant blocs ${uniqueId}`, kind: 'page', body_type: 'blocs', blocs: [], parent: parent.id })
    createdIds.push(child.id)

    await page.goto(`/pages/${parent.slug}/${child.slug}`)
    await expect(page.getByRole('link', { name: parent.name })).toHaveAttribute('href', `/pages/${parent.slug}`)
    await expect(page.getByRole('heading', { level: 1, name: child.name })).not.toBeVisible()
  })

  test('the parent picked in the form puts the page under it', async ({ page, request }) => {
    const uniqueId = Date.now()
    const parent = await createPost(request, { name: `Parent ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(parent.id)

    const childId = await createPageThroughForm(page, { title: `Enfant ${uniqueId}`, parentName: parent.name })
    createdIds.push(childId)

    await page.goto(`/posts/${childId}`)
    await expect(page).toHaveURL(new RegExp(`/pages/${parent.slug}/enfant-${uniqueId}$`))
  })

  test('switching a page back to a news drops the parent picked for it', async ({ page, request }) => {
    const uniqueId = Date.now()
    const parent = await createPost(request, { name: `Parent ${uniqueId}`, content: 'Contenu', kind: 'page' })
    createdIds.push(parent.id)

    // Saving lands on the admin page only if the API accepted the news, which it refuses with a parent
    const newsId = await createPageThroughForm(page, { title: `Actualité ${uniqueId}`, parentName: parent.name, switchToNews: true })
    createdIds.push(newsId)

    await page.goto(`/posts/${newsId}`)
    await expect(page).toHaveURL(new RegExp(`/posts/actualite-${uniqueId}$`))
  })
})
