import type { RouterConfig } from '@nuxt/schema'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'

export default <RouterConfig>{
  scrollBehavior(
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    savedPosition: { left: number, top: number } | null,
  ): Promise<ScrollToOptions | false> | ScrollToOptions | false {
    // Return to the scroll position when navigating back (browser default)
    if (savedPosition) return savedPosition

    for (const fromPart of from.matched) {
      for (const toPart of to.matched) {
        if (fromPart.path === toPart.path && fromPart.meta.keepScroll) {
          // We have the same parent and this parent ask to keep scroll between its children
          return false
        }
      }
    }

    // On most pages, navigate to the top of the page it's fine
    return { top: 0 }
  },
}
