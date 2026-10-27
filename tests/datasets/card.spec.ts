import { test, expect } from '../base'

test('dataset cards show description_short instead of the full description', async ({ page }) => {
  const shortDescription = 'Description courte spécifique à la carte'
  const longDescription = `FULL_DESCRIPTION_SHOULD_NOT_RENDER ${'texte '.repeat(60)}`

  await page.route('**/api/2/datasets/municipales-2020-resultats-2nd-tour/', async (route) => {
    const response = await route.fetch()
    await route.fulfill({
      response,
      json: {
        ...await response.json(),
        description: longDescription,
        description_short: shortDescription,
      },
    })
  })

  await page.goto('/design/cards')

  await expect(page.getByText(shortDescription)).toBeVisible()
  await expect(page.getByText('FULL_DESCRIPTION_SHOULD_NOT_RENDER')).toHaveCount(0)
})
