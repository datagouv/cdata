import { describe, expect, it } from 'vitest'
import { fromFilterGroups, toFilterGroups } from '~/utils/chartFilters'
import type { AndFilters, Filter, OrFilters } from '~/datagouv-components/src/types/visualizations'

const f = (column: string, value = '1'): Filter => ({ _cls: 'Filter', column, condition: 'exact', value })

describe('toFilterGroups', () => {
  it('maps null to an empty state with an or root', () => {
    expect(toFilterGroups(null)).toEqual({ rootCombinator: 'or', groups: [] })
  })

  it('maps a single filter to a one-condition group', () => {
    expect(toFilterGroups(f('a'))).toEqual({ rootCombinator: 'or', groups: [[f('a')]] })
  })

  it('maps a flat AndFilters to a single and-group under an or root', () => {
    const tree: AndFilters = { _cls: 'AndFilters', filters: [f('a'), f('b')] }
    expect(toFilterGroups(tree)).toEqual({ rootCombinator: 'or', groups: [[f('a'), f('b')]] })
  })

  it('maps a flat OrFilters to a single or-group under an and root', () => {
    const tree: OrFilters = { _cls: 'OrFilters', filters: [f('a'), f('b')] }
    expect(toFilterGroups(tree)).toEqual({ rootCombinator: 'and', groups: [[f('a'), f('b')]] })
  })

  it('maps AndFilters of OrFilters to or-groups under an and root', () => {
    const tree: AndFilters = {
      _cls: 'AndFilters',
      filters: [f('a'), { _cls: 'OrFilters', filters: [f('b'), f('c')] }],
    }
    expect(toFilterGroups(tree)).toEqual({ rootCombinator: 'and', groups: [[f('a')], [f('b'), f('c')]] })
  })

  it('maps OrFilters of AndFilters to and-groups under an or root', () => {
    const tree: OrFilters = {
      _cls: 'OrFilters',
      filters: [{ _cls: 'AndFilters', filters: [f('a'), f('b')] }, f('c')],
    }
    expect(toFilterGroups(tree)).toEqual({ rootCombinator: 'or', groups: [[f('a'), f('b')], [f('c')]] })
  })
})

describe('fromFilterGroups', () => {
  it('maps an empty state to null', () => {
    expect(fromFilterGroups({ rootCombinator: 'and', groups: [] })).toBeNull()
  })

  it('drops empty groups', () => {
    expect(fromFilterGroups({ rootCombinator: 'and', groups: [[], [f('a')]] })).toEqual(f('a'))
  })

  it('collapses a single-condition group to a bare filter', () => {
    expect(fromFilterGroups({ rootCombinator: 'or', groups: [[f('a')]] })).toEqual(f('a'))
  })

  it('wraps a single multi-condition group without a root wrapper', () => {
    expect(fromFilterGroups({ rootCombinator: 'and', groups: [[f('a'), f('b')]] }))
      .toEqual({ _cls: 'OrFilters', filters: [f('a'), f('b')] })
    expect(fromFilterGroups({ rootCombinator: 'or', groups: [[f('a'), f('b')]] }))
      .toEqual({ _cls: 'AndFilters', filters: [f('a'), f('b')] })
  })

  it('builds an AndFilters root of OrFilters groups', () => {
    expect(fromFilterGroups({ rootCombinator: 'and', groups: [[f('a')], [f('b'), f('c')]] }))
      .toEqual({ _cls: 'AndFilters', filters: [f('a'), { _cls: 'OrFilters', filters: [f('b'), f('c')] }] })
  })

  it('builds an OrFilters root of AndFilters groups', () => {
    expect(fromFilterGroups({ rootCombinator: 'or', groups: [[f('a'), f('b')], [f('c')]] }))
      .toEqual({ _cls: 'OrFilters', filters: [{ _cls: 'AndFilters', filters: [f('a'), f('b')] }, f('c')] })
  })
})

describe('round-trip', () => {
  it('toFilterGroups ∘ fromFilterGroups preserves the state', () => {
    const state = { rootCombinator: 'or' as const, groups: [[f('a'), f('b')], [f('c')]] }
    expect(toFilterGroups(fromFilterGroups(state))).toEqual(state)
  })

  it('preserves a single multi-condition group (no spurious split into groups)', () => {
    const state = { rootCombinator: 'or' as const, groups: [[f('a'), f('b')]] }
    expect(toFilterGroups(fromFilterGroups(state))).toEqual(state)
  })

  it('preserves a flipped single multi-condition group', () => {
    const state = { rootCombinator: 'and' as const, groups: [[f('a'), f('b')]] }
    expect(toFilterGroups(fromFilterGroups(state))).toEqual(state)
  })
})
