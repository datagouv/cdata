import { describe, expect, it } from 'vitest'
import type { ColumnFilters } from '~/datagouv-components/src/components/TabularExplorer/types'
import { hasFilterForColumn } from '~/datagouv-components/src/functions/tabular'

const has = (filter?: ColumnFilters) => hasFilterForColumn(filter ? { price: filter } : {}, 'price')

describe('hasFilterForColumn', () => {
  it('is false without any filter for the column', () => {
    expect(has()).toBe(false)
    expect(has({})).toBe(false)
    expect(has({ in: [] })).toBe(false)
  })

  it('counts zero as an active min/max bound', () => {
    // `0` is a meaningful bound: detection must use `!= null`, not truthiness
    expect(has({ min: 0 })).toBe(true)
    expect(has({ max: 0 })).toBe(true)
  })

  it('counts an empty exact filter as active, unlike contains', () => {
    // `exact` uses `!= null` (filtering on the empty value is meaningful),
    // `contains` uses truthiness (an empty needle filters nothing)
    expect(has({ exact: '' })).toBe(true)
  })

  it('detects the other filter kinds', () => {
    expect(has({ in: ['a'] })).toBe(true)
    expect(has({ contains: 'needle' })).toBe(true)
    expect(has({ null: 'only' })).toBe(true)
  })

  it('ignores an empty contains filter', () => {
    expect(has({ contains: '' })).toBe(false)
  })
})
