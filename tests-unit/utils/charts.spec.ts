import { describe, expect, it } from 'vitest'
import { keepValidSortCombined } from '~/utils/charts'

describe('keepValidSortCombined', () => {
  it('returns empty string when current sort is empty', () => {
    expect(keepValidSortCombined('', ['axis_x-asc', 'axis_x-desc'])).toBe('')
  })

  it('preserves a sort value that is still available', () => {
    expect(keepValidSortCombined('axis_x-asc', ['axis_x-asc', 'axis_x-desc'])).toBe('axis_x-asc')
  })

  it('resets to empty string when the sort value is no longer available', () => {
    expect(keepValidSortCombined('axis_y-asc', ['axis_x-asc', 'axis_x-desc'])).toBe('')
  })
})
