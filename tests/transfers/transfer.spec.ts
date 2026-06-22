import type { APIRequestContext, Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, deleteDatasets } from '../helpers'

const createdDatasets: Array<string> = []
const createdOrganizations: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
  for (const id of createdOrganizations.splice(0)) {
    await request.delete(`${API_BASE}/api/1/organizations/${id}/`)
  }
})

async function createDatasetAndOrganization(request: APIRequestContext, uniqueId: number) {
  const dataset = await createDataset(request, `Test transfer dataset ${uniqueId}`, 'Dataset pour tester le transfert')
  createdDatasets.push(dataset.id)

  // The admin creating the organization becomes a member, so the same user
  // can request the transfer and accept it on behalf of the organization.
  const organizationResponse = await request.post(`${API_BASE}/api/1/organizations/`, {
    data: {
      name: `Org transfert ${uniqueId}`,
      description: 'Organisation destinataire du transfert',
    },
  })
  const organization = await organizationResponse.json()
  createdOrganizations.push(organization.id)

  return { dataset, organization }
}

async function requestTransfer(page: Page, dataset: { id: string }, organization: { name: string }) {
  await page.goto(`/admin/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: 'Transférer', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Cette action est irréversible.')).toBeVisible()

  await dialog.getByTestId('producer-select').click()
  await page.getByRole('option', { name: organization.name }).click()
  await dialog.getByLabel('Commentaire').fill('Transfert de test E2E')

  await dialog.getByRole('button', { name: 'Transférer le jeu de données' }).click()
  await expect(page.getByText('Transfert demandé. Une notification a été envoyé au destinataire.')).toBeVisible()
}

test.describe('Dataset ownership transfer', () => {
  test('can request a transfer to an organization and accept it', async ({ page, request }) => {
    const uniqueId = Date.now()
    const { dataset, organization } = await createDatasetAndOrganization(request, uniqueId)

    await requestTransfer(page, dataset, organization)

    // The recipient organization sees the pending transfer request
    await page.goto(`/admin/organizations/${organization.id}/datasets`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('a demandé un transfert')).toBeVisible()
    await expect(page.getByRole('link', { name: `Test transfer dataset ${uniqueId}` }).first()).toBeVisible()

    await page.getByRole('button', { name: 'Accepter' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Accepter' }).click()

    // The request banner disappears once accepted (the closed modal may stay in
    // the DOM, hence the .first() on the banner text)
    await expect(page.getByText('a demandé un transfert').first()).not.toBeVisible()

    // The dataset now belongs to the organization
    const updated = await (await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.organization?.id).toBe(organization.id)
  })

  test('can refuse a transfer request', async ({ page, request }) => {
    const uniqueId = Date.now()
    const { dataset, organization } = await createDatasetAndOrganization(request, uniqueId)

    await requestTransfer(page, dataset, organization)

    await page.goto(`/admin/organizations/${organization.id}/datasets`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('a demandé un transfert')).toBeVisible()
    await page.getByRole('button', { name: 'Refuser' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Refuser' }).click()

    await expect(page.getByText('a demandé un transfert').first()).not.toBeVisible()

    // The dataset still does not belong to the organization
    const updated = await (await request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.organization).toBeNull()
  })
})
