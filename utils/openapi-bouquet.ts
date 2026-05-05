// Bouquet-specific post-hoc transforms for extracted endpoints.
// These operate on the output of utils/openapi-extract.ts and are only
// applied when the dataservice title matches the Bouquet pattern.

import type { EndpointProperties } from './openapi-extract'

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// Bouquet responses wrap payloads in a top-level `data` key.
// Object endpoints: properties = { data: { type: object, properties: {...} } }
// Array endpoints:  properties = { data: { type: array, items: { properties: { data: { properties: {...} } } } } }
// (the double-data shape is real — confirmed against /v3/inpi/rne/.../beneficiaires_effectifs).
function unwrapOne(properties: Record<string, unknown>): Record<string, unknown> {
  const data = properties.data
  if (!isObject(data)) return properties

  if (isObject(data.properties)) {
    return data.properties as Record<string, unknown>
  }

  if (data.type === 'array' && isObject(data.items)) {
    const itemsProps = (data.items as Record<string, unknown>).properties
    if (isObject(itemsProps)) {
      const innerData = (itemsProps as Record<string, unknown>).data
      if (isObject(innerData) && isObject(innerData.properties)) {
        return innerData.properties as Record<string, unknown>
      }
    }
  }

  return properties
}

export function unwrapBouquetData(endpoints: EndpointProperties[]): EndpointProperties[] {
  return endpoints.map(ep => ({ ...ep, properties: unwrapOne(ep.properties) }))
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036F]/g, '').replace(/\s+/g, ' ').trim()
}

function normalizeWords(s: string): string[] {
  return normalize(s).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2).sort()
}

type FilterInfo = {
  name: string
  provider: string | null
}

function extractFilterInfo(title: string): FilterInfo | null {
  if (!title.includes('| Bouquet')) return null

  let name = title.split('| Bouquet')[0].trim()
  if (name.startsWith('API ')) name = name.slice(4)

  let provider: string | null = null
  if (name.includes(' - ')) {
    const parts = name.split(' - ')
    provider = parts.pop()!.trim()
    name = parts.join(' - ').trim()
  }

  return { name, provider }
}

function matchesEndpoint(summary: string, path: string, filter: FilterInfo): boolean {
  const normSummary = normalize(summary)
  const normName = normalize(filter.name)

  if (normSummary.includes(normName) || normName.includes(normSummary)) return true

  const nameWords = normalizeWords(filter.name)
  const summaryWords = normalizeWords(summary)
  if (nameWords.length >= 3 && nameWords.every(w => summaryWords.some(sw => sw.includes(w) || w.includes(sw)))) return true

  if (filter.provider && normalize(path).includes(normalize(filter.provider))) {
    const commonWords = nameWords.filter(w => w.length > 3 && summaryWords.some(sw => sw.includes(w)))
    if (commonWords.length >= 2) return true
  }

  return false
}

export function filterEndpointsByTitle(endpoints: EndpointProperties[], title: string | undefined): EndpointProperties[] {
  if (!title) return endpoints
  const filter = extractFilterInfo(title)
  if (!filter) return endpoints
  const matched = endpoints.filter(ep => ep.summary && matchesEndpoint(ep.summary, ep.path, filter))
  return matched.length > 0 ? matched : endpoints
}
