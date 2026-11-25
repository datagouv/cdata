import type { APIRequestContext } from '@playwright/test'
import { request as playwrightRequest } from '@playwright/test'
import { test, expect } from '../base'
import { createDataset, createOrganization, deleteDatasets, deleteOrganizations } from '../helpers'

// The API answers 410 on a deleted object to anyone without edit rights on it:
// a logged-out visitor must land on the shared error page, not on an empty page.
// The page itself answers 410 on purpose: the browser logs it.
test.use({ allowedConsoleMessages: ['the server responded with a status of 410'] })

let api: APIRequestContext

test.beforeAll(async () => {
  api = await playwrightRequest.newContext({ storageState: 'playwright/.auth/user.json' })
})

test.afterAll(async () => {
  await api.dispose()
})

test('deleted organization shows the 410 error page', async ({ page }) => {
  const organization = await createOrganization(api, `Test org supprimée ${Date.now()}`)
  await deleteOrganizations(api, [organization.id])

  const response = await page.goto(`/organizations/${organization.id}/`)

  expect(response?.status()).toBe(410)
  await expect(page.getByRole('heading', { level: 1, name: '410' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Contenu supprimé' })).toBeVisible()
})

test('deleted dataset shows the 410 error page', async ({ page }) => {
  const dataset = await createDataset(api, `Test dataset supprimé ${Date.now()}`, 'Dataset pour tester la page 410')
  await deleteDatasets(api, [dataset.id])

  const response = await page.goto(`/datasets/${dataset.id}/`)

  expect(response?.status()).toBe(410)
  await expect(page.getByRole('heading', { level: 1, name: '410' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Contenu supprimé' })).toBeVisible()
})
