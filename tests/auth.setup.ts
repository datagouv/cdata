import { test as setup } from '@playwright/test'
import path from 'path'

const authFile = path.join(import.meta.dirname, '../playwright/.auth/user.json')

setup('authenticate', async ({ page, baseURL }) => {
  // CI use localhost but local use dev.local so check this with the baseURL which should
  // be correctly configured.
  const loginURL = baseURL?.replace(':3000', ':7000') || 'http://localhost:7000'

  await page.goto(`${loginURL}/login/`)
  await page.getByLabel('Adresse email').fill('admin@example.com')
  await page.getByLabel('Mot de passe').fill('@1337Password42')

  // I don't know why the button is in english and the input labels in french.
  // In local, it's "Se connecter", in CI "Sign in"
  await page.getByRole('button', { name: /(Sign in|Se connecter)/ }).click()
  await page.waitForURL(`${loginURL}/`)

  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
