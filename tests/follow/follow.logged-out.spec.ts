import { test, expect } from '../base'

test('follow button redirects to login with a next param when logged out', async ({ page }) => {
  await page.goto('/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/')
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: 'Ajouter aux favoris' }).click()

  await expect(page).toHaveURL(/\/login\?next=/)
  expect(page.url()).toContain(encodeURIComponent('/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret'))
})
