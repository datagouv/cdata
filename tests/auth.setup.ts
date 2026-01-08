import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(import.meta.dirname, '../playwright/.auth/user.json')

setup('authenticate', async ({ page, baseURL }) => {
  // CI use localhost but local use dev.local so check this with the baseURL which should
  // be correctly configured.
  const loginURL = baseURL || 'http://localhost:3000'

  await page.goto(`${loginURL}/login/?next=%2F`)
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Adresse email').fill('admin@example.com')
  await page.getByLabel('Mot de passe').fill('@1337Password42')
  await page.getByRole('button', { name: 'Se connecter' }).first().click()
  await expect(page).toHaveURL(`${loginURL}/`)

  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
