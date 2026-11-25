import { test, expect } from '../base'

// The router leaves slashes unencoded in query values, so assert on the parsed URL rather
// than on the raw query string: what matters is where `next` points, not how it is written.
const authUrl = (pathname: string, next: string | null) => (url: URL) =>
  url.pathname === pathname && url.searchParams.get('next') === next

test.describe('Header auth links', () => {
  // Reaching /register mounts a CaptchEtat image, and the captcha service is unreachable
  // from the test environment: `/api/2/captchetat` answers 500.
  test.use({ allowedConsoleMessages: ['the server responded with a status of 500'] })

  test('keep pointing at the original page instead of nesting each other', async ({ page }) => {
    await page.goto('/datasets/search')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Se connecter' }).first().click()
    await expect(page).toHaveURL(authUrl('/login', '/datasets/search'))

    await page.getByRole('link', { name: 'S\'enregistrer' }).first().click()
    await expect(page).toHaveURL(authUrl('/register', '/datasets/search'))

    await page.getByRole('link', { name: 'Se connecter' }).first().click()
    await expect(page).toHaveURL(authUrl('/login', '/datasets/search'))
  })

  test('carry no next param when the auth page was opened directly', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'S\'enregistrer' }).first().click()
    await expect(page).toHaveURL(authUrl('/register', null))
  })
})
