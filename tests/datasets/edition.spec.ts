import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test('can edit a dataset and changes are visible on the public page', async ({ page }) => {
  const uniqueId = Date.now()
  const newTitle = `Dataset modifié ${uniqueId}`

  const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
    data: {
      title: `Test edition dataset ${uniqueId}`,
      description: 'Dataset pour tester l\'édition',
      frequency: 'unknown',
    },
  })
  const dataset = await response.json()

  await page.goto(`/admin/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Titre', { exact: true }).fill(newTitle)
  await page.getByLabel('Acronyme', { exact: true }).fill('DME2E')
  await page.getByRole('button', { name: 'Sauvegarder' }).click()

  await expect(page.getByText('Jeu de données mis à jour !')).toBeVisible()

  // The change is persisted and visible on the public page
  await page.goto(`/datasets/${dataset.id}/`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(newTitle)

  await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
})
