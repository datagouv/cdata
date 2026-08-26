import type { Page } from '@playwright/test'
import { test, expect } from './base'

// The whole scroll behaviour comes from Nuxt: hash anchors, keeping the position
// between the tabs of a same object (`definePageMeta({ scrollToTop })`), and
// scrolling back to the top on any other navigation.

const editorialPage = '/pages/donnees-energie'
const anchor = 'reutilisations'
const dataset = '/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret'

test.describe('Anchors', () => {
  // Editorial pages ship their own table of contents made of plain `#anchor`
  // links, which a custom scrollBehavior answering `{ top: 0 }` to every
  // navigation used to cancel: the URL moved, the viewport did not.
  test('landing on a page with a hash scrolls to the anchor', async ({ page }) => {
    await page.goto(`${editorialPage}#${anchor}`)

    await expect(page.locator(`#${anchor}`)).toBeInViewport()
  })

  test('clicking a table of contents link scrolls to the anchor', async ({ page }) => {
    await page.goto(editorialPage)
    await expect(page.locator(`#${anchor}`)).not.toBeInViewport()

    // The router only decides the scroll once hydrated: clicking before that
    // would pass on the browser's native jump alone.
    await page.waitForLoadState('networkidle')
    await page.click(`a[href="#${anchor}"]`)

    await expect(page).toHaveURL(`${editorialPage}#${anchor}`)
    await expect(page.locator(`#${anchor}`)).toBeInViewport()
  })
})

test.describe('Tabs', () => {
  test('switching tab keeps the scroll position', async ({ page }) => {
    await page.goto(dataset)
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => window.scrollTo(0, 400))
    await page.click(`a[href="${dataset}/discussions"]`)

    await expect(page).toHaveURL(`${dataset}/discussions`)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })

  test('reaching a tab from another page scrolls to the top', async ({ page }) => {
    await page.goto('/datasets/search?q=sirene')
    await expect(page.getByTestId('search-result-count')).toBeVisible()
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => window.scrollTo(0, 400))
    await page.click(`a[href="${dataset}"]`)

    await expect(page).toHaveURL(dataset)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  })
})

test.describe('Result lists', () => {
  const resultsTop = (page: Page) => page.getByTestId('search-result-count')

  test('paging goes back to the top of the list, not to the top of the page', async ({ page }) => {
    await page.goto('/design/dataset-search')
    await expect(resultsTop(page)).toBeVisible()
    await page.waitForLoadState('networkidle')

    const nextPage = page.getByTestId('next-page')
    await nextPage.scrollIntoViewIfNeeded()
    await expect(resultsTop(page)).not.toBeInViewport()

    await nextPage.click()

    await expect(page).toHaveURL(/page=2/)
    await expect(resultsTop(page)).toBeInViewport()
    // The list starts below the page header: landing at the very top of the
    // document would mean the scroll was reset instead of aimed at the list.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })

  test('paging leaves the page alone when the top of the list is already visible', async ({ page }) => {
    // A tall viewport keeps the whole list and its pagination on screen at once.
    await page.setViewportSize({ width: 1280, height: 2200 })
    await page.goto('/design/dataset-search')
    await expect(resultsTop(page)).toBeVisible()
    await page.waitForLoadState('networkidle')

    const nextPage = page.getByTestId('next-page')
    await nextPage.scrollIntoViewIfNeeded()
    await expect(resultsTop(page)).toBeInViewport()
    const before = await page.evaluate(() => window.scrollY)

    await nextPage.click()

    await expect(page).toHaveURL(/page=2/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before)
  })

  test('changing a filter brings the top of the list back into view', async ({ page }) => {
    await page.goto('/design/dataset-search')
    await expect(resultsTop(page)).toBeVisible()
    await page.waitForLoadState('networkidle')

    const themeFilter = page.locator('#theme-filter')
    await themeFilter.scrollIntoViewIfNeeded()
    await expect(resultsTop(page)).not.toBeInViewport()

    await themeFilter.selectOption('education')

    await expect(resultsTop(page)).toBeInViewport()
  })
})
