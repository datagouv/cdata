import type { Page, Response } from '@playwright/test'
import { test, expect } from './base'

// The CADA explore runs against the real Tabular API, so no assertion pins an
// absolute row count: a filtered count is always compared to the unfiltered one.
async function readRowCount(page: Page): Promise<{ shown: number, total: number }> {
  const text = await page.locator('[data-row-count]').first().innerText()
  const [shown, total] = text.split('/').map(part => Number(part.replace(/\D/g, '')))
  return { shown, total }
}

/** Resolves once the table asked the Tabular API for `query`. */
function dataResponse(page: Page, query: string): Promise<Response> {
  return page.waitForResponse(
    response => response.url().includes('/data/') && decodeURIComponent(response.url()).includes(query),
    { timeout: 30000 },
  )
}

async function gotoExplore(page: Page, path = '/explore/cada') {
  await page.goto(path)
  await expect(page.locator('[data-row-count]')).toBeVisible({ timeout: 30000 })
}

test('CADA homepage loads with search bar and table', async ({ page }) => {
  await page.goto('/explore/cada')
  await page.waitForLoadState('networkidle')

  // Page title
  await expect(page).toHaveTitle(/CADA/)

  // Search bar is visible
  await expect(page.getByPlaceholder('Rechercher par objet, administration, thème, mots-clés…')).toBeVisible()

  // TabularExplorer renders with column selector and row count after data loads
  await expect(page.getByRole('button', { name: /Colonnes/ })).toBeVisible({ timeout: 30000 })
  await expect(page.getByText('Lignes').first()).toBeVisible({ timeout: 30000 })
})

test('CADA detail page shows advice content', async ({ page }) => {
  await page.goto('/explore/cada/20237028')
  await page.waitForLoadState('networkidle')

  // Detail page shows the advice number
  await expect(page.getByRole('heading', { name: /20237028/ })).toBeVisible({ timeout: 30000 })
  // Breadcrumb is present
  await expect(page.getByText('Avis et conseils de la CADA')).toBeVisible()
})

