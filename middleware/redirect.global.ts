const UNLOGGED_SECURITY_ROUTES = [
  'login', 'register', 'reset', 'tf-validate',
]

export default defineNuxtRouteMiddleware((to, _from) => {
  // Strip locale prefix and redirect to version without it
  if (to.path.startsWith('/fr/') || to.path.startsWith('/en/') || to.path.startsWith('/es/')) {
    return navigateTo(to.path.slice(3), {
      redirectCode: 308,
    })
  }
  // Strip trailing slash and redirect to version without it
  if (to.path.endsWith('/') && to.path.length > 1) {
    const newPath = to.path.replace(/\/+$/, '')
    return navigateTo(to.fullPath.replace(to.path, newPath), {
      redirectCode: 308,
    })
  }

  const me = useMaybeMe()

  // logged user shouldn't access to login, register, etc. routes
  if (me.value && UNLOGGED_SECURITY_ROUTES.some(route => to.path.startsWith(`/${route}`))) {
    return navigateTo('/')
  }
})
