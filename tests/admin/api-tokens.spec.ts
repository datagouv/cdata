import { test, expect } from '../base'
import { gotoHydrated } from '../helpers'

test('a created token is shown in the modal until it is closed', async ({ page }) => {
  const name = `E2E token ${Date.now()}`
  await gotoHydrated(page, '/admin/me/profile')
  await page.getByRole('button', { name: 'Créer un token' }).click()
  const dialog = page.getByRole('dialog', { name: 'Créer un token API' })
  await dialog.getByLabel('Nom (optionnel)').fill(name)
  await dialog.getByRole('button', { name: 'Créer', exact: true }).click()

  await expect(dialog.getByText('Copiez ce token maintenant, il ne sera plus affiché.')).toBeVisible()
  await expect(dialog.locator('code')).not.toBeEmpty()

  await dialog.getByRole('button', { name: 'Fermer', exact: true }).last().click()

  await expect(dialog).toBeHidden()
  await expect(page.getByText(name)).toBeVisible()

  // Opened again, the modal asks for a new token rather than showing the previous one.
  await page.getByRole('button', { name: 'Créer un token' }).click()
  await expect(dialog.getByLabel('Nom (optionnel)')).toHaveValue('')
  await expect(dialog.locator('code')).toHaveCount(0)
})

test('going back after closing the modal leaves the profile', async ({ page }) => {
  await gotoHydrated(page, '/')
  await gotoHydrated(page, '/admin/me/profile')
  await page.getByRole('button', { name: 'Créer un token' }).click()
  const dialog = page.getByRole('dialog', { name: 'Créer un token API' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Fermer', exact: true }).click()
  await expect(page).toHaveURL(/\/admin\/me\/profile$/)

  await page.goBack()

  await expect(page).toHaveURL(/\/$/)
})

test.describe('when the token creation requires a fresh session', () => {
  // The 401 below is the point of the tests: the browser logs it.
  test.use({ allowedConsoleMessages: ['the server responded with a status of 401'] })

  test('the reauthentication goes back to the token creation', async ({ page }) => {
    // udata asks for a fresh session until the identity is confirmed.
    await page.route('**/api/1/me/fresh/?*', route => route.fulfill({ status: 401, json: { response: { reauth_required: true } } }))
    await gotoHydrated(page, '/admin/me/profile')
    await page.getByRole('button', { name: 'Créer un token' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Confirmer votre identité' })).toBeVisible()

    await page.unroute('**/api/1/me/fresh/?*')
    await page.goto('/verify?flash=proconnect_reauth_success')

    const dialog = page.getByRole('dialog', { name: 'Créer un token API' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('Nom (optionnel)')).toBeVisible()
  })

  test('a session gone stale while filling the form sends to the reauthentication', async ({ page }) => {
    // The list is read from the same URL: only the creation is refused.
    await page.route('**/api/1/me/api_tokens/?*', route => route.request().method() === 'POST'
      ? route.fulfill({ status: 401, json: { response: { reauth_required: true } } })
      : route.fallback())
    await gotoHydrated(page, '/admin/me/profile')
    await page.getByRole('button', { name: 'Créer un token' }).click()
    const dialog = page.getByRole('dialog', { name: 'Créer un token API' })
    await dialog.getByRole('button', { name: 'Créer', exact: true }).click()

    await expect(page.getByRole('heading', { level: 1, name: 'Confirmer votre identité' })).toBeVisible()
    await expect(page.getByText('Impossible de créer le token.')).toBeHidden()
  })
})

test('a sysadmin gets the sysadmin rights on a token only by asking for them', async ({ page }) => {
  const plain = `E2E plain token ${Date.now()}`
  const sysadmin = `E2E sysadmin token ${Date.now()}`
  await gotoHydrated(page, '/admin/me/profile')
  const dialog = page.getByRole('dialog', { name: 'Créer un token API' })

  for (const [name, asSysadmin] of [[plain, false], [sysadmin, true]] as const) {
    await page.getByRole('button', { name: 'Créer un token' }).click()
    await dialog.getByLabel('Nom (optionnel)').fill(name)
    if (asSysadmin) await dialog.getByRole('switch', { name: 'Droits sysadmin' }).click()
    await dialog.getByRole('button', { name: 'Créer', exact: true }).click()
    await expect(dialog.locator('code')).not.toBeEmpty()
    await dialog.getByRole('button', { name: 'Fermer', exact: true }).last().click()
    await expect(dialog).toBeHidden()
  }

  const token = (name: string) => page.getByTestId('api-token').filter({ hasText: name })
  await expect(token(sysadmin).getByText('Sysadmin', { exact: true })).toBeVisible()
  await expect(token(plain).getByText('Sysadmin', { exact: true })).toHaveCount(0)
})
