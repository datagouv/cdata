import type { RouteLocationRaw } from 'vue-router'

export function useBreadcrumbs() {
  return useState<Array<string | RouteLocationRaw | null>>('breadcrumbs', () => ([]))
}

export function useSidebarLinks() {
  return useState<Record<string, RouteLocationRaw>>('sidebarLinks', () => ({}))
}
