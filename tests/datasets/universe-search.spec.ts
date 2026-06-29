import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import topics from './universe-search-fixtures/topics.json' with { type: 'json' }
import elements from './universe-search-fixtures/elements.json' with { type: 'json' }
import searchEmpty from './universe-search-fixtures/search-empty.json' with { type: 'json' }

const PAGE = '/design/universe-search'
const UNIVERSE_1 = topics.data[0]
const UNIVERSE_2 = topics.data[1]

async function mockUniverseAPIs(page: Page) {
  // elements must be registered before the broader topics pattern
  await page.route('**/api/2/topics/*/elements/**', route => route.fulfill({ json: elements }))
  await page.route('**/api/2/topics/**', route => route.fulfill({ json: topics }))
  await page.route('**/api/2/datasets/search/**', route => route.fulfill({ json: searchEmpty }))
  await page.route('**/api/2/dataservices/search/**', route => route.fulfill({ json: searchEmpty }))
  await page.route('**/api/2/reuses/search/**', route => route.fulfill({ json: searchEmpty }))
}

async function gotoAndWait(page: Page, url = PAGE) {
  await mockUniverseAPIs(page)
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  const fieldset = page.locator('fieldset').filter({ hasText: 'Univers' })
  await expect(fieldset.locator('input[type="radio"]').first()).toBeVisible()
  return fieldset
}

test('universe selector renders in sidebar with both universes', async ({ page }) => {
  const fieldset = await gotoAndWait(page)
  await expect(fieldset.getByRole('radio', { name: UNIVERSE_1.name })).toBeVisible()
  await expect(fieldset.getByRole('radio', { name: UNIVERSE_2.name })).toBeVisible()
})

test('first universe has no ?universe= param in URL', async ({ page }) => {
  await gotoAndWait(page)
  expect(new URL(page.url()).searchParams.has('universe')).toBeFalsy()
})

test('switching to second universe writes ?universe= to URL', async ({ page }) => {
  const fieldset = await gotoAndWait(page)
  await fieldset.getByRole('radio', { name: UNIVERSE_2.name }).click({ force: true })
  await page.waitForURL(url => url.searchParams.get('universe') === UNIVERSE_2.id)
  expect(new URL(page.url()).searchParams.get('universe')).toBe(UNIVERSE_2.id)
})

test('switching back to first universe removes ?universe= from URL', async ({ page }) => {
  const fieldset = await gotoAndWait(page)
  await fieldset.getByRole('radio', { name: UNIVERSE_2.name }).click({ force: true })
  await page.waitForURL(url => url.searchParams.has('universe'))
  await fieldset.getByRole('radio', { name: UNIVERSE_1.name }).click({ force: true })
  await page.waitForURL(url => !url.searchParams.has('universe'))
  expect(new URL(page.url()).searchParams.has('universe')).toBeFalsy()
})

test('deep link to second universe pre-selects it', async ({ page }) => {
  await gotoAndWait(page, `${PAGE}?universe=${UNIVERSE_2.id}`)
  const fieldset = page.locator('fieldset').filter({ hasText: 'Univers' })
  await expect(fieldset.getByRole('radio', { name: UNIVERSE_2.name })).toBeChecked()
})

test('API requests include topic= param matching the active universe', async ({ page }) => {
  const fieldset = await gotoAndWait(page)

  const topicRequest = page.waitForRequest(req =>
    req.url().includes('/api/2/datasets/search/')
    && new URL(req.url()).searchParams.get('topic') === UNIVERSE_2.id,
  )
  await fieldset.getByRole('radio', { name: UNIVERSE_2.name }).click({ force: true })
  await topicRequest
})

test('search query persists across universe switch', async ({ page }) => {
  const fieldset = await gotoAndWait(page)

  const searchInput = page.getByRole('textbox').first()
  await searchInput.fill('budget')
  await page.waitForURL(url => url.searchParams.get('q') === 'budget')

  await fieldset.getByRole('radio', { name: UNIVERSE_2.name }).click({ force: true })
  await page.waitForURL(url => url.searchParams.has('universe'))

  expect(new URL(page.url()).searchParams.get('q')).toBe('budget')
  await expect(searchInput).toHaveValue('budget')
})

test('page resets to 1 when switching universe', async ({ page }) => {
  await gotoAndWait(page, `${PAGE}?page=3`)
  const fieldset = page.locator('fieldset').filter({ hasText: 'Univers' })
  await fieldset.getByRole('radio', { name: UNIVERSE_2.name }).click({ force: true })
  await page.waitForURL(url => url.searchParams.get('universe') === UNIVERSE_2.id)
  expect(new URL(page.url()).searchParams.has('page')).toBeFalsy()
})

test('even universe has no reuses type, odd universe has reuses', async ({ page }) => {
  const fieldset = await gotoAndWait(page)
  const typeFieldset = page.locator('fieldset').filter({ hasText: 'Type' })

  // Universe 1 (index 0, even): no reuses
  await expect(typeFieldset.getByRole('radio', { name: /Réutilisations/i })).not.toBeAttached()

  // Universe 2 (index 1, odd): has reuses
  await fieldset.getByRole('radio', { name: UNIVERSE_2.name }).click({ force: true })
  await page.waitForURL(url => url.searchParams.has('universe'))
  await expect(typeFieldset.getByRole('radio', { name: /Réutilisations/i })).toBeVisible()
})

test('type is preserved across universe switch when class exists in both', async ({ page }) => {
  const fieldset = await gotoAndWait(page)
  const typeFieldset = page.locator('fieldset').filter({ hasText: 'Type' })

  await typeFieldset.getByRole('radio', { name: /API/i }).click({ force: true })
  await page.waitForURL(url => url.searchParams.has('type'))

  await fieldset.getByRole('radio', { name: UNIVERSE_2.name }).click({ force: true })
  await page.waitForURL(url => url.searchParams.has('universe'))

  await expect(typeFieldset.getByRole('radio', { name: /API/i })).toBeChecked()
})

test('no console errors when switching between universes', async ({ page }) => {
  const fieldset = await gotoAndWait(page)
  await fieldset.getByRole('radio', { name: UNIVERSE_2.name }).click({ force: true })
  await page.waitForLoadState('networkidle')
  await fieldset.getByRole('radio', { name: UNIVERSE_1.name }).click({ force: true })
  await page.waitForLoadState('networkidle')
})
