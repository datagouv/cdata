import type { Page } from '@playwright/test'
import { expect } from '../base'
import { gotoHydrated } from '../helpers'
import * as path from 'path'

const __dirname = import.meta.dirname

export type PostDescription = {
  title: string
  headline: string
  slug?: string
  kind?: 'news' | 'page'
  parentName?: string
  bodyType?: 'markdown' | 'blocs'
}

// Fills the first step of the post creation form, up to the cover.
export async function fillPostDescription(page: Page, options: PostDescription) {
  await gotoHydrated(page, '/admin/posts/new')
  await page.getByRole('textbox', { name: 'Titre de l\'article' }).fill(options.title)
  if (options.slug) {
    await page.getByRole('textbox', { name: 'Identifiant dans l\'URL' }).fill(options.slug)
  }
  await page.getByRole('textbox', { name: 'Entête' }).fill(options.headline)
  if (options.kind === 'page') {
    await page.locator('label').filter({ hasText: /^Page$/ }).click()
  }
  if (options.parentName) {
    await page.getByTestId('searchable-select-page-parente').click()
    await page.getByPlaceholder('Aucune, la page est à la racine').fill(options.parentName)
    await page.getByRole('option', { name: new RegExp(options.parentName) }).click()
  }
  if (options.bodyType === 'blocs') {
    await page.locator('label').filter({ hasText: /^Blocs$/ }).click()
  }

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Parcourir' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))
}

// Fills the second step of a markdown post, from the first one.
export async function fillPostContent(page: Page, content: string) {
  await page.getByRole('button', { name: 'Suivant' }).click()
  await expect(page.getByTestId('markdown-editor')).toBeVisible({ timeout: 30000 })
  await page.getByTestId('markdown-editor').click()
  await page.getByTestId('markdown-editor').fill(content)
  await page.getByTestId('markdown-editor').press('Tab')
  await page.waitForTimeout(500)
}

// Saves the new post and returns its id, read from the admin page the form lands on.
export async function saveNewPost(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page).toHaveURL(/\/admin\/posts\/(?!new)[a-z0-9-]+$/)
  return page.url().split('/').pop()!
}

// Fills both steps of a markdown post, without saving it.
export async function fillNewPostForm(page: Page, options: PostDescription & { content: string }) {
  await fillPostDescription(page, options)
  await fillPostContent(page, options.content)
}

// Creates a markdown post through the admin form and returns its id.
export async function createMarkdownPost(page: Page, options: PostDescription & { content: string }): Promise<string> {
  await fillNewPostForm(page, options)
  return await saveNewPost(page)
}
