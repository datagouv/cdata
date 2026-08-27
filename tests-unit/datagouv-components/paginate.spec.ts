import { describe, expect, it } from 'vitest'
import { getVisiblePages } from '~/datagouv-components/src/functions/paginate'

// Expected values are derived from the UI spec, not from the implementation:
// the component renders page 1 and the last page itself, `getVisiblePages`
// returns the middle window (3 pages around the current one, never below 2)
// with `null` marking an ellipsis when page 2 or page `pageCount - 1` is not
// part of the window.
describe('getVisiblePages', () => {
  it('returns no middle pages when there are 2 pages or fewer', () => {
    expect(getVisiblePages(1, 1)).toEqual([])
    expect(getVisiblePages(1, 2)).toEqual([])
    expect(getVisiblePages(2, 2)).toEqual([])
  })

  it('returns the only middle page for 3 pages', () => {
    expect(getVisiblePages(1, 3)).toEqual([2])
    expect(getVisiblePages(2, 3)).toEqual([2])
    expect(getVisiblePages(3, 3)).toEqual([2])
  })

  it('adds a trailing ellipsis when on the first page of many', () => {
    expect(getVisiblePages(1, 10)).toEqual([2, 3, 4, null])
  })

  it('shows the full window without leading ellipsis when near the start', () => {
    expect(getVisiblePages(4, 10)).toEqual([2, 3, 4, 5, 6, 7, null])
  })

  it('shows 3 pages around the current page in the middle', () => {
    expect(getVisiblePages(5, 10)).toEqual([2, 3, 4, 5, 6, 7, 8, null])
  })

  it('adds a leading ellipsis when on the last page', () => {
    expect(getVisiblePages(10, 10)).toEqual([null, 7, 8, 9])
  })

  it('adds ellipses on both sides deep inside a large set', () => {
    expect(getVisiblePages(50, 100)).toEqual([null, 47, 48, 49, 50, 51, 52, 53, null])
  })

  it('never adds ellipses when the window touches both boundaries', () => {
    expect(getVisiblePages(2, 4)).toEqual([2, 3])
  })

  // The current page comes from `?page=`, so it can be anything a crawler or a
  // stale link carries. Every case below used to build an array of negative or
  // NaN length, throwing `RangeError: Invalid array length` and taking the whole
  // SSR render down with a 500.
  describe('with a current page that does not exist', () => {
    it('falls back to the last page when the current page is past the end', () => {
      expect(getVisiblePages(127, 18)).toEqual(getVisiblePages(18, 18))
      expect(getVisiblePages(19, 18)).toEqual(getVisiblePages(18, 18))
    })

    it('falls back to the first page when the current page is not a number', () => {
      expect(getVisiblePages(Number('abc'), 10)).toEqual(getVisiblePages(1, 10))
    })

    it('falls back to the first page when the current page is below 1', () => {
      expect(getVisiblePages(0, 10)).toEqual(getVisiblePages(1, 10))
      expect(getVisiblePages(-5, 10)).toEqual(getVisiblePages(1, 10))
    })

    it('truncates a fractional current page', () => {
      expect(getVisiblePages(5.7, 10)).toEqual(getVisiblePages(5, 10))
    })
  })
})
