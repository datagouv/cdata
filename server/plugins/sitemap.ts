// Adding the external sitemap via a nitro plugin hook rather than
// nuxt.config.ts `sitemap.appendSitemaps` because the env var value is only
// available at runtime, not at build time. The `sitemap:index-resolved` hook
// fires on each request, so it picks up the current env var value correctly.
export default defineNitroPlugin((nitroApp) => {
  // @ts-expect-error - The module declares this hook in .mjs but doesn't ship the
  // type augmentation in its .d.ts, so TypeScript can't see it.
  nitroApp.hooks.hook('sitemap:index-resolved', (ctx: { sitemaps: Array<{ sitemap: string }> }) => {
    const url = process.env.NUXT_SITEMAP_INDEX_URL
    if (url) {
      ctx.sitemaps.push({ sitemap: url })
    }
  })
})
