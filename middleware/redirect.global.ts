export default defineNuxtRouteMiddleware((to, _from) => {
  console.log(to.path)
  if (to.path.startsWith('/fr/') || to.path.startsWith('/en/') || to.path.startsWith('/es/')) {
    return navigateTo(to.path.slice(3), {
      redirectCode: 308,
    })
  }
})
