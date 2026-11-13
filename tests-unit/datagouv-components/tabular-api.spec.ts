import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildFilterQuery, fetchTabularData } from '~/datagouv-components/src/functions/tabularApi'
import { conditionOperand, encodeConditionColumn, encodeConditionValue, encodeTabularParam, tabularInList } from '~/datagouv-components/src/functions/tabular'
import type { PluginConfig } from '~/datagouv-components/src/config'
import type { AndFilters, Filter, OrFilters } from '~/datagouv-components/src/types/visualizations'

const { ofetchMock } = vi.hoisted(() => ({ ofetchMock: vi.fn() }))
vi.mock('ofetch', () => ({ ofetch: ofetchMock }))

// Column names checked against api-tabular 0.4.2 and PostgREST; udata sends the same strings.
const COLUMNS = {
  'Nb. habitants': { param: 'Nb.%2520habitants', condition: 'Nb%252E%20habitants' },
  'Taux (en points, 2020)': { param: 'Taux%2520%28en%2520points%252C%25202020%29', condition: 'Taux%20%2528en%20points%252C%202020%2529' },
  'Région': { param: 'R%25C3%25A9gion', condition: 'R%C3%A9gion' },
  'a&b': { param: 'a%2526b', condition: 'a%26b' },
  '50%': { param: '50%2525', condition: '50%2525' },
  '#1': { param: '%25231', condition: '%25231' },
}

function f(column: string, condition: Filter['condition'], value: string | null = 'x'): Filter {
  return { _cls: 'Filter', column, condition, value }
}

