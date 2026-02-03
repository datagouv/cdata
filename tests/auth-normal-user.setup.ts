import { test as setup } from '@playwright/test'
import path from 'path'

const authFile = path.join(import.meta.dirname, '../playwright/.auth/normal-user.json')

setup('authenticate as normal user', async ({ page, baseURL }) => {
  const loginURL = baseURL || 'http://localhost:3000'

  await page.goto(`${loginURL}/login/?next=%2F`)
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Adresse email').fill('normal@example.com')
  await page.getByLabel('Mot de passe').fill('@1337Password42')
  await page.getByRole('button', { name: 'Se connecter' }).first().click()
  await page.waitForURL(`${loginURL}/`)

  await page.context().storageState({ path: authFile })
})
