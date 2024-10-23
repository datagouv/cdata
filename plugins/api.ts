export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const token = useToken();
    const cookie = useRequestHeader('cookie');

    const api = $fetch.create({
      baseURL: config.public.apiBase,
      onRequest({ options }) {
        options.headers.set('Content-Type', 'application/json')
        options.headers.set('Accept', 'application/json')
        options.credentials = 'include'
        if (token.value) {
          options.headers.set('Authentication-Token', token.value)
        }
        if (cookie) {
          options.headers.set('Cookie', cookie)
        }
      },
      async onResponseError({ response }) {
        if (response.status === 401) {
            await nuxtApp.runWithContext(() => navigateTo('/login'))
        }
      }
    })
  
    // Expose to useNuxtApp().$api
    return {
      provide: {
        api
      }
    }
  })