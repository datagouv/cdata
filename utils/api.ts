import type { Organization, User } from '@datagouv/components-next'
import type { NuxtApp, UseFetchOptions } from 'nuxt/app'
import type { $Fetch } from 'ofetch'
import type { PaginatedArray } from '~/types/types'
/*
  Example : const { data: datasets } = await useAPI<PaginatedArray<Dataset>>('/api/1/datasets')
*/
export async function useAPI<T, U = T>(
  url: MaybeRefOrGetter<string>,
  options?: UseFetchOptions<T, U> & { redirectOn404?: boolean, redirectOnSlug?: string },
) {
  const { setCurrentOrganization, setCurrentUser } = useCurrentOwned()
  const isAdmin = isMeAdmin()
  const route = useRoute()
  // Use below to navigateTo, don't know why navigateTo crash when called outside context.
  // I read something about calling stuff use* after an await in setup (and we have an await
  // for the useFetch())…
  const nuxtApp = useNuxtApp()

  const redirectOn404 = options && 'redirectOn404' in options && options.redirectOn404
  const redirectOnSlug = options && 'redirectOnSlug' in options && options.redirectOnSlug
  const response = await useFetch(url, {
    ...options,
    $fetch: redirectOn404 ? useNuxtApp().$apiWith404 : useNuxtApp().$api,
  })

  const data = toValue(response.data) || {}

  if (redirectOnSlug && redirectOnSlug in route.params && 'slug' in data && route.params[redirectOnSlug] !== data.slug) {
    const newParams = { ...route.params }
    newParams[redirectOnSlug] = data.slug as string

    await nuxtApp.runWithContext(() => navigateTo({ name: route.name, params: newParams, query: route.query, hash: route.hash }, { redirectCode: 301 }))
  }

  if (isAdmin) {
    // Check the response to see if an `organization` or an `owner` is present
    // to add this organization/user to the menu.
    if ('organization' in data && data.organization) {
      setCurrentOrganization(data.organization as Organization)
    }

    if ('owner' in data && data.owner) {
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
}

export function getUserBasedKey(route: string) {
  const me = useMaybeMe()
  return `${me.value ? me.value.id : 'guest'}-${route}`
}

export function getDataFromSSRPayload(key: string, nuxtApp: NuxtApp) {
  return nuxtApp.payload.data[key] ? nuxtApp.payload.data[key] : undefined
}

export function usePostApiWithCsrf() {
  const { $api } = useNuxtApp()

  return async <T>(url: string, body: object): Promise<T> => {
    // See the `get_csrf()` method in `udata`.
    // In Flask, we can get the form with an Accept:application/json to get
    // a valid CSRF token. It's not working in our implementation because for
    // example `GET /login` is routed to `cdata` and not `udata`. Only `POST /login` go
    // to the API. So we've add a new special endpoint to fetch a CSRF token with an URL
    // that is different from cdata URLs.
    // Maybe this endoint could be in `/api/xxx`? Or maybe we need to switch to a better
    // system by switching to API endpoint without CSRF for security endpoints.
    const { response: { csrf_token } } = await $api<{ response: { csrf_token: string } }>('/get-csrf')

    return await $api<T>(url, {
      method: 'POST',
      // Some endpoints do not support CSRFToken inside headers (for exemple /fr/change/), so send it in the body too.
      body: { csrf_token, ...body },
      headers: {
        'X-CSRFToken': csrf_token,
      },
    })
  }
}

export async function apiFetchAll<T>(
  api: $Fetch,
  baseUrl: string,
) {
  /**
     * Wrapper to fetch all paginated data
     */

  const results: T[] = []
  let nextPage: string | null = null

  // Initial query
  let response = await api<PaginatedArray<T>>(baseUrl)
  results.push(...response.data)
  nextPage = response.next_page

  // Pagination
  while (nextPage) {
    response = await api<PaginatedArray<T>>(nextPage)
    results.push(...response.data)
    nextPage = response.next_page
  }

  return results
}
