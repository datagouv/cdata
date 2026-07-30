import { test, expect } from './base'

const { NUXT_SITEMAP_INDEX_URL: SITEMAP_URL } = process.env

test.describe('sitemap index', () => {
  test('returns valid XML', async ({ page }) => {
    const response = await page.request.get('/sitemap_index.xml')
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/xml')

    const text = await response.text()
    expect(text).toContain('<?xml version="1.0"')
    expect(text).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
  })

  test('includes the external sitemap URL when NUXT_SITEMAP_INDEX_URL is set', async ({ page }) => {
    test.skip(!SITEMAP_URL, 'NUXT_SITEMAP_INDEX_URL not set')

    const text = await (await page.request.get('/sitemap_index.xml')).text()
    expect(text).toContain(`<loc>${SITEMAP_URL}</loc>`)
    const locCount = (text.match(/<loc>/g) || []).length
    expect(locCount).toBe(3)
  })

  test('omits the external sitemap URL when NUXT_SITEMAP_INDEX_URL is not set', async ({ page }) => {
    test.skip(!!SITEMAP_URL, 'NUXT_SITEMAP_INDEX_URL is set')

    const text = await (await page.request.get('/sitemap_index.xml')).text()
    const locCount = (text.match(/<loc>/g) || []).length
    expect(locCount).toBe(2)
  })
})
