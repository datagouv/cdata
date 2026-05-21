export default defineNuxtRouteMiddleware(async (to, from) => {
  // When error.vue is displayed, Nuxt keeps it mounted until the error state is
  // cleared (it is NOT cleared automatically on navigation, see nuxt#22683).
  // Following an in-app link (e.g. a SiteHeader link) then triggers an SPA
  // navigation that crashes ("can't access property exposed") because the error
  // tree is still mounted. Clearing the error on a real route change restores
  // the normal app tree.
  // Client-only: the error page is rendered fresh on each SSR request, so there
  // is nothing to clear server-side. The `to !== from` guard keeps the error
  // page rendered on initial load and reload.
  if (import.meta.server) return
  const error = useError()
  if (error.value && to.fullPath !== from.fullPath) {
    await clearError()
  }
})
