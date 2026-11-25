import { InferSeoMetaPlugin } from '@unhead/vue/plugins'

export default defineNuxtPlugin(() => {
  const siteTitle = useRuntimeConfig().public.title
  injectHead().use(InferSeoMetaPlugin({
    ogTitle: title => title || siteTitle,
  }))
})
