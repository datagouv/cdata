import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test('can edit a dataservice and changes are visible on the public page', async ({ page }) => {
  const uniqueId = Date.now()
  const newTitle = `API modifiée ${uniqueId}`

  const response = await page.request.post(`${API_BASE}/api/1/dataservices/`, {
    data: {
      title: `Test edition dataservice ${uniqueId}`,
      description: 'API pour tester l\'édition',
    },
  })
  const dataservice = await response.json()

  await page.goto(`/admin/dataservices/${dataservice.id}/`)
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Nom de l\'API').fill(newTitle)
  await page.getByRole('button', { name: 'Sauvegarder' }).click()

  await expect(page.getByText('Fiche API mise à jour !')).toBeVisible()

  // The change is persisted and visible on the public page
  await page.goto(`/dataservices/${dataservice.id}/`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(newTitle)

  await page.request.delete(`${API_BASE}/api/1/dataservices/${dataservice.id}/`)
})
