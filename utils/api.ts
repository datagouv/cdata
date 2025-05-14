import type { Organization, User } from '@datagouv/components-next'
import type { NuxtApp, UseFetchOptions } from 'nuxt/app'
/*
  Example : const { data: datasets } = await useAPI<PaginatedArray<Dataset>>('/api/1/datasets')
*/
export function useAPI<T, U = T>(
  url: MaybeRefOrGetter<string>,
  options?: UseFetchOptions<T, U>,
) {
  const { setCurrentOrganization, setCurrentUser } = useCurrentOwned()
  const isAdmin = isMeAdmin()
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api,
  })
    .then((response) => {
      if (isAdmin) {
        // Check the response to see if an `organization` or an `owner` is present
        // to add this organization/user to the menu.
        const data = toValue(response.data)
        if (data && typeof data === 'object' && 'organization' in data && data.organization) {
          setCurrentOrganization(data.organization as Organization)
        }

        if (data && typeof data === 'object' && 'owner' in data && data.owner) {
          setCurrentUser(data.owner as User)
        }
      }

      // This allow to remove the `null` variant from `useFetch`
      // response. I think the `null` variant is here for `DELETE`
      // responses (without body) but in our case this helper is intended
      // to be used only for `GET` requests. We need to use $fetch for
      // the others HTTP methods.
      // TODO: add a check at the beginning of this function to prevent
      // miss-use of this function (calling it with other methods)
      return { ...response, data: response.data as Ref<T> }
    })
}

export function getUserBasedKey(route: string) {
  const me = useMaybeMe()
  return `${me.value ? me.value.id : 'guest'}-${route}`
}

export function getDataFromSSRPayload(key: string, nuxtApp: NuxtApp) {
  return nuxtApp.payload.data[key] ? nuxtApp.payload.data[key] : undefined
}
