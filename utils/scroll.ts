import type { RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * The tabs of a same object (`/datasets/x` → `/datasets/x/discussions`) are one
 * screen: scrolling back to the top on each tab change would lose the reader's
 * place. Anything else is a new screen and scrolls to the top, including moving
 * to another object through the same routes (`/datasets/x` → `/datasets/y`).
 *
 * Pass it to `definePageMeta({ scrollToTop })` on the page holding the tabs:
 * `to.meta` merges the meta of every matched record, so its children inherit it.
 */
export function keepScrollBetweenTabs(to: RouteLocationNormalizedLoaded, from: RouteLocationNormalizedLoaded): boolean {
  // The record declaring this function is the page holding the tabs. Looking it
  // up rather than any shared record matters under a layout route such as
  // `/admin`, which every admin page shares without being tabs of each other.
  const tabsRoot = to.matched.find(record => record.meta.scrollToTop === keepScrollBetweenTabs)
  const staysOnTheSamePage = Boolean(tabsRoot) && from.matched.some(record => record === tabsRoot)
  const sameObject = Object.keys({ ...to.params, ...from.params })
    .every(name => String(to.params[name]) === String(from.params[name]))

  return !(staysOnTheSamePage && sameObject)
}
