import { test, expect } from '@playwright/test'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test.describe('Dataset metrics', () => {
  let datasetA: { id: string, title: string }
  let datasetB: { id: string, title: string }
  const uniqueId = Date.now()

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' })
    const page = await context.newPage()

    const [respA, respB] = await Promise.all([
      page.request.post(`${API_BASE}/api/1/datasets/`, {
        data: { title: `Alpha metrics ${uniqueId}`, description: 'Test', frequency: 'unknown' },
      }),
      page.request.post(`${API_BASE}/api/1/datasets/`, {
        data: { title: `Beta metrics ${uniqueId}`, description: 'Test', frequency: 'unknown' },
      }),
    ])
    datasetA = await respA.json()
    datasetB = await respB.json()

    await context.close()
  })

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' })
    const page = await context.newPage()

    await Promise.all([
      page.request.delete(`${API_BASE}/api/1/datasets/${datasetA.id}/`),
      page.request.delete(`${API_BASE}/api/1/datasets/${datasetB.id}/`),
    ])

    await context.close()
  })

  test('lists datasets with their metrics', async ({ page }) => {
    await page.goto('/admin/me/metrics/datasets/')

    await expect(page.getByRole('link', { name: datasetA.title })).toBeVisible()
    await expect(page.getByRole('link', { name: datasetB.title })).toBeVisible()
  })

  test('can search datasets by title', async ({ page }) => {
    await page.goto('/admin/me/metrics/datasets/')

    const searchInput = page.getByRole('searchbox', { name: 'Recherche' })
    await expect(searchInput).toBeVisible()

    await searchInput.fill(`Alpha metrics ${uniqueId}`)
    await expect(page.getByRole('link', { name: datasetA.title })).toBeVisible()
    await expect(page.getByRole('link', { name: datasetB.title })).not.toBeVisible()

    await searchInput.clear()
    await expect(page.getByRole('link', { name: datasetA.title })).toBeVisible()
    await expect(page.getByRole('link', { name: datasetB.title })).toBeVisible()
  })

  test('shows empty state and reset button when search has no results', async ({ page }) => {
    await page.goto('/admin/me/metrics/datasets/')

    const searchInput = page.getByRole('searchbox', { name: 'Recherche' })
    await searchInput.fill('zzz-no-match-zzz')

    await expect(page.getByText('Pas de résultats pour « zzz-no-match-zzz »')).toBeVisible()

    await page.getByRole('button', { name: 'Réinitialiser les filtres' }).click()

    await expect(searchInput).toHaveValue('')
    await expect(page.getByRole('link', { name: datasetA.title })).toBeVisible()
  })
})
