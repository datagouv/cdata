// Plain @playwright/test (no assertNoConsoleErrors fixture): failed registrations
// trigger expected 4xx responses that the browser logs as console errors.
import { test, expect } from '@playwright/test'

async function fillRegisterForm(page: import('@playwright/test').Page, options: {
  email: string
  password: string
  passwordConfirm?: string
}) {
  await page.getByLabel('Adresse email').fill(options.email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(options.password)
  await page.getByLabel('Confirmer le mot de passe').fill(options.passwordConfirm ?? options.password)
  await page.getByLabel('Prénom').fill('Test')
  await page.getByLabel('Nom', { exact: true }).fill('E2E')
  await page.getByRole('checkbox', { name: /J'ai lu et j'accepte/ }).check()
}

test.describe('Register page', () => {
  test('can register a new account and is asked to confirm the email', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await fillRegisterForm(page, {
      email: `register-${Date.now()}@example.com`,
      password: '@1337Password42',
    })
    await page.getByRole('button', { name: 'S\'enregistrer' }).click()

    await expect(page.getByText('Un email vous a été envoyé afin de confirmer votre adresse email.')).toBeVisible()
  })

  test('shows an error when the email is already taken', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await fillRegisterForm(page, {
      email: 'normal@example.com',
      password: '@1337Password42',
    })
    await page.getByRole('button', { name: 'S\'enregistrer' }).click()

    await expect(page.locator('.fr-error-text').first()).toBeVisible()
    await expect(page).toHaveURL(/\/register/)
    await expect(page.getByText('Un email vous a été envoyé afin de confirmer votre adresse email.')).not.toBeVisible()
  })

  test('shows an error when passwords do not match', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await fillRegisterForm(page, {
      email: `register-mismatch-${Date.now()}@example.com`,
      password: '@1337Password42',
      passwordConfirm: '@OtherPassword43',
    })
    await page.getByRole('button', { name: 'S\'enregistrer' }).click()

    await expect(page.locator('.fr-error-text').first()).toBeVisible()
    await expect(page.getByText('Un email vous a été envoyé afin de confirmer votre adresse email.')).not.toBeVisible()
  })
})
