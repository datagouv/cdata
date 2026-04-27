import { test, expect } from '../base'

const ORG_SLUG = 'sobrana'

test('page loads with correct organization name', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}/datasets`)

  await expect(page).toHaveTitle('Organisation - SOBRANA | data.gouv.fr')
  await expect(page.getByRole('heading', { level: 1, name: /SOBRANA/i })).toBeVisible()
})

test('organization root redirects to datasets tab', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}`)

  await expect(page).toHaveURL(/\/organizations\/sobrana\/datasets/)
})

test('tabs display correct counts', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}/datasets`)

  await expect(page.getByRole('link', { name: 'Jeux de données 0' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'API 0' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Réutilisations 1' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Informations' })).toBeVisible()
})

test('reuses tab shows count and sort dropdown', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}/reuses`)

  await expect(page.getByText('1 réutilisation')).toBeVisible()
  await expect(page.getByLabel('Trier par :')).toBeVisible()
})

test('datasets tab shows count and sort dropdown', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}/datasets`)

  await expect(page.getByText('0 jeux de données')).toBeVisible()
  await expect(page.getByLabel('Trier par :')).toBeVisible()
})

test('information tab has all accordions closed by default', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}/information`)

  await expect(page.getByRole('button', { name: 'Voir les statistiques' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Voir les membres' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Voir les informations techniques' })).toBeVisible()

  // Stats content should NOT be visible (accordion is closed)
  await expect(page.locator('[data-type="accordion"]').first().locator('.grid')).not.toBeVisible()
})

test('information tab stats accordion can be opened', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}/information`)

  await page.getByRole('button', { name: 'Voir les statistiques' }).click()

  await expect(page.locator('[data-type="accordion"]').first().locator('.grid').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Télécharger les statistiques au format CSV' })).toBeVisible()
})

test('search navigates to search page on input', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}/datasets`)

  const searchInput = page.getByPlaceholder('Rechercher dans l\'organisation')
  await searchInput.fill('test')

  await page.waitForURL(/\/organizations\/sobrana\/search\?q=test/)
})

test('search from API tab sets dataservices type', async ({ page }) => {
  await page.goto(`/organizations/${ORG_SLUG}/dataservices`)

  const searchInput = page.getByPlaceholder('Rechercher dans l\'organisation')
  await searchInput.fill('test')

  await page.waitForURL(/\/organizations\/sobrana\/search\?q=test&type=dataservices/)
})
