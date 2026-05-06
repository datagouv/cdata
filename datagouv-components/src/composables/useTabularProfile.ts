import { computed, inject, provide, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import { useComponentsConfig } from '../config'
import { useFetch } from '../functions/api'
import type { AsyncDataRequestStatus } from '../functions/api.types'
import type { TabularProfileResponse } from '../components/TabularExplorer/types'

const TABULAR_PROFILE_KEY = Symbol('tabular-profile')

export type TabularProfileState = {
  resourceId: Readonly<Ref<string>>
  data: Readonly<Ref<TabularProfileResponse | null>>
  error: Readonly<Ref<unknown | null>>
  status: Readonly<Ref<AsyncDataRequestStatus>>
  refresh: () => Promise<void>
}

async function createProfileState(resourceId: MaybeRefOrGetter<string>): Promise<TabularProfileState> {
  const config = useComponentsConfig()
  const ridRef = computed(() => toValue(resourceId))

  // Goes through the package's useFetch, which delegates to the host's
  // customUseFetch (Nuxt useFetch in cdata) so the response is shared
  // between SSR and CSR via the Nuxt payload — avoiding a double fetch.
  const profileUrl = computed(() =>
    ridRef.value ? `${config.tabularApiUrl}/api/resources/${ridRef.value}/profile/` : null,
  )

  const { data, error, status, refresh } = await useFetch<TabularProfileResponse>(profileUrl, { raw: true })

  return { resourceId: ridRef, data, error, status, refresh }
}

/**
 * Parent: fetch the tabular profile once and share it with descendants
 * (TabularExplorer, DataStructure...) via provide/inject.
 */
export async function provideTabularProfile(resourceId: MaybeRefOrGetter<string>): Promise<TabularProfileState> {
  const state = await createProfileState(resourceId)
  provide(TABULAR_PROFILE_KEY, state)
  return state
}

/**
 * Child: get the tabular profile from an ancestor that called
 * `provideTabularProfile` for the same resourceId. Falls back to
 * fetching on its own if no compatible ancestor is found — preserves
 * standalone usage of TabularExplorer / DataStructure.
 */
export async function injectTabularProfile(resourceId: MaybeRefOrGetter<string>): Promise<TabularProfileState> {
  const injected = inject<TabularProfileState | null>(TABULAR_PROFILE_KEY, null)
  if (injected && injected.resourceId.value === toValue(resourceId)) {
    return injected
  }
  return await createProfileState(resourceId)
}
