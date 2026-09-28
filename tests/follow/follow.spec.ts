import { test, expect } from '../base'
import { API_BASE, createDataset, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []
const createdReuses: Array<string> = []
const createdDataservices: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
  for (const id of createdReuses.splice(0)) {
    await request.delete(`${API_BASE}/api/1/reuses/${id}/`)
  }
  for (const id of createdDataservices.splice(0)) {
    await request.delete(`${API_BASE}/api/1/dataservices/${id}/`)
  }
})

test.describe('Follow button', () => {
  test('can follow and unfollow a dataset, with persistence after reload', async ({ page, request }) => {
    const dataset = await createDataset(request, `Test follow dataset ${Date.now()}`, 'Dataset pour tester le bouton favoris')
    createdDatasets.push(dataset.id)

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
  })

  test('can follow a reuse', async ({ page, request }) => {
    const uniqueId = Date.now()

    const response = await request.post(`${API_BASE}/api/1/reuses/`, {
      data: {
        title: `Test follow reuse ${uniqueId}`,
        description: 'Réutilisation pour tester le bouton favoris',
        url: `https://example.com/follow-reuse-${uniqueId}`,
        type: 'application',
        topic: 'others',
      },
    })
    const reuse = await response.json()
    createdReuses.push(reuse.id)

    await page.goto(`/reuses/${reuse.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Ajouter aux favoris' }).click()
    await expect(page.getByRole('button', { name: 'Retirer des favoris' })).toBeVisible()
  })

  test('can follow a dataservice', async ({ page, request }) => {
    const response = await request.post(`${API_BASE}/api/1/dataservices/`, {
      data: {
        title: `Test follow dataservice ${Date.now()}`,
        description: 'API pour tester le bouton favoris',
      },
    })
    const dataservice = await response.json()
    createdDataservices.push(dataservice.id)

    await page.goto(`/dataservices/${dataservice.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Ajouter aux favoris' }).click()
    await expect(page.getByRole('button', { name: 'Retirer des favoris' })).toBeVisible()
  })
})
