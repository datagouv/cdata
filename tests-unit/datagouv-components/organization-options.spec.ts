import { describe, expect, it, vi } from 'vitest'
import { facetOptions, facetCountById, resolveOrganizationOptions } from '~/datagouv-components/src/functions/organization-options'
import type { FacetItem } from '~/datagouv-components/src/types/search'

const METROPOLE = { name: '534fff7aa3a7292c64a77e0c|Métropole de Lyon', count: 463 }
const BREST = { name: '534fff5ba3a7292c64a77d19|Brest métropole', count: 366 }
const METEO = { name: '534fff8ba3a7292c64a77ed4|Météo-France', count: 48 }
const ALL = { name: 'all', count: 2868 }

const facets = (...items: FacetItem[]): FacetItem[] => items

// Stands in for /api/1/organizations/suggest/, which answers any query, including
// the empty one, and is the only way to reach organizations absent from the facets.
function fakeSuggest(...names: string[]) {
  return vi.fn(async () => names.map(name => ({ id: name, name, image_url: `logo/${name}` })))
}

describe('facetOptions', () => {
  it('turns the facet entries into id, name and count', () => {
    expect(facetOptions(facets(ALL, METROPOLE, METEO))).toEqual([
      { id: '534fff7aa3a7292c64a77e0c', name: 'Métropole de Lyon', count: 463 },
      { id: '534fff8ba3a7292c64a77ed4', name: 'Météo-France', count: 48 },
    ])
  })

  it('keeps the API order, which is ranked by count', () => {
    expect(facetOptions(facets(BREST, METROPOLE)).map(o => o.name)).toEqual(['Brest métropole', 'Métropole de Lyon'])
  })

  it('splits on the first separator only, as organization names contain pipes', () => {
    const pipes = { name: 'aaa|Région | du | Sud', count: 7 }
    expect(facetOptions(facets(pipes))).toEqual([{ id: 'aaa', name: 'Région | du | Sud', count: 7 }])
  })

  it('drops the "all" pseudo entry, which is a total and not an organization', () => {
    expect(facetOptions(facets(ALL))).toEqual([])
  })

  it('drops malformed entries', () => {
    const malformed = [
      { name: 'no-separator', count: 1 },
      { name: '|Missing id', count: 1 },
      { name: 'missing-name|', count: 1 },
    ]
    expect(facetOptions(facets(...malformed))).toEqual([])
  })

  it('returns nothing without facets', () => {
    expect(facetOptions(undefined)).toEqual([])
    expect(facetOptions([])).toEqual([])
  })
})

describe('facetCountById', () => {
  it('maps each organization id to its facet count', () => {
    const byId = facetCountById(facets(ALL, METROPOLE, METEO))
    expect(byId.get('534fff7aa3a7292c64a77e0c')).toBe(463)
    expect(byId.get('534fff8ba3a7292c64a77ed4')).toBe(48)
  })

  it('is empty without facets', () => {
    expect(facetCountById(undefined).size).toBe(0)
    expect(facetCountById(facets(ALL)).size).toBe(0)
  })
})

