import { describe, expect, it } from 'vitest'
import { buildFilterQuery } from '~/datagouv-components/src/functions/tabularApi'
import { encodeConditionValue } from '~/datagouv-components/src/functions/tabular'
import type { AndFilters, Filter, OrFilters } from '~/datagouv-components/src/types/visualizations'

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
