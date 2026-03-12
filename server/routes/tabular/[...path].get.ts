import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const qs = new URLSearchParams(query as Record<string, string>).toString()
  const url = `${config.public.tabularApiUrl}/api/${path}/${qs ? `?${qs}` : ''}`
  return ofetch(url)
})
