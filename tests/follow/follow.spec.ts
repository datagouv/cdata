import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test.describe('Follow button', () => {
  test('can follow and unfollow a dataset, with persistence after reload', async ({ page }) => {
    const uniqueId = Date.now()

    const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
      data: {
        title: `Test follow dataset ${uniqueId}`,
        description: 'Dataset pour tester le bouton favoris',
        frequency: 'unknown',
      },
    })
    const dataset = await response.json()

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    // Follow
    await page.getByRole('button', { name: 'Ajouter aux favoris' }).click()
    await expect(page.getByRole('button', { name: 'Retirer des favoris' })).toBeVisible()

    // The follow state persists after a reload
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: 'Retirer des favoris' })).toBeVisible()

    // Unfollow
    await page.getByRole('button', { name: 'Retirer des favoris' }).click()
    await expect(page.getByRole('button', { name: 'Ajouter aux favoris' })).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can follow a reuse', async ({ page }) => {
    const uniqueId = Date.now()

    const response = await page.request.post(`${API_BASE}/api/1/reuses/`, {
      data: {
        title: `Test follow reuse ${uniqueId}`,
        description: 'Réutilisation pour tester le bouton favoris',
        url: `https://example.com/follow-reuse-${uniqueId}`,
        type: 'application',
        topic: 'others',
      },
    })
    const reuse = await response.json()

    await page.goto(`/reuses/${reuse.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Ajouter aux favoris' }).click()
    await expect(page.getByRole('button', { name: 'Retirer des favoris' })).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/reuses/${reuse.id}/`)
  })

  test('can follow a dataservice', async ({ page }) => {
    const uniqueId = Date.now()

    const response = await page.request.post(`${API_BASE}/api/1/dataservices/`, {
      data: {
        title: `Test follow dataservice ${uniqueId}`,
        description: 'API pour tester le bouton favoris',
      },
    })
    const dataservice = await response.json()

    await page.goto(`/dataservices/${dataservice.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Ajouter aux favoris' }).click()
    await expect(page.getByRole('button', { name: 'Retirer des favoris' })).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/dataservices/${dataservice.id}/`)
  })
})
