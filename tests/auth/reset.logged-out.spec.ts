// Plain @playwright/test (no assertNoConsoleErrors fixture): the invalid token
// submission triggers an expected 4xx response logged as a console error.
// The "valid token" path (email link -> new password -> login) is not covered here:
// the token is only delivered by email and there is no way to retrieve it in E2E.
import { test, expect } from '@playwright/test'

test.describe('Password reset', () => {
  test('can request a password reset', async ({ page }) => {
    await page.goto('/reset')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Adresse email *', { exact: true }).fill('normal@example.com')
    await page.getByRole('button', { name: 'Réinitialiser le mot de passe' }).click()

    await expect(page.getByText('Les instructions de réinitialisation de votre mot de passe ont été envoyées à normal@example.com.')).toBeVisible()
  })

  test('shows an error with an invalid token', async ({ page }) => {
    await page.goto('/reset/invalid-token-e2e')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Mot de passe *', { exact: true }).fill('@1337NewPassword42')
    await page.getByLabel('Confirmer le mot de passe *', { exact: true }).fill('@1337NewPassword42')
    await page.getByRole('button', { name: 'Réinitialiser le mot de passe' }).click()

    // The reset must fail: error displayed (danger banner or field error), no
    // success toast, still on the token page
    await expect(page.locator('.bg-new-error-light, .fr-error-text').first()).toBeVisible()
    await expect(page.getByText('Votre mot de passe a bien été réinitialisé.')).not.toBeVisible()
    await expect(page).toHaveURL(/\/reset\/invalid-token-e2e/)
  })
})
