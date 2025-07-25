import type { NuxtApp } from '#app'

export default defineNuxtPlugin({
  async setup(nuxtApp) {
    const config = useRuntimeConfig()
    const token = useToken()
    const cookie = useRequestHeader('cookie')
    const localePath = useLocalePath()
    const route = useRoute()

    const { toast } = useToast()
    const makeApi = (apiOptions: { sendJson: boolean, redirectOn404: boolean }) => {
      return $fetch.create({
        baseURL: config.public.apiBase,
        onRequest({ options }) {
          if (apiOptions.sendJson) {
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
        async onResponseError({ response, options }) {
          if (response.status === 404) {
            if (apiOptions.redirectOn404) {
              showError({ statusCode: 404, statusMessage: 'Page Not Found' })
            }
            else {
              // We don't want to show the toast for default 404 Flask response
              return
            }
          }

          if (response.status === 401) {
            await nuxtApp.runWithContext(() => navigateTo(localePath({ path: '/login', query: { next: route.fullPath } }), { external: true }))
          }

          const t = (nuxtApp.$i18n as NuxtApp['$i18n']).t

          if (response.status === 429) {
            toast.error(t('Erreur API 429 : trop de requêtes. Veuillez réessayer plus tard.'))
            return
          }

          if (response.status === 403) {
            toast.error(t('Erreur API 403 : accès interdit.'))
            return
          }

          let message = ''
          if (response._data) {
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
            }
          }

          if (options?.method && ['POST', 'PUT', 'PATCH'].includes(options.method) && response.status === 400) {
            toast.error(t(`Le formulaire contient des erreurs. ${message}`))
            return
          }

          if (message) {
            toast.error(message)
          }
          else {
            toast.error(t(`L'API a retourné une erreur inattendue`))
          }
        },
      })
    }

    // Expose to useNuxtApp().$api
    return {
      provide: {
        api: makeApi({ sendJson: true, redirectOn404: false }),
        fileApi: makeApi({ sendJson: false, redirectOn404: false }),
        apiWith404: makeApi({ sendJson: true, redirectOn404: true }),
      },
    }
  },
})
