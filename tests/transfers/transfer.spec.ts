import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

async function createDatasetAndOrganization(page: import('@playwright/test').Page, uniqueId: number) {
  const datasetResponse = await page.request.post(`${API_BASE}/api/1/datasets/`, {
    data: {
      title: `Test transfer dataset ${uniqueId}`,
      description: 'Dataset pour tester le transfert',
      frequency: 'unknown',
    },
  })
  const dataset = await datasetResponse.json()

  // The admin creating the organization becomes a member, so the same user
  // can request the transfer and accept it on behalf of the organization.
  const organizationResponse = await page.request.post(`${API_BASE}/api/1/organizations/`, {
    data: {
      name: `Org transfert ${uniqueId}`,
      description: 'Organisation destinataire du transfert',
    },
  })
  const organization = await organizationResponse.json()

  return { dataset, organization }
}

async function requestTransfer(page: import('@playwright/test').Page, dataset: { id: string }, organization: { name: string }) {
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
  test('can request a transfer to an organization and accept it', async ({ page }) => {
    const uniqueId = Date.now()
    const { dataset, organization } = await createDatasetAndOrganization(page, uniqueId)

    await requestTransfer(page, dataset, organization)

    // The recipient organization sees the pending transfer request
    await page.goto(`/admin/organizations/${organization.id}/datasets`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Transfert en attente')).toBeVisible()
    await expect(page.getByRole('link', { name: `Test transfer dataset ${uniqueId}` })).toBeVisible()

    await page.getByRole('button', { name: 'Accepter' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Accepter' }).click()

    await expect(page.getByText('Transfert en attente')).not.toBeVisible()

    // The dataset now belongs to the organization
    const updated = await (await page.request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.organization?.id).toBe(organization.id)

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
    await page.request.delete(`${API_BASE}/api/1/organizations/${organization.id}/`)
  })

  test('can refuse a transfer request', async ({ page }) => {
    const uniqueId = Date.now()
    const { dataset, organization } = await createDatasetAndOrganization(page, uniqueId)

    await requestTransfer(page, dataset, organization)

    await page.goto(`/admin/organizations/${organization.id}/datasets`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Transfert en attente')).toBeVisible()
    await page.getByRole('button', { name: 'Refuser' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Refuser' }).click()

    await expect(page.getByText('Transfert en attente')).not.toBeVisible()

    // The dataset still does not belong to the organization
    const updated = await (await page.request.get(`${API_BASE}/api/2/datasets/${dataset.id}/`)).json()
    expect(updated.organization).toBeNull()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
    await page.request.delete(`${API_BASE}/api/1/organizations/${organization.id}/`)
  })
})
