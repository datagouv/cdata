import { ref, toValue, watchEffect, type ComputedRef, type Ref } from 'vue'
import { ofetch } from 'ofetch'
import { useI18n } from 'vue-i18n'
import { useComponentsConfig } from '../config'
import type { AsyncData, AsyncDataExecuteOptions, AsyncDataRequestStatus, UseFetchOptions } from './api.types'

export async function useFetch<DataT, ErrorT = never>(
  url: string | Request | Ref<string | Request> | ComputedRef<string | null> | (() => string | Request),
  options?: UseFetchOptions<DataT>,
): Promise<AsyncData<DataT, ErrorT>> {
  const config = useComponentsConfig()

  const { t, locale } = useI18n()

  if (config.customUseFetch) {
    return await config.customUseFetch(url, options)
  }

  const data: Ref<DataT | null> = ref(null)
  const error: Ref<ErrorT | null> = ref(null)
  const status = ref<AsyncDataRequestStatus>('idle')

  const execute = async (_opts?: AsyncDataExecuteOptions) => {
    const urlValue = toValue(url)
    if (!urlValue) return
    status.value = 'pending'
    try {
      data.value = await ofetch(urlValue, {
        baseURL: config.apiBase,
        onRequest({ options }) {
          options.headers.set('Content-Type', 'application/json')
          options.headers.set('Accept', 'application/json')
          options.credentials = 'include'
          if (config.devApiKey) {
            options.headers.set('X-API-KEY', config.devApiKey)
          }

          if (locale.value) {
            if (!options.params) {
              options.params = {}
            }
            options.params['lang'] = locale.value
          }
        },
        async onResponseError({ response }) {
          // TODO redirect to login outside Nuxt?
          // if (response.status === 401) {
          //   await nuxtApp.runWithContext(() => navigateTo(localePath('/login')))
          // }

          let message
          try {
            if ('error' in response._data) {
              message = response._data.error
            }
            else if ('message' in response._data) {
              message = response._data.message
            }
          }
          catch (e) {
            console.error(e)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            message = t(`L'API a retourné une erreur inattendue`)
          }

          // TODO Toast outside Nuxt
          // toast.error(message)
        },
        ...options,
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
