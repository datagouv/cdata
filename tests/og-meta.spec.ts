import { test, expect } from './base'
import type { Page } from '@playwright/test'

async function getMetaContent(page: Page, selector: string) {
  const locator = page.locator(selector)
  await expect(locator).toHaveCount(1)
  return locator.getAttribute('content')
}

test.describe('OG meta tags', () => {
  test('homepage has a title and description-derived OG tags', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    expect(await getMetaContent(page, 'meta[property="og:title"]')).toBeTruthy()
    expect(await getMetaContent(page, 'meta[property="og:description"]')).toBeTruthy()
  })

  test('dataset page derives og:title and og:description from the dataset', async ({ page }) => {
    await page.goto('/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/')
    await page.waitForLoadState('domcontentloaded')

    const ogTitle = await getMetaContent(page, 'meta[property="og:title"]')
    const ogDescription = await getMetaContent(page, 'meta[property="og:description"]')
    const description = await getMetaContent(page, 'meta[name="description"]')
    expect(ogTitle).toContain('Base Sirene')
    expect(ogDescription).toBeTruthy()
    expect(ogDescription).toBe(description)
  })

  test('CADA advice page derives og:title from the advice title', async ({ page }) => {
    await page.goto('/explore/cada/20237028')
    await page.waitForLoadState('domcontentloaded')

    expect(await getMetaContent(page, 'meta[property="og:title"]')).toContain('Avis CADA 20237028')
  })
})