test('CADA detail page renders the values derived from the raw columns', async ({ page }) => {
  await page.goto('/explore/cada/20237028')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: /20237028/ })).toBeVisible({ timeout: 30000 })

  // `Partie: III` is shown as its label, not as the raw roman numeral
  await expect(page.getByRole('link', { name: 'Affaire courante' })).toBeVisible()
  // `Sens et motivation` packs several comma-separated values, one badge each
  await expect(page.getByRole('link', { name: 'Favorable / Sauf vie privée' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Favorable / Sauf secret des affaires' })).toBeVisible()
})

test('CADA detail page answers a 404 for an advice that does not exist', async ({ page }) => {
  const response = await page.goto('/explore/cada/1')

  expect(response?.status()).toBe(404)
})

test('CADA about section exists on index page', async ({ page }) => {
  await page.goto('/explore/cada')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Codifiées dans le')).toBeVisible()
})

test('clicking the Numéro de dossier link navigates to the CADA detail page', async ({ page }) => {
  await page.goto('/explore/cada')
  await page.waitForLoadState('networkidle')

  // Wait for rows to load
  await expect(page.getByText('Lignes').first()).toBeVisible({ timeout: 30000 })

  // Click the first Numéro de dossier link (rendered as an <a> by rowHref)
  const dossierLink = page.locator('table a.link').first()
  await dossierLink.waitFor({ timeout: 30000 })
  await dossierLink.click()

  // Should navigate to /explore/cada/<numero>
  await page.waitForURL(/\/explore\/cada\/\d+/, { timeout: 30000 })

  // Confirm detail page content loaded
  await expect(page.locator('h1').first()).toBeVisible()
})

test('the Numéro de dossier column keeps its digits unformatted', async ({ page }) => {
  await gotoExplore(page)

  // It is an int column, but an identifier: it must not be grouped in thousands
  // the way a quantity would be (20 112 327).
  const dossier = await page.locator('table a.link').first().innerText()
  expect(dossier).toMatch(/^\d+$/)
})

test.describe('global search', () => {
  test('searching by exact dossier number narrows the rows to a strict subset', async ({ page }) => {
    await gotoExplore(page)
    const unfiltered = await readRowCount(page)

    const searchInput = page.getByPlaceholder('Rechercher par objet, administration, thème, mots-clés…')
    await searchInput.fill('20112327')

    const response = dataResponse(page, 'or=(')
    await searchInput.press('Enter')
    expect((await response).ok()).toBe(true)

    // The searched dossier is among the results…
    await expect(page.locator('table').getByText('20112327').first()).toBeVisible()
    // …and the search really did narrow the base
    await expect.poll(async () => (await readRowCount(page)).shown).toBeLessThan(unfiltered.shown)
  })

  test('searching by a non-numeric term does not make the API reject the query', async ({ page }) => {
    await gotoExplore(page)

    // A word must not be sent as `__exact` on the number columns: the Tabular API
    // answers an error for the whole `or(...)` expression when it is.
    const searchInput = page.getByPlaceholder('Rechercher par objet, administration, thème, mots-clés…')
    await searchInput.fill('cheval')

    const response = dataResponse(page, 'or=(')
    await searchInput.press('Enter')
    expect((await response).ok()).toBe(true)

    await expect(page.locator('table a.link').first()).toBeVisible({ timeout: 30000 })
  })
})

test.describe('column filter', () => {
  test('date column filter shows a date input', async ({ page }) => {
    await gotoExplore(page)

    await page.getByRole('button', { name: 'Filtrer Séance' }).click()

    // Date columns show a native date picker input, not a text search
    await expect(
      page.locator('[data-column-filter="Séance"] input[type="date"]'),
    ).toBeVisible({ timeout: 3000 })
  })

  test('year column filter shows a number input', async ({ page }) => {
    await gotoExplore(page)

    await page.getByRole('button', { name: 'Filtrer Année' }).click()

    await expect(
      page.locator('[data-column-filter="Année"]').getByPlaceholder('Rechercher...'),
    ).toHaveAttribute('type', 'number', { timeout: 3000 })
  })

  test('filtering a year column narrows the rows and shows the raw value in the chip', async ({ page }) => {
    await gotoExplore(page)
    const unfiltered = await readRowCount(page)

    await page.getByRole('button', { name: 'Filtrer Année' }).click()

    // A year filters with `__exact`: `__contains` is not supported for numbers
    const response = dataResponse(page, 'Année__exact=2011')
    await page.locator('[data-column-filter="Année"]').getByPlaceholder('Rechercher...').fill('2011')
    expect((await response).ok()).toBe(true)

    // A non-boolean `exact` filter shows its own value, not Vrai/Faux
    await expect(page.locator('[data-active-filter="Année"]')).toContainText('= 2011')
    await expect.poll(async () => (await readRowCount(page)).shown).toBeLessThan(unfiltered.shown)
  })
})

test.describe('legacy filter params', () => {
  test('?part= filters exactly, so I does not match II, III and IV', async ({ page }) => {
    const response = dataResponse(page, 'Partie__exact=II')
    await gotoExplore(page, '/explore/cada?part=II')
    expect((await response).ok()).toBe(true)

    await expect(page.locator('[data-active-filter="Partie"]')).toContainText('= II')

    const { shown, total } = await readRowCount(page)
    expect(shown).toBeGreaterThan(0)
    expect(shown).toBeLessThan(total)
  })

  test('?administration= filters on a substring', async ({ page }) => {
    const response = dataResponse(page, 'Administration__contains=Mairie de Paris')
    await gotoExplore(page, '/explore/cada?administration=Mairie+de+Paris')
    expect((await response).ok()).toBe(true)

    await expect(page.locator('[data-active-filter="Administration"]')).toContainText('contient "Mairie de Paris"')

    const { shown, total } = await readRowCount(page)
    expect(shown).toBeGreaterThan(0)
    expect(shown).toBeLessThan(total)
  })

  test('a badge of the detail page lands on the filtered explore', async ({ page }) => {
    await page.goto('/explore/cada/20237028')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Subvention' }).click()

    await page.waitForURL(/\/explore\/cada\?tag=Subvention/, { timeout: 30000 })
    await expect(page.locator('[data-active-filter="Mots clés"]'))
      .toContainText('contient "Subvention"', { timeout: 30000 })
  })
})
