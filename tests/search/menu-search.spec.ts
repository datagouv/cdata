import type { Page } from '@playwright/test'
import { test, expect } from '../base'

// Real fixture datasets: selecting a suggestion navigates to a page that exists.
const datasets = [
  { id: 'd1', title: 'Base Adresse Nationale', acronym: 'BAN', slug: 'base-adresse-nationale', image_url: null, page: 'https://www.data.gouv.fr/datasets/base-adresse-nationale' },
  { id: 'd2', title: 'Base Sirene des entreprises', acronym: null, slug: 'base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret', image_url: null, page: 'https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret' },
]
const dataservices = [{ id: 's1', title: 'API Adresse', acronym: null, slug: 'api-adresse', page: 'https://www.data.gouv.fr/dataservices/api-adresse' }]
const reuses = [{ id: 'r1', title: 'Carte des adresses', slug: 'carte-des-adresses', image_url: null, page: 'https://www.data.gouv.fr/reuses/carte-des-adresses' }]
const organizations = [{ id: 'o1', name: 'Direction des adresses', acronym: 'DA', slug: 'direction-des-adresses', image_url: '', page: 'https://www.data.gouv.fr/organizations/direction-des-adresses' }]

const suggestByKind: Record<string, Array<unknown>> = { datasets, dataservices, reuses, organizations }

test.beforeEach(async ({ page }) => {
  await page.route(/\/api\/1\/(datasets|dataservices|organizations|reuses)\/suggest\//, (route) => {
    const kind = route.request().url().match(/\/api\/1\/(\w+)\/suggest\//)![1]
    return route.fulfill({ json: suggestByKind[kind] })
  })
})

// The header renders a second, invisible search bar for the mobile modal.
const headerSearch = (page: Page) =>
  page.getByPlaceholder('Recherche', { exact: true }).filter({ visible: true })

test('typing in the header search shows live suggestions below the search links', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const input = headerSearch(page)
  await input.fill('adresse')

  const options = page.getByRole('option')
  await expect(options.filter({ hasText: 'Base Adresse Nationale (BAN)' })).toBeVisible()
  await expect(options.filter({ hasText: 'API Adresse' })).toBeVisible()
  await expect(options.filter({ hasText: 'Carte des adresses' })).toBeVisible()
  await expect(options.filter({ hasText: 'Direction des adresses (DA)' })).toBeVisible()

  // The four "search in…" links come first, the suggestions after them.
  await expect(options.filter({ hasText: 'Rechercher « adresse » dans les' })).toHaveCount(4)
  await expect(options).toHaveCount(4 + datasets.length + dataservices.length + reuses.length + organizations.length)
  await expect(options.first()).toContainText('Rechercher « adresse » dans les jeux de données')
  await expect(options.nth(4)).toContainText('Base Adresse Nationale (BAN)')
  await expect(options.last()).toContainText('Direction des adresses (DA)')
})

test('Enter right after typing still opens the datasets search, even once suggestions are shown', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const input = headerSearch(page)
  await input.fill('adresse')
  await expect(page.getByRole('option').filter({ hasText: 'Base Adresse Nationale (BAN)' })).toBeVisible()

  await input.press('Enter')
  await expect(page).toHaveURL(/\/datasets\/search\?q=adresse$/)
})

test('keyboard selection of a suggestion opens the dataset page', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const input = headerSearch(page)
  await input.fill('adresse')
  await expect(page.getByRole('option').filter({ hasText: 'Base Sirene des entreprises' })).toBeVisible()

  // Whether or not an option is already active when the list opens, `End` then
  // three `ArrowUp` lands on the second dataset (last option is the organization,
  // preceded by the reuse and the dataservice).
  await input.press('End')
  await input.press('ArrowUp')
  await input.press('ArrowUp')
  await input.press('ArrowUp')
  const activeId = await input.getAttribute('aria-activedescendant')
  expect(activeId).toBeTruthy()
  await expect(page.locator(`[id="${activeId}"]`)).toContainText('Base Sirene des entreprises')

  await input.press('Enter')
  await expect(page).toHaveURL(new RegExp(`/datasets/${datasets[1].slug}$`))
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('clicking a suggestion opens its page', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const input = headerSearch(page)
  await input.fill('adresse')
  await page.getByRole('option').filter({ hasText: 'Base Adresse Nationale (BAN)' }).click()

  await expect(page).toHaveURL(new RegExp(`/datasets/${datasets[0].slug}$`))
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Base Adresse Nationale')
})

test('Escape closes the suggestion list', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const input = headerSearch(page)
  await input.fill('adresse')
  await expect(page.getByRole('option').filter({ hasText: 'API Adresse' })).toBeVisible()

  await input.press('Escape')
  await expect(page.getByRole('listbox')).toHaveCount(0)
  await expect(page.getByRole('option')).toHaveCount(0)
})

test('short queries do not call the suggest endpoints', async ({ page }) => {
  const suggestCalls: Array<string> = []
  page.on('request', (request) => {
    if (/\/suggest\//.test(request.url())) suggestCalls.push(request.url())
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const input = headerSearch(page)
  await input.fill('ad')
  await expect(page.getByRole('option')).toHaveCount(4)
  await expect(page.getByRole('option').filter({ hasText: 'Rechercher « ad » dans les jeux de données' })).toBeVisible()

  // Longer than the debounce: a request for the short query would have been sent by now.
  await page.waitForTimeout(600)
  expect(suggestCalls).toEqual([])
})
