import type { APIRequestContext, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

export const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://dev.local:7000'

export type ApiDataset = { id: string, title: string, slug: string }
export type ApiResource = { id: string, title: string, latest: string, url: string }
export type ApiHarvestSource = { id: string, name: string, backend: string, schedule: string | null, config: Record<string, unknown> }
export type ApiOrganization = { id: string, name: string }
export type ApiReuse = { id: string, title: string, slug: string }

export async function createHarvestSource(request: APIRequestContext, name: string, backend: string, config: Record<string, unknown> = {}): Promise<ApiHarvestSource> {
  const response = await request.post(`${API_BASE}/api/1/harvest/sources/`, {
    data: {
      name,
      backend,
      url: 'https://example.com/csw',
      config,
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to create harvest source "${name}": ${response.status()} ${(await response.text()).slice(0, 300)}`)
  }
  return await response.json()
}

export async function deleteHarvestSources(request: APIRequestContext, ids: Array<string>): Promise<void> {
  for (const id of ids.splice(0)) {
    await request.delete(`${API_BASE}/api/1/harvest/source/${id}/`)
  }
}

export async function createDataset(request: APIRequestContext, title: string, description: string): Promise<ApiDataset> {
  const response = await request.post(`${API_BASE}/api/1/datasets/`, {
    data: {
      title,
      description,
      frequency: 'unknown',
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to create dataset "${title}": ${response.status()} ${(await response.text()).slice(0, 300)}`)
  }
  return await response.json()
}

export async function createRemoteResource(request: APIRequestContext, datasetId: string, title: string): Promise<ApiResource> {
  const response = await request.post(`${API_BASE}/api/1/datasets/${datasetId}/resources/`, {
    data: {
      title,
      type: 'main',
      filetype: 'remote',
      url: `https://example.com/${datasetId}/${encodeURIComponent(title)}.csv`,
      format: 'csv',
    },
  })
  return await response.json()
}

export async function createDatasetWithRemoteResources(request: APIRequestContext, title: string, resourceTitles: Array<string>): Promise<{ dataset: ApiDataset, resources: Array<ApiResource> }> {
  const dataset = await createDataset(request, title, 'Dataset de test E2E')

  const resources: Array<ApiResource> = []
  for (const resourceTitle of resourceTitles) {
    resources.push(await createRemoteResource(request, dataset.id, resourceTitle))
  }

  return { dataset, resources }
}

// The banner is the only way into the new explorer, and it only lives on the resources
// tab: opt in from there, then navigate wherever the test needs to go.
export async function enableNewExplorer(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await page.getByRole('button', { name: 'Tester la nouvelle navigation' }).click()
  await expect(page.locator('aside')).toBeVisible({ timeout: 30000 })
}

export async function deleteDatasets(request: APIRequestContext, ids: Array<string>): Promise<void> {
  for (const id of ids.splice(0)) {
    await request.delete(`${API_BASE}/api/1/datasets/${id}/`)
  }
}

// `url` has to differ between reuses: udata hashes it into a unique `urlhash`.
export async function createReuse(request: APIRequestContext, title: string, url: string): Promise<ApiReuse> {
  const response = await request.post(`${API_BASE}/api/1/reuses/`, {
    data: {
      title,
      url,
      description: 'Réutilisation créée par les tests end to end',
      type: 'application',
      topic: 'transport_and_mobility',
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to create reuse "${title}": ${response.status()} ${(await response.text()).slice(0, 300)}`)
  }
  return await response.json()
}

export async function deleteReuses(request: APIRequestContext, ids: Array<string>): Promise<void> {
  for (const id of ids.splice(0)) {
    await request.delete(`${API_BASE}/api/1/reuses/${id}/`)
  }
}

export async function createOrganization(request: APIRequestContext, name: string): Promise<ApiOrganization> {
  const response = await request.post(`${API_BASE}/api/1/organizations/`, {
    data: { name, description: 'Organisation créée par les tests end to end' },
  })
  if (!response.ok()) {
    throw new Error(`Failed to create organization "${name}": ${response.status()} ${(await response.text()).slice(0, 300)}`)
  }
  return await response.json()
}

export async function deleteOrganizations(request: APIRequestContext, ids: Array<string>): Promise<void> {
  for (const id of ids.splice(0)) {
    await request.delete(`${API_BASE}/api/1/organizations/${id}/`)
  }
}

// When clicking "Suivant" we execute the validation of the frequency input
// because we blur outside the select. This validation create a warning (because
// "Inconnu" is not recommanded), and the warning make the "Suivant" button
// move a little bit down so the click is miss. We want to fix this one day!
// (it also happens in a regular browser with a human, so it's really not ideal)
export const clickOutside = async (page: Page) => {
  await page.mouse.click(1, 1)
}

const IGNORED_MESSAGES = [
  // Cookie secure flag doesn't work in dev (HTTP)
  'non-HTTPS cookie',
]

export function setupConsoleTracking(page: Page) {
  const warnings: string[] = []
  const errors: string[] = []

  page.on('console', (msg) => {
    const text = msg.text()
    if (IGNORED_MESSAGES.some(ignored => text.includes(ignored))) return

    const type = msg.type()
    if (type === 'warning') {
      warnings.push(text)
    }
    if (type === 'error') {
      errors.push(text)
    }
  })

  page.on('pageerror', (error) => {
    if (IGNORED_MESSAGES.some(ignored => error.message.includes(ignored))) return
    errors.push(error.message)
  })

  return {
    annotateAndCheck() {
      for (const w of warnings) {
        test.info().annotations.push({ type: 'warning', description: w })
      }
      for (const e of errors) {
        test.info().annotations.push({ type: 'error', description: e })
      }

      const all = [...errors, ...warnings]
      if (all.length > 0) {
        throw new Error(`Console errors/warnings:\n${all.join('\n')}`)
      }
    },
  }
}
