import type { Organization, OrganizationReference, User } from '@datagouv/components-next'
import { keyBy } from 'lodash-es'

/**
 * Composable for setters only - can be used in middlewares
 * because it doesn't use useRoute()
 */
export function useCurrentOwnedSetters() {
  const me = useMaybeMe()

  const organizations = useState<Record<string, Organization | OrganizationReference>>('organizations', () => keyBy(me.value?.organizations, org => org.id))
  const users = useState<Record<string, User | Me>>('users', () => (me.value?.id ? { [me.value.id]: me.value } : {}))
  const currentOwnedId = useState<{ organization: string } | { user: string } | null>('currentOrganizationId', () => null)

  const setCurrentOrganization = (organization: Organization | OrganizationReference) => {
    if (currentOwnedId.value && 'organization' in currentOwnedId.value && currentOwnedId.value.organization === organization.id) return
    currentOwnedId.value = { organization: organization.id }
    organizations.value[organization.id] = organization
  }
  const setCurrentUser = (user: User) => {
    if (currentOwnedId.value && 'user' in currentOwnedId.value && currentOwnedId.value.user === user.id) return
    currentOwnedId.value = { user: user.id }
    users.value[user.id] = user
  }

  return { users, organizations, currentOwnedId, setCurrentOrganization, setCurrentUser }
}

export function useCurrentOwned() {
  const { users, organizations, currentOwnedId, setCurrentOrganization, setCurrentUser } = useCurrentOwnedSetters()
  const me = useMaybeMe()
  const route = useRoute()

  const currentOrganization = computed(() => {
    if (route.params.oid) {
      if (Array.isArray(route.params.oid)) throw new Error('oid param cannot be an array')

      currentOwnedId.value = null // fallback to route
      return organizations.value[route.params.oid] || null
    }

    if (!currentOwnedId.value) return null
    if (!('organization' in currentOwnedId.value)) return null

    return organizations.value[currentOwnedId.value.organization] || null
  })

  const currentUser = computed(() => {
    if (route.params.uid) {
      if (Array.isArray(route.params.uid)) throw new Error('uid param cannot be an array')

      currentOwnedId.value = null // fallback to route
      return users.value[route.params.uid] || null
    }

    if (route.fullPath.includes('/admin/me/')) {
      currentOwnedId.value = null // fallback to route
      return me.value
    }

    if (!currentOwnedId.value) return null
    if (!('user' in currentOwnedId.value)) return null

    return users.value[currentOwnedId.value.user] || null
  })

  return { users, organizations, currentOrganization, currentUser, setCurrentOrganization, setCurrentUser }
}
