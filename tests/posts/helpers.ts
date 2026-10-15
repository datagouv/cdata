import type { Page } from '@playwright/test'
import { expect } from '../base'
import * as path from 'path'

const __dirname = import.meta.dirname

// Creates a markdown post through the admin form and returns its id, read from the
// admin page the form lands on.
export async function createMarkdownPost(page: Page, options: {
  title: string
  headline: string
  content: string
  slug?: string
  kind?: 'news' | 'page'
}): Promise<string> {
  await page.goto('/admin/posts/new')
  await page.waitForLoadState('networkidle')
  await page.getByRole('textbox', { name: 'Titre de l\'article' }).fill(options.title)
  if (options.slug) {
    await page.getByRole('textbox', { name: 'Identifiant dans l\'URL' }).fill(options.slug)
  }
  await page.getByRole('textbox', { name: 'Entête' }).fill(options.headline)
  if (options.kind === 'page') {
    await page.locator('label').filter({ hasText: /^Page$/ }).click()
  }

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Parcourir' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(path.join(__dirname, '../../public/nuxt_images/onboarding/logo-ign.png'))

  await page.getByRole('button', { name: 'Suivant' }).click()
  await expect(page.getByTestId('markdown-editor')).toBeVisible({ timeout: 30000 })
  await page.getByTestId('markdown-editor').click()
  await page.getByTestId('markdown-editor').fill(options.content)
  await page.getByTestId('markdown-editor').press('Tab')
  await page.waitForTimeout(500)

  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page).toHaveURL(/\/admin\/posts\/(?!new)[a-z0-9-]+$/)
  return page.url().split('/').pop()!
}
