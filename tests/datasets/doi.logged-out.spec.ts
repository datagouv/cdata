import type { APIRequestContext } from '@playwright/test'
import { request as playwrightRequest } from '@playwright/test'
import { test, expect } from '../base'
import { createDataset, createOrganization, deleteDatasets, deleteOrganizations } from '../helpers'

// The browser context is logged out, but fixtures are created through an
// authenticated API context (storageState produced by the setup project).
let api: APIRequestContext
const createdDatasets: Array<string> = []
const createdOrganizations: Array<string> = []

test.beforeAll(async () => {
  api = await playwrightRequest.newContext({ storageState: 'playwright/.auth/user.json' })
})

test.afterAll(async () => {
  await deleteDatasets(api, createdDatasets)
  await deleteOrganizations(api, createdOrganizations)
  await api.dispose()
})

// Asking for a DOI needs no account: this is the nominal case of the feature, and the
// email is the only thing the support cannot infer from the session.
test('a logged-out visitor can ask for a DOI and must type an email', async ({ page }) => {
  const organization = await createOrganization(api, `Test DOI logged out org ${Date.now()}`)
  createdOrganizations.push(organization.id)
  const dataset = await createDataset(api, `Test DOI logged out ${Date.now()}`, 'Dataset de test E2E', { organization: organization.id })
  createdDatasets.push(dataset.id)

  const sentMessages: Array<Record<string, string>> = []
  await page.route('**/nuxt-api/send-message', async (route) => {
    sentMessages.push(route.request().postDataJSON())
    await route.fulfill({ status: 200, body: '' })
  })

  await page.goto(`/datasets/${dataset.id}/informations`)
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: 'Demander un DOI' }).click()

  const modal = page.getByRole('dialog')
  await expect(modal.getByLabel('Votre adresse email')).toHaveValue('')

  await modal.getByLabel('Votre adresse email').fill('chercheuse@example.com')
  await modal.getByLabel('Pourquoi avez-vous besoin de ce DOI ?').fill('Pour une thèse.')
  await modal.getByRole('button', { name: 'Envoyer la demande' }).click()

  await expect(page.getByText('Votre demande de DOI a bien été envoyée.')).toBeVisible()

  expect(sentMessages).toHaveLength(1)
  expect(sentMessages[0]!.email).toBe('chercheuse@example.com')
  expect(sentMessages[0]!.segment).toBe('doi')
})