describe('buildFilterQuery', () => {
  it('serializes a single exact filter', () => {
    expect(buildFilterQuery(f('region', 'exact', 'Bretagne'))).toBe('region__exact=Bretagne')
  })

  // api-tabular decodes the query string, then PostgREST decodes it again: a value
  // encoded once would cut the query at a `#` or a `&`, or fail on a literal `%XX`.
  it('encodes top-level values twice', () => {
    expect(buildFilterQuery(f('title', 'exact', 'n°1 #2 & 50%25 l\'été'))).toBe(
      'title__exact=n%25C2%25B01%2520%25232%2520%2526%252050%252525%2520l%27%25C3%25A9t%25C3%25A9',
    )
  })

  // udata sends the same top-level filters for the assistant (quote applied twice).
  it.each([
    ['50%E9', '50%2525E9'],
    ['Paris, 1er', 'Paris%252C%25201er'],
    ['Loi (rectificative)', 'Loi%2520%28rectificative%29'],
    ['dit "X"', 'dit%2520%2522X%2522'],
    ['St. Denis', 'St.%2520Denis'],
    ['10.5', '10.5'],
    ['2021-01-01', '2021-01-01'],
    ['l\'été', 'l%27%25C3%25A9t%25C3%25A9'],
    ['#1', '%25231'],
  ])('encodes the top-level value %s like udata', (value, encoded) => {
    expect(buildFilterQuery(f('c', 'exact', value))).toBe(`c__exact=${encoded}`)
  })

  it.each(Object.entries(COLUMNS))('encodes the column name %s of a top-level filter twice', (column, { param }) => {
    expect(buildFilterQuery(f(column, 'exact', '1'))).toBe(`${param}__exact=1`)
    expect(buildFilterQuery(f(column, 'is_null', null))).toBe(`${param}__isnull`)
  })

  it.each(Object.entries(COLUMNS))('encodes the column name %s of a condition like its value, without the quotes', (column, { condition }) => {
    const filters: OrFilters = { _cls: 'OrFilters', filters: [f(column, 'strictly_greater', '1'), f(column, 'is_not_null', null)] }
    expect(buildFilterQuery(filters)).toBe(`or=(${condition}__strictly_greater.%221%22,${condition}__isnotnull)`)
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
    expect(buildFilterQuery(filters)).toBe('a__exact=1&or=(b__exact.%22x%22,c__greater.%222%22)')
  })

  it('serializes a root OrFilters of AndFilters groups (OR between AND groups)', () => {
    const filters: OrFilters = {
      _cls: 'OrFilters',
      filters: [
        { _cls: 'AndFilters', filters: [f('a', 'exact', '1'), f('b', 'exact', '2')] },
        f('c', 'exact', '3'),
      ],
    }
    expect(buildFilterQuery(filters)).toBe('or=(and(a__exact.%221%22,b__exact.%222%22),c__exact.%223%22)')
  })

  it('serializes is_null inside a group without value', () => {
    const filters: OrFilters = { _cls: 'OrFilters', filters: [f('a', 'is_null', null), f('b', 'exact', '1')] }
    expect(buildFilterQuery(filters)).toBe('or=(a__isnull,b__exact.%221%22)')
  })

  it('quotes and escapes the values inside groups', () => {
    const filters: OrFilters = { _cls: 'OrFilters', filters: [f('a', 'exact', '1.5'), f('b', 'exact', 'x(y)')] }
    expect(buildFilterQuery(filters)).toBe('or=(a__exact.%221%252E5%22,b__exact.%22x%2528y%2529%22)')
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

// udata builds the same conditions for the assistant (udata/core/assistant/data_query.py):
// both must send exactly these strings.
describe('encodeConditionValue', () => {
  it.each([
    ['Paris, 1er', '%22Paris%252C%201er%22'],
    ['Loi (rectificative)', '%22Loi%20%2528rectificative%2529%22'],
    ['dit "X"', '%22dit%20%5C%2522X%5C%2522%22'],
    ['St. Denis', '%22St%252E%20Denis%22'],
    ['10.5', '%2210%252E5%22'],
    ['2021-01-01', '%222021-01-01%22'],
    ['l\'été', '%22l\'%C3%A9t%C3%A9%22'],
    ['#1', '%22%25231%22'],
    ['a\\b', '%22a%5C%5Cb%22'],
    ['50%E9', '%2250%2525E9%22'],
  ])('%s → %s', (value, encoded) => {
    expect(encodeConditionValue(value)).toBe(encoded)
  })
})

describe('encodeTabularParam', () => {
  it.each(Object.entries(COLUMNS))('encodes %s like a top-level filter does', (column, { param }) => {
    expect(encodeTabularParam(column)).toBe(param)
  })
})

describe('encodeConditionColumn', () => {
  it.each(Object.entries(COLUMNS))('encodes %s like a condition does', (column, { condition }) => {
    expect(encodeConditionColumn(column)).toBe(condition)
  })
})

describe('conditionOperand', () => {
  // The inner layer of encodeConditionValue: ufo or URLSearchParams add the outer one.
  it.each(['Paris, 1er', 'dit "X"', 'a\\b', '50%E9', 'Nb. habitants', '#1', 'l\'été'])('is %s one URL layer short of encodeConditionValue', (value) => {
    expect(encodeURIComponent(conditionOperand(value))).toBe(encodeConditionValue(value))
  })
})

describe('tabularInList', () => {
  it('quotes each value for PostgREST, escaping its backslashes and quotes', () => {
    expect(tabularInList(['A&B', 'Paris, 1er', 'dit "X"', 'a\\b'])).toBe('"A&B","Paris, 1er","dit \\"X\\"","a\\\\b"')
  })
})

describe('fetchTabularData', () => {
  const config = { tabularApiUrl: 'https://tabular.example.com' } as PluginConfig
  afterEach(() => ofetchMock.mockReset())

  it.each(Object.entries(COLUMNS))('encodes the column name %s twice in columns, sort, groupby and aggregate', async (column, { param }) => {
    await fetchTabularData(config, { resourceId: 'r', columns: [column, 'y'], sort: { column, direction: 'asc' } })
    await fetchTabularData(config, { resourceId: 'r', groupBy: column, aggregation: { column, type: 'sum' } })
    const [raw, aggregated] = ofetchMock.mock.calls.map(call => String(call[0]))
    expect(raw).toContain(`&columns=${param},y&${param}__sort=asc`)
    expect(aggregated).toContain(`&${param}__groupby&${param}__sum`)
  })
})
