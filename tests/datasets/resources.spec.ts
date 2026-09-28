import type { APIRequestContext } from '@playwright/test'
import { test, expect } from '../base'
import { API_BASE, createDatasetWithRemoteResources, deleteDatasets } from '../helpers'

// These tests target ResourceAccordion, which is what a visitor gets until they opt into
// the new explorer from the banner — the cookie that carries the choice is absent here.

const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
})

function resourceTitles(count: number): Array<string> {
  return Array.from({ length: count }, (_, index) => `Fichier numero ${String(index + 1).padStart(2, '0')}`)
}

// The page displays resources in the API order (newest first), not in creation
// order: read the expected page content from the same endpoint the page uses.
async function getDisplayedTitles(request: APIRequestContext, datasetId: string, page: number): Promise<Array<string>> {
  const response = await request.get(`${API_BASE}/api/2/datasets/${datasetId}/resources/?type=main&page=${page}&page_size=10`)
  const { data } = await response.json()
  return data.map((resource: { title: string }) => resource.title)
}

test.describe('Public resources display', () => {
  test('paginates resources by type', async ({ page, request }) => {
    const { dataset } = await createDatasetWithRemoteResources(request, `Test public resources ${Date.now()}`, resourceTitles(12))
    createdDatasets.push(dataset.id)

    const firstPage = await getDisplayedTitles(request, dataset.id, 1)
    const secondPage = await getDisplayedTitles(request, dataset.id, 2)
    expect(firstPage).toHaveLength(10)
    expect(secondPage).toHaveLength(2)

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    // First page: 10 resources out of 12
    await expect(page.getByText(firstPage[0])).toBeVisible()
    await expect(page.getByText(firstPage[9])).toBeVisible()
    await expect(page.getByText(secondPage[0])).not.toBeVisible()

    const pagination = page.getByRole('navigation', { name: 'Pagination' })
    await expect(pagination).toBeVisible()
    await pagination.getByText('2', { exact: true }).click()

    await expect(page.getByText(secondPage[0])).toBeVisible()
    await expect(page.getByText(secondPage[1])).toBeVisible()
    await expect(page.getByText(firstPage[0])).not.toBeVisible()
  })

  test('can search within resources', async ({ page, request }) => {
    const { dataset } = await createDatasetWithRemoteResources(request, `Test public resources ${Date.now()}`, resourceTitles(12))
    createdDatasets.push(dataset.id)

    const firstPage = await getDisplayedTitles(request, dataset.id, 1)

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByPlaceholder('Rechercher').fill('Fichier numero 07')

    await expect(page.getByText('Fichier numero 07')).toBeVisible()
    await expect(page.getByText('Fichier numero 01')).not.toBeVisible()

    // No-results state with a reset button
    await page.getByPlaceholder('Rechercher').fill('zzz-introuvable-zzz')
    await expect(page.getByText('Pas de résultats pour « zzz-introuvable-zzz »')).toBeVisible()

    await page.getByRole('button', { name: 'Réinitialiser les filtres' }).click()
    await expect(page.getByText(firstPage[0])).toBeVisible()
  })

  test('can copy the resource URL', async ({ page, context, request, browserName }) => {
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    }

    const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test public resources ${Date.now()}`, resourceTitles(1))
    createdDatasets.push(dataset.id)

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    // navigator.clipboard only exists in secure contexts: CI runs on localhost
    // (secure), but local runs on http://dev.local are not
    test.skip(!await page.evaluate(() => window.isSecureContext), 'navigator.clipboard requires a secure context')

    await page.getByTestId('expand-button').first().click()
    await page.getByRole('button', { name: 'Copier le lien' }).click()

    await expect(page.getByText('Lien copié !')).toBeVisible()

    // The copied link is the deep-link to this specific resource (clipboard
    // reading is only available on chromium)
    if (browserName === 'chromium') {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
      expect(clipboardText).toContain(`resource_id=${resources[0].id}`)
    }
  })

  test('deep-link to a specific resource shows a banner', async ({ page, request }) => {
    const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test public resources ${Date.now()}`, resourceTitles(3))
    createdDatasets.push(dataset.id)

    await page.goto(`/datasets/${dataset.id}/?resource_id=${resources[1].id}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Vous consultez une resource spécifique.')).toBeVisible()
    await expect(page.getByText(resources[1].title)).toBeVisible()
    await expect(page.getByText(resources[0].title)).not.toBeVisible()

    // Back to the full list
    await page.getByRole('link', { name: 'Voir toutes les resources' }).click()
    await expect(page.getByText('Vous consultez une resource spécifique.')).not.toBeVisible()
    await expect(page.getByText(resources[0].title)).toBeVisible()
  })

  test('deep-link to a deleted resource falls back to the full list', async ({ page, request }) => {
    const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test public resources ${Date.now()}`, resourceTitles(2))
    createdDatasets.push(dataset.id)

    const pageErrors: Array<Error> = []
    page.on('pageerror', error => pageErrors.push(error))

    // The link was shared or bookmarked while the resource still existed
    await page.goto(`/datasets/${dataset.id}/?resource_id=00000000-0000-0000-0000-000000000000`)

    await expect(page.getByText('Ce fichier est introuvable.')).toBeVisible()
    await expect(page.getByText('Vous consultez une resource spécifique.')).not.toBeVisible()
    await expect(page.getByText(resources[0].title)).toBeVisible()
    await expect(page).not.toHaveURL(/resource_id=/)
    expect(pageErrors).toEqual([])
  })

  test('remote resource has a correct download link', async ({ page, request }) => {
    const { dataset, resources } = await createDatasetWithRemoteResources(request, `Test public resources ${Date.now()}`, resourceTitles(1))
    createdDatasets.push(dataset.id)

    await page.goto(`/datasets/${dataset.id}/`)
    await page.waitForLoadState('networkidle')

    await page.getByTestId('expand-button').first().click()

    // csv is not a "URL" format: the action is a download link pointing to the
    // stable "latest" URL of the resource
    const downloadLink = page.getByRole('link', { name: 'Télécharger', exact: true })
    await expect(downloadLink).toBeVisible()
    await expect(downloadLink).toHaveAttribute('href', resources[0].latest)
  })
})
