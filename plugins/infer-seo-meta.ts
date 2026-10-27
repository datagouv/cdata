import { InferSeoMetaPlugin } from '@unhead/vue/plugins'
import { seoTitleWithFallback } from '~/utils/seo'

export default defineNuxtPlugin(() => {
  const siteTitle = useRuntimeConfig().public.title
  injectHead().use(InferSeoMetaPlugin({
    ogTitle: title => seoTitleWithFallback(title, siteTitle),
  }))
})
