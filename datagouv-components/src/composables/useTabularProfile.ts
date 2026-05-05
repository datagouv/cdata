import { computed, inject, provide, ref, toValue, watchEffect, type MaybeRefOrGetter, type Ref } from 'vue'
import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../config'
import type { TabularProfileResponse } from '../components/TabularExplorer/types'

const TABULAR_PROFILE_KEY = Symbol('tabular-profile')

type Status = 'idle' | 'pending' | 'success' | 'error'

export type TabularProfileState = {
  resourceId: Readonly<Ref<string>>
  data: Readonly<Ref<TabularProfileResponse | null>>
  error: Readonly<Ref<unknown | null>>
  status: Readonly<Ref<Status>>
  refresh: () => Promise<void>
}

function createProfileState(resourceId: MaybeRefOrGetter<string>): TabularProfileState {
  const config = useComponentsConfig()
  const data = ref<TabularProfileResponse | null>(null)
  const error = ref<unknown | null>(null)
  const status = ref<Status>('idle')
  const ridRef = computed(() => toValue(resourceId))

  async function refresh() {
    const id = toValue(resourceId)
    if (!id) return
    status.value = 'pending'
    error.value = null
    try {
      data.value = await ofetch<TabularProfileResponse>(
        `${config.tabularApiUrl}/api/resources/${id}/profile/`,
      )
      status.value = 'success'
    }
    catch (e) {
      data.value = null
      error.value = e
      status.value = 'error'
    }
  }

  watchEffect(() => {
    if (toValue(resourceId)) refresh()
  })

  return { resourceId: ridRef, data, error, status, refresh }
}

/**
 * Parent: fetch the tabular profile once and share it with descendants
 * (TabularExplorer, DataStructure...) via provide/inject.
 */
export function provideTabularProfile(resourceId: MaybeRefOrGetter<string>): TabularProfileState {
  const state = createProfileState(resourceId)
  provide(TABULAR_PROFILE_KEY, state)
  return state
}

/**
 * Child: get the tabular profile from an ancestor that called
 * `provideTabularProfile` for the same resourceId. Falls back to
 * fetching on its own if no compatible ancestor is found — preserves
 * standalone usage of TabularExplorer / DataStructure.
 */
export function injectTabularProfile(resourceId: MaybeRefOrGetter<string>): TabularProfileState {
  const injected = inject<TabularProfileState | null>(TABULAR_PROFILE_KEY, null)
  if (injected && injected.resourceId.value === toValue(resourceId)) {
    return injected
  }
  return createProfileState(resourceId)
}
