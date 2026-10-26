import { test, expect } from '../base'

// udata lands the agent back on /verify after the ProConnect round-trip: the destination
// was remembered when the page was first opened, before leaving for ProConnect.
test('a successful ProConnect reauthentication goes on to the remembered destination', async ({ page }) => {
  await page.goto('/verify?next=/admin/me/profile')
  await expect(page.getByRole('heading', { level: 1, name: 'Confirmer votre identité' })).toBeVisible()

  await page.goto('/verify?flash=proconnect_reauth_success')

  await expect(page).toHaveURL(/\/admin\/me\/profile/)
  await expect(page.getByText('Compte confirmé.')).toBeVisible()
})

test('a failed ProConnect reauthentication stays on the page and says so', async ({ page }) => {
  await page.goto('/verify?next=/admin/me/profile')
  await expect(page.getByRole('heading', { level: 1, name: 'Confirmer votre identité' })).toBeVisible()

  await page.goto('/verify?flash=proconnect_reauth_failed')

  await expect(page.getByText('La confirmation de votre identité avec ProConnect a échoué. Veuillez réessayer.')).toBeVisible()
  await expect(page).toHaveURL(/\/verify/)
})
