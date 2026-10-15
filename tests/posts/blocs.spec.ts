import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE } from '../helpers'
import { fillPostDescription } from './helpers'

async function createPostWithBlocs(page: Page, options: {
  title: string
  headline: string
  kind?: 'news' | 'page'
}) {
  await fillPostDescription(page, { ...options, bodyType: 'blocs' })
  await page.getByRole('button', { name: 'Suivant' }).click()
  await expect(page).toHaveURL(/\/posts\/[a-z0-9-]+\?edit=true/, { timeout: 10000 })

  const url = page.url()
  const postSlug = url.match(/\/posts\/([a-z0-9-]+)\?/)?.[1]

  let postId: string | undefined
  if (postSlug) {
    const response = await page.request.get(`${API_BASE}/api/1/posts/${postSlug}/`)
    const postData = await response.json()
    postId = postData.id
  }

  return { postSlug, postId }
}

async function addHeroBlocAndSave(page: Page, title: string) {
  await page.getByRole('button', { name: 'Ajouter un bloc' }).first().click()
  await page.getByText('Hero').click()

  const heroTitle = page.locator('.bg-new-blue-illustration [contenteditable="true"]').first()
  await heroTitle.click()
  await heroTitle.fill(title)
  await page.mouse.click(1, 1)

  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page.getByText('Page créée').or(page.getByText('Page sauvegardée'))).toBeVisible()
}

test.describe('Post with blocs', () => {
  let postId: string | undefined

  test.afterEach(async ({ request }) => {
    if (postId) {
      await request.delete(`${API_BASE}/api/1/posts/${postId}/`)
      postId = undefined
    }
  })

  test('creating a post with blocs redirects to the page editor', async ({ page }) => {
    const uniqueId = Date.now()
    const result = await createPostWithBlocs(page, {
      title: `Test Blocs ${uniqueId}`,
      headline: 'Un article avec blocs',
    })
    postId = result.postId

    await expect(page.getByRole('button', { name: 'Ajouter un bloc' })).toBeVisible()
  })

  test('page + blocs displays full page without header', async ({ page }) => {
    const uniqueId = Date.now()
    const result = await createPostWithBlocs(page, {
      title: `Test Full Page ${uniqueId}`,
      headline: 'A full page post',
      kind: 'page',
    })
    postId = result.postId

    await addHeroBlocAndSave(page, 'Full page content')

    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')

    // Full page mode: no breadcrumb, no title
    await expect(page.locator('nav').filter({ hasText: 'Accueil' })).not.toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: `Test Full Page ${uniqueId}` })).not.toBeVisible()
    await expect(page.getByText('Full page content')).toBeVisible()
  })

  test('news + blocs displays with header and breadcrumb', async ({ page }) => {
    const uniqueId = Date.now()
    const result = await createPostWithBlocs(page, {
      title: `Test News Blocs ${uniqueId}`,
      headline: 'A news post with blocs',
      kind: 'news',
    })
    postId = result.postId

    await addHeroBlocAndSave(page, 'News content')

    await page.goto(`/posts/${result.postSlug}`)
    await page.waitForLoadState('networkidle')

    // News mode: breadcrumb, title, headline visible
    await expect(page.getByText('Accueil').first()).toBeVisible()
    await expect(page.getByText('Articles')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: `Test News Blocs ${uniqueId}` })).toBeVisible()
    await expect(page.getByText('A news post with blocs')).toBeVisible()
    await expect(page.getByText('News content')).toBeVisible()
  })
})
