import { describe, expect, it } from 'vitest'
import { toSuggestions } from '~/utils/search'

const dataset = { id: 'd1', title: 'Population', acronym: '', slug: 'population', image_url: null, page: 'https://www.data.gouv.fr/datasets/population' }
const dataservice = { id: 's1', title: 'API Géo', acronym: null, slug: 'api-geo', page: 'https://www.data.gouv.fr/dataservices/api-geo' }
const reuse = { id: 'r1', title: 'Carte', slug: 'carte', image_url: 'https://example.org/carte.png', page: 'https://www.data.gouv.fr/reuses/carte' }
const organization = { id: 'o1', name: 'Institut national', acronym: 'INSEE', slug: 'insee', image_url: 'https://example.org/insee.png' }

describe('toSuggestions', () => {
  it('returns nothing for empty inputs', () => {
    expect(toSuggestions({})).toEqual([])
    expect(toSuggestions({ datasets: [], dataservices: [], reuses: [], organizations: [] })).toEqual([])
  })

  it('orders datasets, then dataservices, reuses and organizations', () => {
    const kinds = toSuggestions({ organizations: [organization], reuses: [reuse], dataservices: [dataservice], datasets: [dataset] }).map(s => s.kind)
    expect(kinds).toEqual(['dataset', 'dataservice', 'reuse', 'organization'])
  })

  it('links to internal pages by slug, never to the absolute page URL', () => {
    const paths = toSuggestions({ datasets: [dataset], dataservices: [dataservice], reuses: [reuse], organizations: [organization] }).map(s => s.to)
    expect(paths).toEqual(['/datasets/population', '/dataservices/api-geo', '/reuses/carte', '/organizations/insee'])
  })

  it('appends the acronym to the label when present', () => {
    expect(toSuggestions({ organizations: [organization] })[0].label).toEqual('Institut national (INSEE)')
    expect(toSuggestions({ organizations: [{ ...organization, acronym: null }] })[0].label).toEqual('Institut national')
    expect(toSuggestions({ datasets: [{ ...dataset, acronym: 'POP' }] })[0].label).toEqual('Population (POP)')
    expect(toSuggestions({ datasets: [dataset] })[0].label).toEqual('Population')
    expect(toSuggestions({ dataservices: [{ ...dataservice, acronym: 'GEO' }] })[0].label).toEqual('API Géo (GEO)')
    expect(toSuggestions({ dataservices: [dataservice] })[0].label).toEqual('API Géo')
  })
})
