import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, gotoHydrated } from '../helpers'

// Both accounts sign in through the form, in this browser only: signing out of the
// shared sessions of the other specs would sign them out too.
async function signIn(page: Page, email: string) {
  await page.getByLabel('Adresse email').fill(email)
  await page.getByLabel('Mot de passe').fill('@1337Password42')
  await page.getByRole('button', { name: 'Se connecter' }).first().click()
  await page.waitForURL(url => url.pathname !== '/login')
}

test('the rules of an account are not shown to the next one in the same tab', async ({ page }) => {
  const uniqueId = Date.now()

  await gotoHydrated(page, '/login')
  await signIn(page, 'admin@example.com')
  const dataset = await createDataset(page.request, `Test changement de compte ${uniqueId}`, 'Dataset suivi par l\'admin')
  await page.request.put(`${API_BASE}/api/1/notifications/settings/`, {
    data: { scope: { class: 'Dataset', id: dataset.id }, enabled: true },
  })

  try {
    await gotoHydrated(page, '/admin/me/notifications')
    await expect(page.getByRole('link', { name: `Test changement de compte ${uniqueId}` })).toBeVisible()

    // From here on, only navigations inside the app: a full load would start from a
    // fresh state, and show nothing whatever the app keeps. Signing out of an admin page
    // asks to sign in again, and back to it.
    await page.getByRole('button', { name: 'Se déconnecter' }).filter({ visible: true }).first().click()
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fme%2Fnotifications|\/login\?next=\/admin\/me\/notifications/)
    await signIn(page, 'normal@example.com')

    await expect(page).toHaveURL(/\/admin\/me\/notifications$/)
    await expect(page.getByRole('heading', { name: 'Notifications', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'E-mails' })).toBeVisible()
    await expect(page.getByRole('link', { name: `Test changement de compte ${uniqueId}` })).not.toBeVisible()
  }
  finally {
    const admin = await page.context().browser()!.newContext({ storageState: 'playwright/.auth/user.json' })
    await admin.request.put(`${API_BASE}/api/1/notifications/settings/`, {
      data: { scope: { class: 'Dataset', id: dataset.id }, enabled: null },
    })
    await admin.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
    await admin.close()
  }
})
