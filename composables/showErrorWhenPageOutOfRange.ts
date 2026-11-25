// A listing page whose `?page=` does not exist must answer a 404: crawlers follow
// stale links to pages that were valid when the listing was shorter, and serving an
// empty listing with a 200 is a soft 404 they keep coming back to.
//
// Called with plain values right after the listing has been fetched, so the error is
// set while the page is still being set up and Nitro can turn it into a 404. A watcher
// would run before the fetch resolves and never run again on the server.
export function showErrorWhenPageOutOfRange(page: number, pageSize: number, total: number | undefined) {
  // The listing failed to load: a malformed page number can still be rejected, but
  // there is no page count to compare it against.
  const pageCount = total === undefined ? Infinity : Math.max(Math.ceil(total / pageSize), 1)

  if (!Number.isInteger(page) || page < 1 || page > pageCount) {
    // Use `showError`, not `throw createError`: throwing rejects the async setup,
    // see the detailed explanation in pages/pages/[...slug].vue.
    showError({ statusCode: 404, statusMessage: 'Page Not Found' })
  }
}
