import { test, expect } from '../base'
import { gotoHydrated } from '../helpers'

test('a user who is not a sysadmin is not offered the sysadmin rights', async ({ page }) => {
  await gotoHydrated(page, '/admin/me/profile')
  await page.getByRole('button', { name: 'Créer un token' }).click()
  const dialog = page.getByRole('dialog', { name: 'Créer un token API' })

  await expect(dialog.getByLabel('Nom (optionnel)')).toBeVisible()
  await expect(dialog.getByRole('switch', { name: 'Droits sysadmin' })).toHaveCount(0)
})
