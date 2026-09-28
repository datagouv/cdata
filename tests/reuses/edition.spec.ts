import { test, expect } from '../base'
import { API_BASE, clickOutside } from '../helpers'

// Smallest valid PNG (1x1 pixel): the reuse form requires an image to save
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

const createdReuses: Array<string> = []

test.afterEach(async ({ request }) => {
  for (const id of createdReuses.splice(0)) {
    await request.delete(`${API_BASE}/api/1/reuses/${id}/`)
  }
})

test('can edit a reuse and changes are visible on the public page', async ({ page, request }) => {
  const uniqueId = Date.now()
  const newTitle = `Réutilisation modifiée ${uniqueId}`

  const response = await request.post(`${API_BASE}/api/1/reuses/`, {
    data: {
      title: `Test edition reuse ${uniqueId}`,
      description: 'Réutilisation pour tester l\'édition',
      url: `https://example.com/edition-reuse-${uniqueId}`,
      type: 'application',
      topic: 'others',
    },
  })
  const reuse = await response.json()
  createdReuses.push(reuse.id)

  // The admin form refuses to save a reuse without an image: upload one via API
  const imageUpload = await request.post(`${API_BASE}/api/1/reuses/${reuse.id}/image`, {
    multipart: {
      file: {
        name: 'image.png',
        mimeType: 'image/png',
        buffer: PNG_1X1,
      },
    },
  })
  expect(imageUpload.ok()).toBeTruthy()

  await page.goto(`/admin/reuses/${reuse.id}/`)
  await page.waitForLoadState('networkidle')

  // The image must be loaded in the form, otherwise saving is refused
  await expect(page.locator('img[src*="/images/"]')).toBeVisible()

  await page.getByLabel('Nom de la réutilisation').fill(newTitle)
  // Blur the title input first: its "test" warning disappears on blur and the
  // layout shift would make the click miss the button (see clickOutside doc)
  await clickOutside(page)
  await page.getByRole('button', { name: 'Sauvegarder' }).click()

  await expect(page.getByText('Réutilisation mise à jour !')).toBeVisible()

  // The change is persisted and visible on the public page
  await page.goto(`/reuses/${reuse.id}/`)
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(newTitle)
})
