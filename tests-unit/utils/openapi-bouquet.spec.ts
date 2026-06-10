import { describe, expect, it } from 'vitest'
import type { EndpointProperties } from '~/utils/openapi-extract'
import { filterEndpointsByTitle, unwrapBouquetData } from '~/utils/openapi-bouquet'

function endpoint(summary: string, path = '/v3/things'): EndpointProperties {
  return { path, method: 'get', summary, properties: {} }
}

describe('filterEndpointsByTitle', () => {
  const endpoints = [
    endpoint('Bénéficiaires effectifs d\'une entreprise', '/v3/inpi/rne/beneficiaires'),
    endpoint('Chiffre d\'affaires d\'une entreprise', '/v3/dgfip/chiffre_affaires'),
  ]

  it('returns all endpoints when the title is not a Bouquet title', () => {
    expect(filterEndpointsByTitle(endpoints, undefined)).toEqual(endpoints)
    expect(filterEndpointsByTitle(endpoints, 'API Entreprise')).toEqual(endpoints)
  })

  it('keeps only the matching endpoint, ignoring case and accents', () => {
    const matched = filterEndpointsByTitle(endpoints, 'API Beneficiaires Effectifs | Bouquet API Entreprise')
    expect(matched).toEqual([endpoints[0]])
  })

  it('falls back to all endpoints when nothing matches', () => {
    const matched = filterEndpointsByTitle(endpoints, 'API Tout autre chose | Bouquet API Entreprise')
    expect(matched).toEqual(endpoints)
  })

  it('uses the provider from the title to match via the endpoint path', () => {
    // "chiffre affaires" is not a substring of the summary (the summary has
    // "chiffre d'affaires") and has fewer than 3 words, so neither generic
    // rule matches: only the `- DGFiP` provider present in the path unlocks it.
    const matched = filterEndpointsByTitle(endpoints, 'API Chiffre affaires - DGFiP | Bouquet API Entreprise')
    expect(matched).toEqual([endpoints[1]])
  })
})

describe('unwrapBouquetData', () => {
  it('unwraps a top-level `data` object', () => {
    const [unwrapped] = unwrapBouquetData([{
      ...endpoint('Things'),
      properties: { data: { type: 'object', properties: { id: { type: 'string' } } } },
    }])
    expect(unwrapped.properties).toEqual({ id: { type: 'string' } })
  })

  it('unwraps the double-data array shape', () => {
    const [unwrapped] = unwrapBouquetData([{
      ...endpoint('Things'),
      properties: {
        data: {
          type: 'array',
          items: { properties: { data: { properties: { id: { type: 'string' } } } } },
        },
      },
    }])
    expect(unwrapped.properties).toEqual({ id: { type: 'string' } })
  })

  it('leaves properties without a `data` wrapper untouched', () => {
    const properties = { id: { type: 'string' } }
    const [unwrapped] = unwrapBouquetData([{ ...endpoint('Things'), properties }])
    expect(unwrapped.properties).toEqual(properties)
  })
})
