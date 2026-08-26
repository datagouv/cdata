import type { Ref } from 'vue'

// A listing page whose `?page=` does not exist must answer a 404: crawlers follow
// stale links to pages that were valid when the listing was longer, and rendering
// an empty listing with a 200 is a soft 404 they keep coming back to.
export function useNotFoundWhenPageOutOfRange(page: Ref<number>, pageSize: number, total: () => number | undefined) {
  watchEffect(() => {
    const totalResults = total()
    // The total is unknown until the listing has been fetched: only the malformed
    // page numbers can be rejected at that point.
    const pageCount = totalResults === undefined ? Infinity : Math.max(Math.ceil(totalResults / pageSize), 1)

    if (!Number.isInteger(page.value) || page.value < 1 || page.value > pageCount) {
      // Use `showError`, not `throw createError`: throwing rejects the async setup,
      // see the detailed explanation in pages/pages/[...slug].vue.
      showError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }
  })
}
