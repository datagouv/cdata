export const PAGES_AROUND = 3

function range(size: number, startAt: number) {
  return [...Array(size).keys()].map(i => i + startAt)
}

/**
 * Brings whatever the caller holds as a current page back to a page that exists.
 * The page number usually comes from a query string, so it can be anything:
 * `?page=abc` (NaN), `?page=-5`, `?page=1.5`, or a stale link to a page far past
 * the last one.
 */
export function clampPage(page: number, pageCount: number) {
  if (!Number.isFinite(page)) {
    return 1
  }
  return Math.min(Math.max(Math.trunc(page), 1), Math.max(pageCount, 1))
}

/**
 * The middle window of the pagination: the pages around the current one, with
 * `null` marking an ellipsis. The first and last pages are rendered by the
 * component itself and are never part of this window.
 */
export function getVisiblePages(currentPage: number, pageCount: number) {
  if (pageCount <= 2) {
    return []
  }

  const page = clampPage(currentPage, pageCount)
  const size = Math.min(
    PAGES_AROUND * 2 + 1,
    pageCount - 2, // the first and last pages are rendered outside of the window
    PAGES_AROUND + page - 1, // don't reach below page 2
    PAGES_AROUND + pageCount - page, // don't reach past the last page
  )
  const pagination: Array<number | null> = range(size, Math.max(page - PAGES_AROUND, 2))

  if (!pagination.includes(2)) {
    pagination.unshift(null)
  }
  if (!pagination.includes(pageCount - 1)) {
    pagination.push(null)
  }
  return pagination
}
