import { useRouteQuery } from '@vueuse/router'

export function useRouteQueryBoolean(name: string) {
  return useRouteQuery<string | undefined, boolean | undefined>(name, undefined, {
    transform: {
      get: v => v === 'true' ? true : v === 'false' ? false : undefined,
      set: v => v === undefined ? undefined : String(v),
    },
  })
}
