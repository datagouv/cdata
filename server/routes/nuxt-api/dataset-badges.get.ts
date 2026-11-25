/**
 * Labels of the available dataset badges, keyed by kind. udata builds them from a
 * constant of its source code (`Dataset.available_badges()`), so they only ever
 * change when udata is deployed: an hour of cache costs nothing.
 */
export default cachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  return await $fetch<Record<string, string>>('/api/1/datasets/badges/', { baseURL: config.public.apiBase })
}, { maxAge: 3600, swr: false })
