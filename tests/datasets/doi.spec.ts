import { test, expect } from '../base'
import { createDataset, createOrganization, deleteDatasets, deleteOrganizations } from '../helpers'

// Minting a DOI needs DataCite credentials the test environment does not have, so every
// dataset here is DOI-less: what is covered is who may ask for one and what the request
// carries to the support.

const createdDatasets: Array<string> = []
const createdOrganizations: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
  await deleteOrganizations(request, createdOrganizations)
})

test('a DOI request carries the dataset and the motivation to the support', async ({ page, request }) => {
  const organization = await createOrganization(request, `Test DOI org ${Date.now()}`)
  createdOrganizations.push(organization.id)
  const dataset = await createDataset(request, `Test DOI request ${Date.now()}`, 'Dataset de test E2E', { organization: organization.id })
  createdDatasets.push(dataset.id)

  // Collected in an array rather than a nullable variable, which TypeScript would still
  // consider null after the route callback.
  const sentMessages: Array<Record<string, string>> = []
  await page.route('**/nuxt-api/send-message', async (route) => {
    sentMessages.push(route.request().postDataJSON())
    await route.fulfill({ status: 200, body: '' })
  })

  await page.goto(`/datasets/${dataset.id}/informations`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Ce jeu de données n\'a pas de DOI.')).toBeVisible()
  await page.getByRole('button', { name: 'Demander un DOI' }).click()

  const modal = page.getByRole('dialog')
  await expect(modal.getByLabel('Votre adresse email')).toHaveValue('admin@example.com')
  await modal.getByLabel('Pourquoi avez-vous besoin de ce DOI ?').fill('Je cite ce jeu de données dans un article.')
  await modal.getByRole('button', { name: 'Envoyer la demande' }).click()

  await expect(page.getByText('Votre demande de DOI a bien été envoyée.')).toBeVisible()
  await expect(modal).not.toBeVisible()

  expect(sentMessages).toHaveLength(1)
  const sent = sentMessages[0]!
  expect(sent.segment).toBe('doi')
  expect(sent.email).toBe('admin@example.com')
  expect(sent.subject).toContain(dataset.title)
  // The permalink of the dataset, so the support knows which one is asked for.
  expect(sent.body).toContain(`/datasets/${dataset.slug}`)
  expect(sent.body).toContain('Je cite ce jeu de données dans un article.')

  // Reopening the modal must not offer to send the same message again.
  await page.getByRole('button', { name: 'Demander un DOI' }).click()
  await expect(modal.getByLabel('Pourquoi avez-vous besoin de ce DOI ?')).toHaveValue('')
})

test('a dataset owned by a user offers no DOI request', async ({ page, request }) => {
  // `createDataset` leaves the dataset to its owner: DataCite only mints DOIs for
  // datasets published by an organization, so asking would be refused anyway.
  const dataset = await createDataset(request, `Test DOI owned by user ${Date.now()}`, 'Dataset de test E2E')
  createdDatasets.push(dataset.id)

  await page.goto(`/datasets/${dataset.id}/informations`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Identifiant')).toBeVisible()
  await expect(page.getByText('Ce jeu de données n\'a pas de DOI.')).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Demander un DOI' })).not.toBeVisible()
})

test('the admin page refuses a DOI to a dataset without an organization', async ({ page, request }) => {
  const dataset = await createDataset(request, `Test DOI admin no org ${Date.now()}`, 'Dataset de test E2E')
  createdDatasets.push(dataset.id)

  await page.goto(`/admin/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Seul un jeu de données publié par une organisation peut recevoir un DOI.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Créer un DOI' })).toBeDisabled()
})

test('the admin page refuses a DOI to a draft dataset', async ({ page, request }) => {
  const organization = await createOrganization(request, `Test DOI draft org ${Date.now()}`)
  createdOrganizations.push(organization.id)
  const dataset = await createDataset(request, `Test DOI admin draft ${Date.now()}`, 'Dataset de test E2E', { organization: organization.id })
  createdDatasets.push(dataset.id)

  await page.goto(`/admin/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  // Public and owned by an organization: the DOI can be minted.
  await expect(page.getByRole('button', { name: 'Créer un DOI' })).toBeEnabled()

  await page.getByRole('button', { name: 'Passer en brouillon' }).click()
  await expect(page.getByText('Jeu de données passé en brouillon !')).toBeVisible()

  await expect(page.getByText('Seul un jeu de données public peut recevoir un DOI.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Créer un DOI' })).toBeDisabled()
})
