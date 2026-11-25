import { test, expect } from './base'

test('logging in does not set the fresh-after-write cookie', async ({ page, context }) => {
  await page.goto('/login/?next=%2F')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Adresse email').fill('admin@example.com')
  await page.getByLabel('Mot de passe').fill('@1337Password42')
  await page.getByRole('button', { name: 'Se connecter' }).first().click()
  await expect(page).toHaveURL('/')

  expect((await context.cookies()).map(cookie => cookie.name)).not.toContain('cdata_fresh')
})
