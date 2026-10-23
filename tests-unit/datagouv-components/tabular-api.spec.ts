import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildFilterQuery, ensureRowLimit, executeSqlQuery } from '~/datagouv-components/src/functions/tabularApi'
import type { AndFilters, Filter, OrFilters } from '~/datagouv-components/src/types/visualizations'

function f(column: string, condition: Filter['condition'], value: string | null = 'x'): Filter {
  return { _cls: 'Filter', column, condition, value }
}

describe('buildFilterQuery', () => {
  it('serializes a single exact filter', () => {
    expect(buildFilterQuery(f('region', 'exact', 'Bretagne'))).toBe('region__exact=Bretagne')
  })

  it('serializes is_null / is_not_null without value', () => {
    expect(buildFilterQuery(f('region', 'is_null', null))).toBe('region__isnull')
    expect(buildFilterQuery(f('region', 'is_not_null', null))).toBe('region__isnotnull')
  })

  it('skips filters with an empty value', () => {
    const filters: AndFilters = { _cls: 'AndFilters', filters: [f('a', 'exact', ''), f('b', 'exact', '2')] }
    expect(buildFilterQuery(filters)).toBe('b__exact=2')
  })

  it('serializes a flat AndFilters as &-joined params', () => {
    const filters: AndFilters = { _cls: 'AndFilters', filters: [f('a', 'exact', '1'), f('b', 'strictly_greater', '2')] }
    expect(buildFilterQuery(filters)).toBe('a__exact=1&b__strictly_greater=2')
  })

  it('serializes an OrFilters group inside AndFilters as an or=(...) param (AND between OR groups)', () => {
    const filters: AndFilters = {
      _cls: 'AndFilters',
      filters: [
        f('a', 'exact', '1'),
        { _cls: 'OrFilters', filters: [f('b', 'exact', 'x'), f('c', 'greater', '2')] },
      ],
    }
    expect(buildFilterQuery(filters)).toBe('a__exact=1&or=(b__exact.x,c__greater.2)')
  })

  it('serializes a root OrFilters of AndFilters groups (OR between AND groups)', () => {
    const filters: OrFilters = {
      _cls: 'OrFilters',
      filters: [
        { _cls: 'AndFilters', filters: [f('a', 'exact', '1'), f('b', 'exact', '2')] },
        f('c', 'exact', '3'),
      ],
    }
    expect(buildFilterQuery(filters)).toBe('or=(and(a__exact.1,b__exact.2),c__exact.3)')
  })

  it('serializes is_null inside a group without value', () => {
    const filters: OrFilters = { _cls: 'OrFilters', filters: [f('a', 'is_null', null), f('b', 'exact', '1')] }
    expect(buildFilterQuery(filters)).toBe('or=(a__isnull,b__exact.1)')
  })

  it('escapes dots and parens in values inside groups', () => {
    const filters: OrFilters = { _cls: 'OrFilters', filters: [f('a', 'exact', '1.5'), f('b', 'exact', 'x(y)')] }
    expect(buildFilterQuery(filters)).toBe('or=(a__exact.1%252E5,b__exact.x%2528y%2529)')
  })

  it('drops groups whose conditions are all empty', () => {
    const filters: AndFilters = {
      _cls: 'AndFilters',
      filters: [
        f('a', 'exact', '1'),
        { _cls: 'OrFilters', filters: [f('b', 'exact', '')] },
      ],
    }
    expect(buildFilterQuery(filters)).toBe('a__exact=1')
  })
})

describe('ensureRowLimit', () => {
  it('appends a default LIMIT 1000 when the query has none', () => {
    expect(ensureRowLimit('SELECT * FROM table')).toBe('SELECT * FROM table LIMIT 1000')
  })

  it('appends the given limit when the query has none', () => {
    expect(ensureRowLimit('SELECT * FROM table', 50)).toBe('SELECT * FROM table LIMIT 50')
  })

  it('does not append a LIMIT when one is already present', () => {
    const query = 'SELECT * FROM table LIMIT 10'
    expect(ensureRowLimit(query)).toBe(query)
  })

  it('detects an existing lowercase limit', () => {
    const query = 'select * from table limit 50'
    expect(ensureRowLimit(query)).toBe(query)
  })

  it('inserts the LIMIT before a trailing semicolon', () => {
    expect(ensureRowLimit('SELECT * FROM table;')).toBe('SELECT * FROM table LIMIT 1000;')
  })

  it('appends a LIMIT when "limit" only appears inside a string literal', () => {
    expect(ensureRowLimit(`SELECT * FROM table WHERE note = 'pas de limit ici'`))
      .toBe(`SELECT * FROM table WHERE note = 'pas de limit ici' LIMIT 1000`)
  })
})

describe('executeSqlQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubFetch(response: Response) {
    const calls: Array<{ url: string, method: string, body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      calls.push({ url: request.url, method: request.method, body: JSON.parse(await request.text()) })
      return response
    }))
    return calls
  }

  it('posts the query to the resource SQL endpoint', async () => {
    const calls = stubFetch(new Response(JSON.stringify({ columns: ['a'], rows: [[1]] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    const result = await executeSqlQuery('https://tabular.example.com', 'rid-1', 'SELECT 1')

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('https://tabular.example.com/api/resources/rid-1/sql')
    expect(calls[0].method).toBe('POST')
    expect(calls[0].body).toEqual({ query: 'SELECT 1' })
    expect(result).toEqual({ columns: ['a'], rows: [[1]] })
  })

  it('raises a French error when the endpoint fails', async () => {
    stubFetch(new Response('Server error', { status: 500 }))

    await expect(executeSqlQuery('https://tabular.example.com', 'rid-1', 'SELECT 1'))
      .rejects.toThrowError(/L'exécution de la requête a échoué/)
  })
})
