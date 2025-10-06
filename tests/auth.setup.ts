import { test as setup } from '@playwright/test'
import path from 'path'

const authFile = path.join(import.meta.dirname, '../playwright/.auth/user.json')

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('http://localhost:7000/login/')
  await page.getByLabel('Adresse email').fill('admin@example.com')
  await page.getByLabel('Mot de passe').fill('@1337Password42')
  await page.screenshot({ path: 'screenshot.png', fullPage: true })
  await page.getByRole('button', { name: 'Sign in' }).click() // I don't know why the button is in english and the input labels in french.
  await page.waitForURL('http://localhost:7000/')

  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
