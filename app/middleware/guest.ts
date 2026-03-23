export default defineNuxtRouteMiddleware(async (to, _from) => {
  // console.log(`Calling guest middleware ${from.path} -> ${to.path}`)
  const me = useMaybeMe()

  if (to.path !== '/en/admin' && me.value) {
    // console.log('-> redirecting to new admin…')
    return navigateTo('/admin')
  }
})
