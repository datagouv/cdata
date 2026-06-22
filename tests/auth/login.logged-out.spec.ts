// Plain @playwright/test (no assertNoConsoleErrors fixture): failed login attempts
// trigger expected 4xx responses that the browser logs as console errors.
import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('can login with valid credentials and is redirected to home', async ({ page, baseURL }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Adresse email').fill('normal@example.com')
    await page.getByLabel('Mot de passe').fill('@1337Password42')
    await page.getByRole('button', { name: 'Se connecter' }).first().click()

    await expect(page).toHaveURL(`${baseURL}/`)
  })

  test('redirects to the next param after login', async ({ page, baseURL }) => {
    await page.goto('/login?next=%2Fdatasets%2Fsearch')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Adresse email').fill('normal@example.com')
    await page.getByLabel('Mot de passe').fill('@1337Password42')
    await page.getByRole('button', { name: 'Se connecter' }).first().click()

    await expect(page).toHaveURL(`${baseURL}/datasets/search`)
  })

  test('shows an error with a wrong password and stays on the login page', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Adresse email').fill('normal@example.com')
    await page.getByLabel('Mot de passe').fill('wrong-password')
    await page.getByRole('button', { name: 'Se connecter' }).first().click()

    await expect(page.locator('.fr-error-text').first()).toBeVisible()
    await expect(page.locator('.fr-error-text').first()).not.toBeEmpty()
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows an error with an unknown account', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Adresse email').fill(`unknown-${Date.now()}@example.com`)
    await page.getByLabel('Mot de passe').fill('@1337Password42')
    await page.getByRole('button', { name: 'Se connecter' }).first().click()

    await expect(page.locator('.fr-error-text').first()).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('has links to password recovery and account creation', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Récupérer votre mot de passe' }).click()
    await expect(page).toHaveURL(/\/reset/)

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Créer un compte' }).click()
    await expect(page).toHaveURL(/\/register/)
  })
})
