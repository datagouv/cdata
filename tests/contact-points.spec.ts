import { randomUUID } from 'node:crypto'
import type { APIRequestContext, Locator, Page } from '@playwright/test'
import { test, expect } from './base'
import { createContactPoint, createDataset, createOrganization, deleteContactPointsOf, deleteDatasets, deleteOrganizations } from './helpers'

// Attributions used to be reserved to harvested datasets (datagouv/data.gouv.fr#2062).
// These tests cover them on a dataset published directly on data.gouv.fr: the form
// offers every role, and the public page displays the role whatever the origin.

const createdDatasets: Array<string> = []
const createdOrganizations: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
  await deleteContactPointsOf(request, createdOrganizations)
  await deleteOrganizations(request, createdOrganizations)
})

// Several fieldsets of the dataset form share the same `aria-labelledby` target, so
// `getByRole('group')` resolves them all to the first legend: match on the legend text.
const contactPointsSection = (page: Page) =>
  page.locator('fieldset').filter({ hasText: 'Points de contact et attributions' })

// The role of a selected attribution is shown as a badge inside a "Rôle:" paragraph.
// The section title itself contains "contact", so a bare text match is ambiguous.
const selectedRole = (section: Locator) =>
  section.getByRole('paragraph').filter({ hasText: 'Rôle:' })

// Workers run in parallel and organization slugs are unique in udata: a timestamp is
// not enough to tell two organizations created in the same millisecond apart.
const uniqueSuffix = () => randomUUID().slice(0, 8)

async function createOrganizationWithDataset(request: APIRequestContext, uniqueId: string, contactPoints: Array<string> = []) {
  // The admin creating the organization becomes a member, so the same user can edit
  // the dataset and manage the organization's contact points.
  const organization = await createOrganization(request, `Org attributions ${uniqueId}`)
  createdOrganizations.push(organization.id)

  const dataset = await createDataset(
    request,
    `Dataset attributions ${uniqueId}`,
    'Jeu de données pour tester les attributions',
    { organization: organization.id, contactPoints },
  )
  createdDatasets.push(dataset.id)

  return { organization, dataset }
}

test('can add an attribution with a specific role to a directly published dataset', async ({ page, request }) => {
  const uniqueId = uniqueSuffix()
  const { dataset } = await createOrganizationWithDataset(request, uniqueId)

  await page.goto(`/admin/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  const section = contactPointsSection(page)
  await expect(section.getByRole('heading', { name: 'Points de contact et attributions' })).toBeVisible()

  await section.getByRole('button', { name: 'Nouvelle attribution' }).click()

  // "Contact" is the role selected by default when adding an attribution
  await expect(section.getByLabel('Rôle *')).toHaveValue('contact')

  await section.getByLabel('Rôle *').selectOption('creator')
  await section.getByLabel('Nom *').fill(`Service producteur ${uniqueId}`)
  await section.getByLabel('E-mail').fill(`producteur-${uniqueId}@example.org`)
  await section.getByRole('button', { name: 'Enregistrer' }).click()

  // Saving the contact point selects it and replaces the form by its summary
  await expect(selectedRole(section)).toContainText('Créateur')

  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page.getByText('Jeu de données mis à jour !')).toBeVisible()

  await page.goto(`/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Attributions', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: `Service producteur ${uniqueId}` })).toBeVisible()
  await expect(page.getByText('(Créateur)')).toBeVisible()
  // A dataset carrying a role other than "contact" presents its organization as the
  // distributor, the producer being the attribution.
  await expect(page.getByText('Diffuseur', { exact: true })).toBeVisible()
})

test('keeps the plain contact wording when the default role is kept', async ({ page, request }) => {
  const uniqueId = uniqueSuffix()
  const { dataset } = await createOrganizationWithDataset(request, uniqueId)

  await page.goto(`/admin/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  const section = contactPointsSection(page)
  await section.getByRole('button', { name: 'Nouvelle attribution' }).click()
  await section.getByLabel('Nom *').fill(`Guichet unique ${uniqueId}`)
  await section.getByLabel('E-mail').fill(`guichet-${uniqueId}@example.org`)
  await section.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(selectedRole(section)).toContainText('Contact')

  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page.getByText('Jeu de données mis à jour !')).toBeVisible()

  await page.goto(`/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Contacts', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: `Guichet unique ${uniqueId}` })).toBeVisible()
  await expect(page.getByText('(Contact)')).toBeVisible()
  await expect(page.getByText('Producteur', { exact: true })).toBeVisible()
})

test('can select an attribution already created by the organization', async ({ page, request }) => {
  const uniqueId = uniqueSuffix()
  const { organization, dataset } = await createOrganizationWithDataset(request, uniqueId)
  const contactPoint = await createContactPoint(request, organization.id, {
    name: `Cellule juridique ${uniqueId}`,
    email: `juridique-${uniqueId}@example.org`,
    role: 'rightsHolder',
  })

  await page.goto(`/admin/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  const section = contactPointsSection(page)
  await section.getByTestId('searchable-select-choisissez-l-attribution-avec-laquelle-vous-voulez-publier').click()
  await page.getByRole('option', { name: contactPoint.name }).click()

  await expect(selectedRole(section)).toContainText('Détenteur des droits')

  await page.getByRole('button', { name: 'Sauvegarder' }).click()
  await expect(page.getByText('Jeu de données mis à jour !')).toBeVisible()

  await page.goto(`/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('link', { name: contactPoint.name })).toBeVisible()
  await expect(page.getByText('(Détenteur des droits)')).toBeVisible()
})

test('can update a contact point and see the new role on the dataset page', async ({ page, request }) => {
  const uniqueId = uniqueSuffix()
  const organization = await createOrganization(request, `Org attributions ${uniqueId}`)
  createdOrganizations.push(organization.id)

  const contactPoint = await createContactPoint(request, organization.id, {
    name: `Support ${uniqueId}`,
    email: `support-${uniqueId}@example.org`,
    role: 'contact',
  })
  const dataset = await createDataset(
    request,
    `Dataset attributions ${uniqueId}`,
    'Jeu de données pour tester les attributions',
    { organization: organization.id, contactPoints: [contactPoint.id] },
  )
  createdDatasets.push(dataset.id)

  await page.goto(`/admin/organizations/${organization.id}/profile/contacts`)
  await page.waitForLoadState('networkidle')

  const row = page.getByRole('row').filter({ hasText: `Support ${uniqueId}` })
  await expect(row.getByText('Contact')).toBeVisible()
  await expect(row.getByText(`support-${uniqueId}@example.org`)).toBeVisible()

  await row.getByRole('button', { name: 'Modifier' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Nom *').fill(`Direction juridique ${uniqueId}`)
  await dialog.getByLabel('Rôle *').selectOption('rightsHolder')
  await dialog.getByRole('button', { name: 'Sauvegarder' }).click()

  await expect(page.getByText('Point de contact mis à jour !')).toBeVisible()
  const updatedRow = page.getByRole('row').filter({ hasText: `Direction juridique ${uniqueId}` })
  await expect(updatedRow.getByText('Détenteur des droits')).toBeVisible()

  await page.goto(`/datasets/${dataset.id}/`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Attributions', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: `Direction juridique ${uniqueId}` })).toBeVisible()
  await expect(page.getByText('(Détenteur des droits)')).toBeVisible()
})
