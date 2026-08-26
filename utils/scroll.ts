import type { RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * The sub-routes of a same object (`/datasets/x` → `/datasets/x/discussions`,
 * most often tabs) are one screen: scrolling back to the top on each of them
 * would lose the reader's place. Anything else is a new screen and scrolls to
 * the top, including moving to another object through the same routes
 * (`/datasets/x` → `/datasets/y`).
 *
 * Pass it to `definePageMeta({ scrollToTop })` on the parent page: `to.meta`
 * merges the meta of every matched record, so its children inherit it.
 */
export function keepScrollWithinPage(to: RouteLocationNormalizedLoaded, from: RouteLocationNormalizedLoaded): boolean {
  // The record declaring this function is the page we want to stay on. Looking
  // it up rather than any shared record matters under a layout route such as
  // `/admin`, which every admin page shares without being the same screen.
  const page = to.matched.find(record => record.meta.scrollToTop === keepScrollWithinPage)
  const staysOnTheSamePage = Boolean(page) && from.matched.some(record => record === page)
  const sameObject = Object.keys({ ...to.params, ...from.params })
    .every(name => String(to.params[name]) === String(from.params[name]))

  return !(staysOnTheSamePage && sameObject)
}
