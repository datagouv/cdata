import { reactive, ref, toValue, watchEffect, type ComputedRef, type Ref } from 'vue'
import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../config'
import { useTranslation } from '../composables/useTranslation'
import type { AsyncData, AsyncDataExecuteOptions, AsyncDataRequestStatus, UseFetchOptions } from './api.types'

export async function useFetch<DataT, ErrorT = never>(
  url: string | Request | Ref<string | Request> | ComputedRef<string | null> | (() => string | Request),
  options?: UseFetchOptions<DataT>,
): Promise<AsyncData<DataT, ErrorT>> {
  const config = useComponentsConfig()

  const { locale } = useTranslation()

  if (config.customUseFetch) {
    return await config.customUseFetch(url, options)
  }

  const data: Ref<DataT | null> = ref(null)
  const error: Ref<ErrorT | null> = ref(null)
  const status = ref<AsyncDataRequestStatus>('idle')

  const execute = async (_opts?: AsyncDataExecuteOptions) => {
    const urlValue = toValue(url)
    if (!urlValue) return
    const fetchOptions = reactive(options ?? {})
    status.value = 'pending'
    try {
      data.value = await ofetch<DataT | null>(urlValue, {
        baseURL: config.apiBase,
        onRequest(param) {
          if (config.onRequest) {
            if (Array.isArray(config.onRequest)) {
              config.onRequest.forEach(r => r(param))
            }
            else {
              config.onRequest(param)
            }
          }
          const { options } = param
          options.headers.set('Content-Type', 'application/json')
          options.headers.set('Accept', 'application/json')
          options.credentials = 'include'
          if (config.devApiKey) {
            options.headers.set('X-API-KEY', config.devApiKey)
          }

          if (locale) {
            if (!options.params) {
              options.params = {}
            }
            options.params['lang'] = locale
          }
        },
        onRequestError: config.onRequestError,
        onResponse: config.onResponse,
        onResponseError: config.onResponseError,
        ...fetchOptions,
      })
      status.value = 'success'
    }
    catch (e) {
      error.value = e as ErrorT
      status.value = 'error'
    }
  }

  watchEffect(async () => {
    await execute()
  })

  return {
    data,
    refresh: async (_opts?: AsyncDataExecuteOptions) => {
      execute()
    },
    execute,
    clear: () => {
      data.value = null
      status.value = 'idle'
    },
    error,
    status,
  }
}
