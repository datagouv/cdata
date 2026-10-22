import { InferSeoMetaPlugin } from '@unhead/vue/plugins'

// Derive og:title/og:description from each page's title/description instead of
// repeating them per page.
export default defineNuxtPlugin(() => {
  injectHead().use(InferSeoMetaPlugin())
})
