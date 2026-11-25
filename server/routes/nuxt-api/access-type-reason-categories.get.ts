export type ReasonCategory = {
  value: string
  label: string
  definition: string
}

/**
 * Categories a dataset can give as a reason for restricting its access. udata
 * builds them from the `InspireLimitationCategory` enum of its source code, so
 * they only ever change when udata is deployed: an hour of cache costs nothing.
 */
export default cachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  return await $fetch<Array<ReasonCategory>>('/api/1/access_type/reason_categories/', { baseURL: config.public.apiBase })
}, { maxAge: 3600, swr: false })
