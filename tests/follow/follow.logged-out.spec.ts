import type { APIRequestContext } from '@playwright/test'
import { request as playwrightRequest } from '@playwright/test'
import { test, expect } from '../base'
import { createDataset, deleteDatasets } from '../helpers'

// The browser context is logged out, but fixtures are created through an
// authenticated API context (storageState produced by the setup project).
let api: APIRequestContext
const createdDatasets: Array<string> = []

test.beforeAll(async () => {
  api = await playwrightRequest.newContext({ storageState: 'playwright/.auth/user.json' })
})

test.afterAll(async () => {
  await deleteDatasets(api, createdDatasets)
  await api.dispose()
})

// The follow button is only rendered for logged-in users (v-if="me" in
// FollowButton.vue): a logged-out visitor has no follow action at all.
test('follow button is not shown to logged-out visitors', async ({ page }) => {
  const dataset = await createDataset(api, `Test follow logged out ${Date.now()}`, 'Dataset pour tester le bouton favoris déconnecté')
  createdDatasets.push(dataset.id)

  await page.goto(`/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  // The page rendered (title visible) but without the follow button
  await expect(page.getByRole('heading', { level: 1 })).toContainText(dataset.title)
  await expect(page.getByRole('button', { name: 'Ajouter aux favoris' })).not.toBeVisible()
})
