import type { APIRequestContext, Page } from '@playwright/test'
import { test, expect } from './base'
import { API_BASE, createDatasetWithRemoteResources, deleteDatasets } from './helpers'

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
  const createdDatasets: Array<string> = []

  test.afterEach(async ({ request }) => {
    await deleteDatasets(request, createdDatasets)
  })

  // A dataset of our own: the search fixtures hold too few datasets to paginate.
  // Resources are listed newest first, so read both page tops from the same
  // endpoint the page uses rather than guessing them from the creation order.
  async function datasetWithTwoPagesOfResources(page: Page, request: APIRequestContext) {
    const titles = Array.from({ length: 12 }, (_, index) => `Fichier numero ${String(index + 1).padStart(2, '0')}`)
    const { dataset } = await createDatasetWithRemoteResources(request, `Test scroll ${Date.now()}`, titles)
    createdDatasets.push(dataset.id)

    const firstOf = async (pageNumber: number) => {
      const response = await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/resources/?type=main&page=${pageNumber}&page_size=10`)
      const { data } = await response.json()
      return data[0].title as string
    }
    const tops = { firstOfFirstPage: await firstOf(1), firstOfSecondPage: await firstOf(2) }

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    return tops
  }

  test('paging goes back to the top of the list, not to the top of the page', async ({ page, request }) => {
    const { firstOfSecondPage } = await datasetWithTwoPagesOfResources(page, request)

    const nextPage = page.getByTestId('next-page')
    await nextPage.scrollIntoViewIfNeeded()
    await nextPage.click()

    await expect(page.getByText(firstOfSecondPage)).toBeInViewport()
    // The list starts below the dataset header: landing at the very top of the
    // document would mean the scroll was reset instead of aimed at the list.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })

  test('paging leaves the page alone when the top of the list is already visible', async ({ page, request }) => {
    const { firstOfFirstPage, firstOfSecondPage } = await datasetWithTwoPagesOfResources(page, request)

    // Put the top of the list on screen, then page from there. Clicking through
    // Playwright would scroll the pagination into view first and undo that, so
    // the click is dispatched where the reader would trigger it from.
    await page.getByText(firstOfFirstPage).scrollIntoViewIfNeeded()
    const before = await page.evaluate(() => window.scrollY)
    expect(before).toBeGreaterThan(0)

    await page.evaluate(() => document.querySelector<HTMLElement>('[data-testid="next-page"]')?.click())

    await expect(page.getByText(firstOfSecondPage)).toBeVisible()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before)
  })

  test('changing a filter brings the top of the list back into view', async ({ page }) => {
    // A short viewport keeps the top of the results off screen once scrolled
    // down to the filters.
    await page.setViewportSize({ width: 1280, height: 600 })
    await page.goto('/design/dataset-search')
    await expect(page.getByTestId('search-result-count')).toBeVisible()
    await page.waitForLoadState('networkidle')

    const themeFilter = page.locator('#theme-filter')
    await themeFilter.scrollIntoViewIfNeeded()
    await expect(page.getByTestId('search-result-count')).not.toBeInViewport()

    await themeFilter.selectOption('education')

    await expect(page.getByTestId('search-result-count')).toBeInViewport()
  })
})
