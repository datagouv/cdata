import type { NuxtApp } from '#app'

export default defineNuxtPlugin({
  async setup(nuxtApp) {
    const config = useRuntimeConfig()
    const token = useToken()
    const cookie = useRequestHeader('cookie')
    const localePath = useLocalePath()
    const { toast } = useToast()
    const makeApi = (sendJson = true) => {
      return $fetch.create({
        baseURL: config.public.apiBase,
        onRequest({ options }) {
          if (sendJson) {
            options.headers.set('Content-Type', 'application/json')
          }
          options.headers.set('Accept', 'application/json')
          options.credentials = 'include'
          if (config.public.devApiKey) {
            options.headers.set('X-API-KEY', config.public.devApiKey)
          }
          if (token.value) {
            options.headers.set('Authentication-Token', token.value)
          }
          if (cookie) {
            options.headers.set('Cookie', cookie)
          }
          const i18n = nuxtApp.$i18n as NuxtApp['$i18n']
          if (i18n.locale.value) {
            if (!options.query) {
              options.query = {}
            }
            options.query['lang'] = i18n.locale.value
          }
        },
        async onResponseError({ response }) {
          if (response.status === 401) {
            await nuxtApp.runWithContext(() => navigateTo(localePath('/login'), { external: true }))
          }

          let message
          try {
            if ('error' in response._data) {
              message = response._data.error
            }
            else if ('message' in response._data) {
              message = response._data.message
            }
            else if ('errors' in response._data && typeof response._data.errors === 'object') {
              message = Object.entries(response._data.errors).map(([key, value]) => `${key}: ${value}`).join(' ; ')
            }
          }
          catch (e) {
            console.error(e)
            message = (nuxtApp.$i18n as NuxtApp['$i18n']).t('The API returned an unexpected error')
          }

          toast.error(message)
        },
      })
    }

    // Expose to useNuxtApp().$api
    return {
      provide: {
        api: makeApi(),
        fileApi: makeApi(false),
      },
    }
  },
})
