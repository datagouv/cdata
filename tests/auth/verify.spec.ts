import { test, expect } from '../base'
import { gotoHydrated } from '../helpers'

// udata lands the agent back on /verify after the ProConnect round-trip: the destination
// was remembered when the page was first opened, before leaving for ProConnect.
test('a successful ProConnect reauthentication goes on to the remembered destination', async ({ page }) => {
  await gotoHydrated(page, '/verify?next=/admin/me/profile')

  await page.goto('/verify?flash=proconnect_reauth_success')

  await expect(page).toHaveURL(/\/admin\/me\/profile/)
  await expect(page.getByText('Compte confirmé.')).toBeVisible()
})

test.describe('when the two-factor setup requires a fresh session', () => {
  // The 401 below is the point of the test: the browser logs it.
  test.use({ allowedConsoleMessages: ['the server responded with a status of 401'] })

  test('the reauthentication goes back to the setup', async ({ page }) => {
    // udata asks for a fresh session until the identity is confirmed.
    await page.route('**/tf-setup?*', route => route.fulfill({ status: 401, json: { response: { reauth_required: true } } }))
    await gotoHydrated(page, '/admin/me/profile')
    await page.getByRole('button', { name: 'Configurer l\'authentification deux facteurs' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Confirmer votre identité' })).toBeVisible()

    await page.unroute('**/tf-setup?*')
    await page.goto('/verify?flash=proconnect_reauth_success')

    await expect(page.getByRole('dialog', { name: 'Authentification deux facteurs' })).toBeVisible()
    await expect(page.getByTestId('totp-key')).not.toBeEmpty()
  })
})

test('the ProConnect button asks udata for a reauthentication, not a login', async ({ page }) => {
  let requested: URL | undefined
  // Stop at udata: the round-trip itself goes through ProConnect.
  await page.route('**/api/1/proconnect/**', (route) => {
    requested = new URL(route.request().url())
    return route.abort()
  })
  await page.goto('/verify')

  await page.getByRole('button', { name: 'S’identifier avec ProConnect' }).click()

  await expect.poll(() => requested?.pathname).toBe('/api/1/proconnect/reauth/')
})

test('a failed ProConnect reauthentication stays on the page and says so', async ({ page }) => {
  await page.goto('/verify?next=/admin/me/profile')
  await expect(page.getByRole('heading', { level: 1, name: 'Confirmer votre identité' })).toBeVisible()

  await page.goto('/verify?flash=proconnect_reauth_failed')

  await expect(page.getByText('La confirmation de votre identité avec ProConnect a échoué. Veuillez réessayer.')).toBeVisible()
  await expect(page).toHaveURL(/\/verify/)
})
