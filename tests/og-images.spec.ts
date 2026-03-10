import { test, expect } from './base'

async function getOgImageBuffer(page: import('@playwright/test').Page) {
  const ogImageUrl = await page.getAttribute('meta[property="og:image"]', 'content')
  expect(ogImageUrl).toBeTruthy()

  const response = await page.request.get(ogImageUrl!)
  expect(response.ok()).toBe(true)

  return response.body()
}

test.describe('OG images', () => {
  test('homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const buffer = await getOgImageBuffer(page)
    expect(buffer).toMatchSnapshot('og-homepage.png')
  })

  test('main page (datasets)', async ({ page }) => {
    await page.goto('/datasets')
    await page.waitForLoadState('domcontentloaded')

    const buffer = await getOgImageBuffer(page)
    expect(buffer).toMatchSnapshot('og-datasets.png')
  })

  test('dataset detail page', async ({ page }) => {
    await page.goto('/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/')
    await page.waitForLoadState('domcontentloaded')

    const buffer = await getOgImageBuffer(page)
    expect(buffer).toMatchSnapshot('og-dataset-sirene.png')
  })
})
