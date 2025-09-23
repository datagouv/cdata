import { test, expect } from '@playwright/test'

const redirectionCases = [
  { from: '/datasets/65271c20a80b3f04010e71ff/', to: '/datasets/marches-publics-de-la-metropole-de-lyon' },
]

test.describe('Redirects from ID to slug (and from old slug to new slug)', () => {
  redirectionCases.forEach(({ from, to }) => {
    test(`${from} → ${to}`, async ({ page }) => {
      await page.goto(from)
      await expect(page).toHaveURL(to)
    })
  })
})
