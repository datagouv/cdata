import { test, expect } from '../base'

const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

// Pin the old resources layout: these tests target ResourceAccordion,
// not the new explorer behind the ?new_explorer=1 feature flag.
const LAYOUT_QUERY = 'new_explorer=0'

type CreatedResource = { id: string, title: string, latest: string }

async function createDatasetWithResources(page: import('@playwright/test').Page, uniqueId: number, mainCount: number) {
  const response = await page.request.post(`${API_BASE}/api/1/datasets/`, {
    data: {
      title: `Test public resources ${uniqueId}`,
      description: 'Dataset pour tester l\'affichage public des ressources',
      frequency: 'unknown',
    },
  })
  const dataset = await response.json()

  const resources: Array<CreatedResource> = []
  for (let i = 1; i <= mainCount; i++) {
    const title = `Fichier numero ${String(i).padStart(2, '0')}`
    const resourceResponse = await page.request.post(`${API_BASE}/api/1/datasets/${dataset.id}/resources/`, {
      data: {
        title,
        type: 'main',
        filetype: 'remote',
        url: `https://example.com/${uniqueId}/fichier-${i}.csv`,
        format: 'csv',
      },
    })
    const resource = await resourceResponse.json()
    resources.push({ id: resource.id, title, latest: resource.latest })
  }

  return { dataset, resources }
}

test.describe('Public resources display', () => {
  test('paginates resources by type', async ({ page }) => {
    const uniqueId = Date.now()
    const { dataset } = await createDatasetWithResources(page, uniqueId, 12)

    await page.goto(`/datasets/${dataset.id}/?${LAYOUT_QUERY}`)
    await page.waitForLoadState('networkidle')

    // First page: 10 resources out of 12
    await expect(page.getByText('Fichier numero 01')).toBeVisible()
    await expect(page.getByText('Fichier numero 10')).toBeVisible()
    await expect(page.getByText('Fichier numero 11')).not.toBeVisible()

    const pagination = page.getByRole('navigation', { name: 'Pagination' })
    await expect(pagination).toBeVisible()
    await pagination.getByText('2', { exact: true }).click()

    await expect(page.getByText('Fichier numero 11')).toBeVisible()
    await expect(page.getByText('Fichier numero 12')).toBeVisible()
    await expect(page.getByText('Fichier numero 01')).not.toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can search within resources', async ({ page }) => {
    const uniqueId = Date.now()
    const { dataset } = await createDatasetWithResources(page, uniqueId, 12)

    await page.goto(`/datasets/${dataset.id}/?${LAYOUT_QUERY}`)
    await page.waitForLoadState('networkidle')

    await page.getByPlaceholder('Rechercher').fill('Fichier numero 07')

    await expect(page.getByText('Fichier numero 07')).toBeVisible()
    await expect(page.getByText('Fichier numero 01')).not.toBeVisible()

    // No-results state with a reset button
    await page.getByPlaceholder('Rechercher').fill('zzz-introuvable-zzz')
    await expect(page.getByText('Pas de résultats pour « zzz-introuvable-zzz »')).toBeVisible()

    await page.getByRole('button', { name: 'Réinitialiser les filtres' }).click()
    await expect(page.getByText('Fichier numero 01')).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('can copy the resource URL', async ({ page, context, browserName }) => {
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    }

    const uniqueId = Date.now()
    const { dataset } = await createDatasetWithResources(page, uniqueId, 1)

    await page.goto(`/datasets/${dataset.id}/?${LAYOUT_QUERY}`)
    await page.waitForLoadState('networkidle')

    await page.getByTestId('expand-button').first().click()
    await page.getByRole('button', { name: 'Copier le lien' }).click()

    await expect(page.getByText('Lien copié !')).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('deep-link to a specific resource shows a banner', async ({ page }) => {
    const uniqueId = Date.now()
    const { dataset, resources } = await createDatasetWithResources(page, uniqueId, 3)

    await page.goto(`/datasets/${dataset.id}/?resource_id=${resources[1].id}&${LAYOUT_QUERY}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Vous consultez une resource spécifique.')).toBeVisible()
    await expect(page.getByText(resources[1].title)).toBeVisible()
    await expect(page.getByText(resources[0].title)).not.toBeVisible()

    // Back to the full list
    await page.getByRole('link', { name: 'Voir toutes les resources' }).click()
    await expect(page.getByText('Vous consultez une resource spécifique.')).not.toBeVisible()
    await expect(page.getByText(resources[0].title)).toBeVisible()

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })

  test('remote resource has a correct visit link', async ({ page }) => {
    const uniqueId = Date.now()
    const { dataset, resources } = await createDatasetWithResources(page, uniqueId, 1)

    await page.goto(`/datasets/${dataset.id}/?${LAYOUT_QUERY}`)
    await page.waitForLoadState('networkidle')

    await page.getByTestId('expand-button').first().click()

    const visitLink = page.getByRole('link', { name: 'Visiter' })
    await expect(visitLink).toBeVisible()
    await expect(visitLink).toHaveAttribute('href', resources[0].latest)

    await page.request.delete(`${API_BASE}/api/1/datasets/${dataset.id}/`)
  })
})
