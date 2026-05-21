export default defineNuxtRouteMiddleware((to, from) => {
  // When error.vue is displayed, Nuxt keeps it mounted until the error state is
  // cleared (it is NOT cleared automatically on navigation, see nuxt#22683).
  // Following an in-app link then crashes/blanks the page because the error tree
  // is still mounted.
  // We must NOT clear synchronously here: doing so re-renders the *current*
  // (errored) route before the navigation commits, which re-mounts the page and
  // re-runs its failing useFetch (see nuxt#27410). Instead, defer the clear until
  // the navigation has committed to `to`, so the error tree is gone and the
  // target page renders cleanly.
  // Client-only: the error page is rendered fresh on each SSR request. The
  // `to !== from` guard, plus only registering when an error is already present,
  // keeps the error page rendered on initial load and reload.
  if (import.meta.server) return
  const error = useError()
  if (!error.value || to.fullPath === from.fullPath) return

  const router = useRouter()
  const stop = router.afterEach(() => {
    stop()
    clearError()
  })
})
