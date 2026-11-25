import type { APIRequestContext, Page } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDataset, createOrganization, deleteDatasets, deleteOrganizations } from '../helpers'

const createdDatasets: Array<string> = []
const createdOrganizations: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
  await deleteOrganizations(request, createdOrganizations)
})

async function createDatasetAndOrganization(request: APIRequestContext, uniqueId: number) {
  const dataset = await createDataset(request, `Test transfer dataset ${uniqueId}`, 'Dataset pour tester le transfert')
  createdDatasets.push(dataset.id)

  // The admin creating the organization becomes a member, so the same user
  // can request the transfer and accept it on behalf of the organization.
  const organization = await createOrganization(request, `Org transfert ${uniqueId}`)
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

  test('shows a transfer request with no known requester on behalf of the current owner', async ({ page, request }) => {
    const uniqueId = Date.now()
    const { dataset, organization } = await createDatasetAndOrganization(request, uniqueId)

    await requestTransfer(page, dataset, organization)

    // Transfers created before udata recorded the requester (December 2024) are served with `user: null`.
    let ownerName = ''
    await page.route(/\/api\/1\/transfer\/\?/, async (route) => {
      const response = await route.fetch()
      const transfers: Array<{ owner: { first_name: string, last_name: string } }> = await response.json()
      ownerName = `${transfers[0]!.owner.first_name} ${transfers[0]!.owner.last_name}`
      await route.fulfill({ response, json: transfers.map(transfer => ({ ...transfer, user: null })) })
    })

    // Reach the datasets page through a client-side navigation: the transfer list is then
    // fetched by the browser, where it can be intercepted, instead of during SSR.
    await page.goto(`/admin/organizations/${organization.id}/reuses`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: 'Jeux de données' })
      .and(page.locator(`[href="/admin/organizations/${organization.id}/datasets"]`))
      .click()

    await expect(page.getByText(`${ownerName} a demandé un transfert`)).toBeVisible()
    await expect(page.getByRole('link', { name: `Test transfer dataset ${uniqueId}` }).first()).toBeVisible()
  })
})
