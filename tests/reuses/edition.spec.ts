import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

test('can edit a reuse and changes are visible on the public page', async ({ page }) => {
  const uniqueId = Date.now()
  const newTitle = `Réutilisation modifiée ${uniqueId}`

  const response = await page.request.post(`${API_BASE}/api/1/reuses/`, {
    data: {
      title: `Test edition reuse ${uniqueId}`,
      description: 'Réutilisation pour tester l\'édition',
      url: `https://example.com/edition-reuse-${uniqueId}`,
      type: 'application',
      topic: 'others',
    },
  })
  const reuse = await response.json()

  await page.goto(`/admin/reuses/${reuse.id}/`)
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Nom de la réutilisation').fill(newTitle)
  await page.getByRole('button', { name: 'Sauvegarder' }).click()

  await expect(page.getByText('Réutilisation mise à jour !')).toBeVisible()

  // The change is persisted and visible on the public page
  await page.goto(`/reuses/${reuse.id}/`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(newTitle)

  await page.request.delete(`${API_BASE}/api/1/reuses/${reuse.id}/`)
})
