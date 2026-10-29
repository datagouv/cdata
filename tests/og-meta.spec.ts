import { test, expect } from './base'
import type { Page } from '@playwright/test'

async function getMetaContent(page: Page, selector: string) {
  const locator = page.locator(selector)
  await expect(locator).toHaveCount(1)
  return locator.getAttribute('content')
}

test.describe('OG meta tags', () => {
  // Crawlers only read the server HTML: without JS these fail if the meta tags
  // only appear after hydration.
  test.describe('server-rendered meta', () => {
    test.use({ javaScriptEnabled: false })

    test('homepage has a title and description-derived OG tags', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      expect(await getMetaContent(page, 'meta[property="og:title"]')).toBeTruthy()
      expect(await getMetaContent(page, 'meta[property="og:description"]')).toBeTruthy()
    })

    test('a public page without a title falls back to the site name for og:title', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('domcontentloaded')

      expect(await getMetaContent(page, 'meta[property="og:title"]'))
        .toBe(await getMetaContent(page, 'meta[property="og:site_name"]'))
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

  test('a CADA advice with no Objet falls back to the site-wide description', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const siteDescription = await getMetaContent(page, 'meta[name="description"]')
    const siteOgDescription = await getMetaContent(page, 'meta[property="og:description"]')

    // Load the list first and navigate client-side from a real row: the advice
    // id is whatever the real data happens to put first, read back from the
    // intercepted request itself, so the fixture below needs no id of its own.
    await page.goto('/explore/cada')
    await expect(page.getByTestId('row-count')).toBeVisible({ timeout: 30000 })

    const readable = (url: string) => decodeURIComponent(url.replace(/\+/g, ' '))
    await page.route(url => readable(url.href).includes('Numéro de dossier__exact='), async (route) => {
      const dossier = readable(route.request().url()).match(/Numéro de dossier__exact=(\d+)/)?.[1] ?? '1'
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({
          data: [{
            'Numéro de dossier': Number(dossier),
            'Administration': 'Mairie de Test',
            'Type': 'Avis',
            'Année': 2024,
            'Séance': '2024-01-01',
            // Blank, not missing: normalizeSeoDescription() must treat whitespace-only
            // the same as empty, and the page must leave the site-wide tags in place.
            'Objet': '   ',
            'Thème et sous thème': '',
            'Mots clés': '',
            'Sens et motivation': '',
            'Partie': '',
            'Avis': 'Texte intégral',
          }],
          links: { profile: '', swagger: '', next: '' },
          meta: { total: 1 },
        }),
      })
    })

    await page.getByTestId('data-table').locator('a.link').first().click()
    await page.waitForURL(/\/explore\/cada\/\d+/, { timeout: 30000 })
    await expect(page.getByText('Texte intégral')).toBeVisible({ timeout: 30000 })

    expect(await getMetaContent(page, 'meta[name="description"]')).toBe(siteDescription)
    expect(await getMetaContent(page, 'meta[property="og:description"]')).toBe(siteOgDescription)
  })
})
