import { ref, toValue, watchEffect, onMounted, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'
import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../config'
import type { AsyncData, AsyncDataRequestStatus, UseFetchOptions } from './api.types'

function deepToValue(obj: MaybeRefOrGetter<Record<string, unknown> | undefined>): Record<string, unknown> | undefined {
  const val = toValue(obj)
  if (!val || typeof val !== 'object') return val
  return Object.fromEntries(
    Object.entries(val).map(([k, v]) => [k, toValue(v as MaybeRefOrGetter<unknown>)]),
  )
}

export async function useFetch<DataT, ErrorT = never>(
  url: string | Request | Ref<string | Request> | ComputedRef<string | null> | (() => string | Request),
  options?: UseFetchOptions<DataT>,
): Promise<AsyncData<DataT, ErrorT>> {
  const config = useComponentsConfig()

  if (config.customUseFetch) {
    return await config.customUseFetch(url, options)
  }

  const isRaw = options?.raw
  const data: Ref<DataT | null> = ref(null)
  const error: Ref<ErrorT | null> = ref(null)
  const status = ref<AsyncDataRequestStatus>('idle')

  const execute = async (signal?: AbortSignal) => {
    const urlValue = toValue(url)
    if (!urlValue) return
    const params = deepToValue(options?.params)
    const query = deepToValue(options?.query)
    status.value = 'pending'
    try {
      data.value = isRaw
        // Raw targets another data.gouv service (the Tabular API in TabularExplorer) via its own
        // absolute URL, so it must stay bare ofetch: no datagouv apiBase, no datagouv auth attached.
        ? await ofetch<DataT | null>(urlValue, { params: params ?? query, signal })
        // The configured `$fetch` carries baseURL + auth + headers (see the `datagouv` plugin install
        // for the default one). We only forward the URL and params here.
        : await config.$fetch<DataT | null>(urlValue, { baseURL: config.apiBase, params: params ?? query, signal })
      status.value = 'success'
    }
    catch (e) {
      // Ignore aborted requests — they're superseded by a newer call, not a real error.
      if (signal?.aborted) return
      error.value = e as ErrorT
      status.value = 'error'
    }
  }

  // When server is false, only start watching after mount (client-side only)
  if (options?.server === false) {
    onMounted(() => {
      watchEffect((onCleanup) => {
        const controller = new AbortController()
        onCleanup(() => controller.abort())
        void execute(controller.signal)
      })
    })
  }
  else {
    watchEffect((onCleanup) => {
      const controller = new AbortController()
      onCleanup(() => controller.abort())
      void execute(controller.signal)
    })
  }

  return {
    data,
    refresh: () => execute(),
    execute,
    clear: () => {
      data.value = null
      status.value = 'idle'
    },
    error,
    status,
  }
}
