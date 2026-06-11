import { test, expect } from '../base'
import { API_BASE, clickOutside } from '../helpers'

const createdDataservices: Array<string> = []

test.afterEach(async ({ request }) => {
  for (const id of createdDataservices.splice(0)) {
    await request.delete(`${API_BASE}/api/1/dataservices/${id}/`)
  }
})

test('can edit a dataservice and changes are visible on the public page', async ({ page, request }) => {
  const uniqueId = Date.now()
  const newTitle = `API modifiée ${uniqueId}`

  const response = await request.post(`${API_BASE}/api/1/dataservices/`, {
    data: {
      title: `Test edition dataservice ${uniqueId}`,
      description: 'API pour tester l\'édition',
    },
  })
  const dataservice = await response.json()
  createdDataservices.push(dataservice.id)

  await page.goto(`/admin/dataservices/${dataservice.id}/`)
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Nom de l\'API').fill(newTitle)
  // Blur the title input first: its "test" warning disappears on blur and the
  // layout shift would make the click miss the button (see clickOutside doc)
  await clickOutside(page)
  await page.getByRole('button', { name: 'Sauvegarder' }).click()

  // Without an OpenAPI/Swagger documentation, a confirmation modal opens first.
  // The <dialog> never gets the `open` attribute (HeadlessUI consumes it as a
  // prop), so it is not exposed with the dialog role: locate it by element.
  const confirmDialog = page.locator('dialog').filter({ hasText: 'Êtes vous-sûr de vouloir publier cette API sans documentation OpenAPI/Swagger ?' })
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: 'Sauvegarder' }).click()

  await expect(page.getByText('Fiche API mise à jour !')).toBeVisible()

  // The change is persisted and visible on the public page
  await page.goto(`/dataservices/${dataservice.id}/`)
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(newTitle)
})
