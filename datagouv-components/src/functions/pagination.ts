import { useRoute } from 'vue-router'

export function getLink(page: number): string {
  const route = useRoute()
  const routePath = route.path
  const search = new URLSearchParams(route.query as Record<string, string>)
  search.set('page', page.toFixed(0))
  return `${routePath}?${search.toString()}`
}
