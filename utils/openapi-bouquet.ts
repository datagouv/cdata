// Utilities for extracting and filtering response properties from OpenAPI specs
// following the Bouquet API Entreprise / Particulier conventions:
// - Responses wrapped in a `data` key (either object or array of objects)
// - Dataservice titles shaped like "API <name> - <provider> | Bouquet API <X>"

export interface EndpointProperties {
  path: string
  summary: string | undefined
  properties: Record<string, unknown>
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036F]/g, '').replace(/\s+/g, ' ').trim()
}

function normalizeWords(s: string): string[] {
  return normalize(s).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2).sort()
}

function extractDataProperties(schema: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  const dataNode = (schema?.properties as Record<string, unknown>)?.data as Record<string, unknown> | undefined
  if (!dataNode) return undefined

  // Array response: properties live under data.items.properties.data.properties
  if (dataNode.type === 'array') {
    const items = dataNode.items as Record<string, unknown> | undefined
    const innerData = (items?.properties as Record<string, unknown>)?.data as Record<string, unknown> | undefined
    return innerData?.properties as Record<string, unknown> | undefined
  }

  return dataNode.properties as Record<string, unknown> | undefined
}

export function extractEndpoints(spec: unknown): EndpointProperties[] {
  const paths = (spec as Record<string, unknown>)?.paths as Record<string, unknown> | undefined
  if (!paths) return []

  const result: EndpointProperties[] = []

  for (const [path, methods] of Object.entries(paths)) {
    const get = (methods as Record<string, unknown>)?.get as Record<string, unknown> | undefined
    if (!get?.responses) continue

    const ok = (get.responses as Record<string, unknown>)?.['200'] as Record<string, unknown> | undefined
    if (!ok?.content) continue

    const jsonContent = (ok.content as Record<string, unknown>)?.['application/json'] as Record<string, unknown> | undefined
    const schema = jsonContent?.schema as Record<string, unknown> | undefined
    const properties = extractDataProperties(schema)

    if (properties && Object.keys(properties).length > 0) {
      result.push({
        path,
        summary: get.summary as string | undefined,
        properties,
      })
    }
  }

  return result
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

  // Substring match (handles most cases including "[Identité] Statut..." prefixes)
  if (normSummary.includes(normName) || normName.includes(normSummary)) return true

  // Word-set match (handles word order "MSA & CAF" vs "CAF & MSA" and spacing "FranceTravail" vs "France Travail")
  const nameWords = normalizeWords(filter.name)
  const summaryWords = normalizeWords(summary)
  if (nameWords.length >= 3 && nameWords.every(w => summaryWords.some(sw => sw.includes(w) || w.includes(sw)))) return true

  // Provider-in-path match (disambiguates CIBTP vs CNETP by checking the URL path)
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
