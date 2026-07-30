import { test, expect } from '../base'

test.describe('Header auth links', () => {
  test('keep pointing at the original page instead of nesting each other', async ({ page }) => {
    await page.goto('/datasets/search')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Se connecter' }).first().click()
    await expect(page).toHaveURL(/\/login\?next=%2Fdatasets%2Fsearch$/)

    await page.getByRole('link', { name: 'S\'enregistrer' }).first().click()
    await expect(page).toHaveURL(/\/register\?next=%2Fdatasets%2Fsearch$/)

    await page.getByRole('link', { name: 'Se connecter' }).first().click()
    await expect(page).toHaveURL(/\/login\?next=%2Fdatasets%2Fsearch$/)
  })

  test('carry no next param when the auth page was opened directly', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'S\'enregistrer' }).first().click()
    await expect(page).toHaveURL(/\/register$/)
  })
})
