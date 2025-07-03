import type { Organization, User } from '@datagouv/components-next'

export type Me = User & {
  about: string | null
  active: boolean
  apikey: string | null
  email: string
  metrics: {
    datasets: number
    followers: number
    following: number
    reuses: number
  }
  organizations: Array<Organization>
  since: string
  website: string
}

export const useMe = (): Ref<Me> => {
  return useMaybeMe() as Ref<Me> // TODO redirect
}

export const useMaybeMe = () => {
  return useState<Me | null | undefined>('me', () => undefined)
}

export const useToken = () => {
  return useCookie('token', {
    secure: true,
    sameSite: true,
  })
}

export function isAdmin(me: Me | null | undefined): boolean {
  if (!me) return false

  return me.roles ? me.roles.includes('admin') : false
}

export function isMeAdmin(): boolean {
  const me = useMaybeMe()
  return isAdmin(me.value)
}

export const loadMe = async (meState: Ref<Me | null | undefined>) => {
  // Here we cannot use the `useAPI` composable because
  // we don't want the classic error management that redirect
  // to the login page when a 401 is raised. So we must manually
  // re-configured the baseURL.
  const config = useRuntimeConfig()
  const cookie = useRequestHeader('cookie')

  const token = useToken()

  const headers: Record<string, string> = {}

  if (cookie) {
    // console.log('Cookie is set to ' + cookie)
    headers['cookie'] = cookie
  }
  if (token.value) {
    // console.log('Token is set to ' + token.value)
    headers['Authentication-Token'] = token.value
  }
  if (config.public.devApiKey) {
    headers['X-API-KEY'] = config.public.devApiKey
  }

  try {
    meState.value = await $fetch<Me | null>('/api/1/me/', {
      baseURL: config.public.apiBase,
      credentials: 'include',
      headers,
    })
  }
  catch {
    meState.value = null
  }
}
