import { test as setup } from '@playwright/test'
import path from 'path'

const authFile = path.join(import.meta.dirname, '../playwright/.auth/user.json')

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('http://dev.local:7000/login/')
  await page.getByLabel('Adresse email').fill('admin@example.com')
  await page.getByLabel('Mot de passe').fill('@1337Password42')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL('http://dev.local:7000/')

  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
