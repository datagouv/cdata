import type { OrganizationReference } from '@datagouv/components-next'

export default defineNuxtRouteMiddleware(async (to, _from) => {
  // console.log(`Calling auth middleware ${from.path} -> ${to.path}`)
  const me = useMaybeMe()

  const requiredOrganizationPermission = to.meta.requiredOrganizationPermission as keyof OrganizationReference['permissions'] ?? ''

  if (to.path !== '/en/login' && !me.value) {
    // console.log('-> redirecting to login…')
    const route = useRoute()
    return navigateTo({ path: '/login', query: { next: route.fullPath } }, { external: true })
  }

  if (requiredOrganizationPermission) {
    const { currentOrganization } = useCurrentOwned()

    if (currentOrganization.value) {
      const permissionValue = currentOrganization.value.permissions[requiredOrganizationPermission]
      if (!permissionValue) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
      }
    }
  }
})
