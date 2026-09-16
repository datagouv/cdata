import { describe, expect, it } from 'vitest'
import { buildFilterQuery } from '~/datagouv-components/src/functions/tabularApi'
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
