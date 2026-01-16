import { test, expect } from '@playwright/test'
import { generateSync } from 'otplib'

test.describe('2FA Authentication Flow', () => {
  // Test credentials for 2FA setup flow
  const TWOFA_EMAIL = '2fa@example.com'
  const TWOFA_PASSWORD = '@1337Password42'

  test.beforeEach(async ({ page, baseURL }) => {
    const loginURL = baseURL || 'http://localhost:3000'
    await page.goto(`${loginURL}/login/?next=%2F`)
    await page.waitForLoadState('networkidle')
  })

  test('should login normally without 2FA requirement', async ({ page, baseURL }) => {
    const loginURL = baseURL || 'http://localhost:3000'

    // Step 1: Login with credentials that don't require 2FA
    await page.getByLabel('Adresse email').fill(TWOFA_EMAIL)
    await page.getByLabel('Mot de passe').fill(TWOFA_PASSWORD)
    await page.getByRole('button', { name: 'Se connecter' }).first().click()

    // Step 2: Verify redirect to homepage (no 2FA required)
    await page.waitForURL(`${loginURL}/`)
    await expect(page).toHaveURL(`${loginURL}/`)
  })

  test('should complete 2FA setup and validation flow', async ({ page, baseURL }) => {
    const loginURL = baseURL || 'http://localhost:3000'

    // Step 1: Login normally first (no 2FA required)
    await page.getByLabel('Adresse email').fill(TWOFA_EMAIL)
    await page.getByLabel('Mot de passe').fill(TWOFA_PASSWORD)
    await page.getByRole('button', { name: 'Se connecter' }).first().click()

    // Step 2: Verify redirect to homepage
    await page.waitForURL(`${loginURL}/`)
    await expect(page).toHaveURL(`${loginURL}/`)

    // Step 3: Navigate to 2FA setup page
    await page.goto(`${loginURL}/tf-setup`)
    await expect(page.getByRole('heading', { name: 'Authentification deux facteurs' })).toBeVisible()

    // Step 4: Wait for QR code to be generated and displayed
    await page.waitForSelector('[data-testid="qrcode-container"]', { timeout: 10000 })
    const qrCodeElement = page.locator('[data-testid="qrcode-container"]')
    await expect(qrCodeElement).toBeVisible()

    // Step 5: Verify QR code is rendered as SVG
    const qrCodeHTML = await qrCodeElement.innerHTML()
    expect(qrCodeHTML).toContain('<svg')

    // Step 6: Extract TOTP secret and verify it
    const totpKeyElement = page.locator('[data-testid="totp-key"]')
    await expect(totpKeyElement).toBeVisible()

    const totpKey = await totpKeyElement.textContent()
    expect(totpKey).toBeTruthy()
    expect(totpKey!.length).toBeGreaterThan(16)
    expect(totpKey).toMatch(/^[A-Z2-7=-]+$/)

    // Step 7: Generate valid TOTP code
    const cleanTotpKey = totpKey!.replace(/-/g, '')
    const validTotpCode = generateSync({ secret: cleanTotpKey })

    // Step 8: Submit TOTP code to complete setup
    await page.locator('[data-testid="totp-code-input"] input').fill(validTotpCode)
    await page.getByRole('button', { name: 'Soumettre' }).first().click()

    // Step 9: Verify successful setup and redirect to homepage
    await page.waitForURL(`${loginURL}/`)
    await expect(page).toHaveURL(`${loginURL}/`)

    // Step 10: Logout and verify 2FA validation is now required
    await page.context().clearCookies()

    await page.goto(`${loginURL}/login/`)
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Adresse email').fill(TWOFA_EMAIL)
    await page.getByLabel('Mot de passe').fill(TWOFA_PASSWORD)
    await page.getByRole('button', { name: 'Se connecter' }).first().click()

    // Should now redirect to validation page since 2FA is configured
    await expect(page).toHaveURL(`${loginURL}/tf-validate`)
    await expect(page.getByRole('heading', { name: 'Authentification deux facteurs' })).toBeVisible()

    // Step 11: Submit invalid TOTP code
    await page.locator('[data-testid="totp-code-input"] input').fill('000000')
    await page.getByRole('button', { name: 'Soumettre' }).first().click()

    // Step 12: Verify error message is displayed
    await expect(page.locator('.fr-error-text')).toBeVisible()
    await expect(page.getByText('Code invalide')).toBeVisible()

    // Should still be on the validation page after failed attempt
    await expect(page).toHaveURL(`${loginURL}/tf-validate`)

    // Step 13: Verify validation form is present (no QR code on validation page)
    await expect(page.locator('[data-testid="totp-code-input"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Soumettre' })).toBeVisible()
    await expect(page.locator('[data-testid="qrcode-container"]')).toHaveCount(0)

    // Step 14: Submit valid TOTP code to complete validation
    const newValidTotpCode = generateSync({ secret: cleanTotpKey })
    await page.locator('[data-testid="totp-code-input"] input').fill(newValidTotpCode)
    await page.getByRole('button', { name: 'Soumettre' }).first().click()

    // Step 15: Verify successful validation and redirect to homepage
    await page.waitForURL(`${loginURL}/`)
    await expect(page).toHaveURL(`${loginURL}/`)
  })
})