describe('resolveOrganizationOptions', () => {
  // 'facets-then-suggest', the source proposed on issue #1432: the facet takes
  // over once the results are narrowed, suggest otherwise.
  const MIXED = {
    source: 'facets-then-suggest',
    resultsNarrowed: true,
    facets: facets(ALL, METEO, METROPOLE),
  } as const

  it('offers the counted facets once the results are narrowed down', async () => {
    const suggest = fakeSuggest()
    const options = await resolveOrganizationOptions({ ...MIXED, query: '', suggest })

    expect(options).toEqual([
      { id: '534fff8ba3a7292c64a77ed4', name: 'Météo-France', count: 48 },
      { id: '534fff7aa3a7292c64a77e0c', name: 'Métropole de Lyon', count: 463 },
    ])
    expect(suggest).not.toHaveBeenCalled()
  })

  it('falls back to suggest while nothing narrows the results', async () => {
    const suggest = fakeSuggest('Ministère de l\'intérieur')
    const options = await resolveOrganizationOptions({ ...MIXED, resultsNarrowed: false, query: '', suggest })

    expect(options.map(o => o.name)).toEqual(['Ministère de l\'intérieur'])
    expect(options[0].count).toBeUndefined()
    expect(suggest).toHaveBeenCalledWith('')
  })

  it('goes back to suggest as soon as the user types, since the facet is capped', async () => {
    const suggest = fakeSuggest('Mairie de Trouville')
    const options = await resolveOrganizationOptions({ ...MIXED, query: 'tro', suggest })

    expect(options.map(o => o.name)).toEqual(['Mairie de Trouville'])
    expect(suggest).toHaveBeenCalledWith('tro')
  })

  it('falls back to suggest when the search exposes no organization facet', async () => {
    const suggest = fakeSuggest('Météo-France')
    const options = await resolveOrganizationOptions({ ...MIXED, query: '', facets: undefined, suggest })

    expect(options.map(o => o.name)).toEqual(['Météo-France'])
    expect(suggest).toHaveBeenCalledWith('')
  })

  it('falls back to suggest when the facets are empty, e.g. no result left', async () => {
    const suggest = fakeSuggest('Météo-France')
    const options = await resolveOrganizationOptions({ ...MIXED, query: '', facets: facets({ name: 'all', count: 0 }), suggest })

    expect(options.map(o => o.name)).toEqual(['Météo-France'])
    expect(suggest).toHaveBeenCalledWith('')
  })

  it('backfills the facet count onto suggest results whose id is in the facet', async () => {
    const suggest = fakeSuggest('534fff7aa3a7292c64a77e0c') // id matches METROPOLE
    const options = await resolveOrganizationOptions({
      query: 'lyon',
      source: 'facets-then-suggest',
      resultsNarrowed: true,
      facets: facets(ALL, METROPOLE, METEO),
      suggest,
    })

    expect(options).toEqual([
      { id: '534fff7aa3a7292c64a77e0c', name: '534fff7aa3a7292c64a77e0c', image_url: 'logo/534fff7aa3a7292c64a77e0c', count: 463 },
    ])
  })

  it('leaves suggest results outside the facet without a count', async () => {
    const suggest = fakeSuggest('Mairie de Trouville')
    const options = await resolveOrganizationOptions({
      query: 'tro',
      source: 'facets-then-suggest',
      resultsNarrowed: true,
      facets: facets(ALL, METROPOLE, METEO),
      suggest,
    })

    expect(options[0]).toMatchObject({ name: 'Mairie de Trouville' })
    expect(options[0].count).toBeUndefined()
  })

  it('does not backfill counts while the results are not narrowed', async () => {
    const suggest = fakeSuggest('534fff7aa3a7292c64a77e0c') // id matches METROPOLE
    const options = await resolveOrganizationOptions({
      query: '',
      source: 'facets-then-suggest',
      resultsNarrowed: false,
      facets: facets(ALL, METROPOLE, METEO),
      suggest,
    })

    expect(options[0]).toMatchObject({ id: '534fff7aa3a7292c64a77e0c' })
    expect(options[0].count).toBeUndefined()
  })

  it('keeps the facets untouched whatever the narrowing', async () => {
    const suggest = fakeSuggest()
    const options = await resolveOrganizationOptions({
      query: 'lyon',
      source: 'facets',
      resultsNarrowed: false,
      facets: facets(ALL, METROPOLE, BREST),
      suggest,
    })

    expect(options).toEqual([
      { id: '534fff7aa3a7292c64a77e0c', name: 'Métropole de Lyon', count: 463 },
      { id: '534fff5ba3a7292c64a77d19', name: 'Brest métropole', count: 366 },
    ])
    expect(suggest).not.toHaveBeenCalled()
  })

  it('never uses the facets in the suggest-only source', async () => {
    const suggest = fakeSuggest('Météo-France')
    const options = await resolveOrganizationOptions({
      query: '',
      source: 'suggest',
      resultsNarrowed: true,
      facets: facets(ALL, METEO, METROPOLE),
      suggest,
    })

    expect(options.map(o => o.name)).toEqual(['Météo-France'])
    expect(options[0].count).toBeUndefined()
    expect(suggest).toHaveBeenCalledWith('')
  })
})
