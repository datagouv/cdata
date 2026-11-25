import { test, expect } from '../base'
import { API_BASE } from '../helpers'

test('dataset cards show description_short instead of the full description', async ({ page }) => {
  const shortDescription = 'Description courte spécifique à la carte'
  const longDescription = `FULL_DESCRIPTION_SHOULD_NOT_RENDER ${'texte '.repeat(60)}`

  const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
    data: {
      title: 'Carte avec description courte',
      description: longDescription,
      description_short: shortDescription,
      frequency: 'unknown',
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to create dataset: ${response.status()} ${(await response.text()).slice(0, 300)}`)
  }
  const dataset = await response.json()

  try {
    await page.goto(`/design/cards?dataset=${dataset.slug}`)

    await expect(page.getByText(shortDescription).first()).toBeVisible()
    await expect(page.getByText('FULL_DESCRIPTION_SHOULD_NOT_RENDER')).toHaveCount(0)
  }
  finally {
    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  }
})
