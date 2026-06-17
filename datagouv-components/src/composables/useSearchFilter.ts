import { type InjectionKey, type Ref, inject, onMounted, onScopeDispose } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRouteQuery } from '@vueuse/router'
import type { SearchTypeConfig } from '../types/search'

export function configKey(c: SearchTypeConfig): string {
  return c.key ?? c.class
}

export interface CustomFilterEntry {
  apiParam: string
  ref: Ref<string | undefined>
  defaultValue: string | undefined
  typeKeys?: string[] // undefined = applies to all types
}

export interface SearchFilterContext {
  register(urlParam: string, entry: CustomFilterEntry): void
  unregister(urlParam: string): void
}

export function isCustomFilterActive(entry: CustomFilterEntry): boolean {
  const v = entry.ref.value
  return v !== undefined && v !== null && v !== '' && v !== entry.defaultValue
}

export function forEachActiveCustomFilter(
  registry: Map<string, CustomFilterEntry>,
  apply: (apiParam: string, value: string) => void,
  typeKey?: string,
): void {
  for (const entry of registry.values()) {
    if (!isCustomFilterActive(entry)) continue
    if (typeKey && entry.typeKeys && !entry.typeKeys.includes(typeKey)) continue
    apply(entry.apiParam, String(entry.ref.value))
  }
}

export const searchFilterContextKey: InjectionKey<SearchFilterContext>
  = Symbol('SearchFilterContext')

export interface UseSearchFilterOptions {
  /** The API parameter name to map this filter to. Defaults to the urlParam. */
  apiParam?: string
  /** Default value when not present in URL. Defaults to undefined. */
  defaultValue?: string
  /** One or more type config keys this filter applies to. Undefined means all types. */
  typeKeys?: string | string[]
}

/**
 * Registers a custom filter with the parent GlobalSearch component.
 *
 * Must be called inside a component rendered within GlobalSearch's
 * `#custom-filters-top` or `#custom-filters-bottom` slot.
 *
 * @param urlParam - The URL query parameter name (e.g. 'theme' → `?theme=value`)
 * @param options  - Optional: `apiParam` to map to a different API param (e.g. 'tag'), `defaultValue`
 * @returns A reactive ref bound to the URL parameter, suitable for v-model
 *
 * @example
 * ```vue
 * <script setup>
 * import { useSearchFilter } from '@datagouv/components-next'
 * // URL: ?theme=environment → API: ?tag=environment
 * const value = useSearchFilter('theme', { apiParam: 'tag' })
 * </script>
 * ```
 */
export function useSearchFilter(
  urlParam: string,
  options: UseSearchFilterOptions = {},
): Ref<string | undefined> {
  const context = inject(searchFilterContextKey)
  if (!context) {
    throw new Error(
      `useSearchFilter("${urlParam}") must be used inside a <GlobalSearch> component.`,
    )
  }

  const { apiParam = urlParam, defaultValue = undefined, typeKeys } = options
  const normalizedTypeKeys = typeKeys
    ? (Array.isArray(typeKeys) ? typeKeys : [typeKeys])
    : undefined

  const route = useRoute()
  const router = useRouter()
  const value = useRouteQuery<string | undefined>(urlParam, defaultValue)

  // Register in onMounted to avoid SSR/hydration mismatch: the registry must be
  // empty during SSR so server and client produce the same initial HTML.
  onMounted(() => {
    context.register(urlParam, { apiParam, ref: value, defaultValue, typeKeys: normalizedTypeKeys })
  })

  onScopeDispose(() => {
    // We cannot use `value.value = defaultValue` here because VueUse's
    // useRouteQuery registers its own tryOnScopeDispose cleanup that zeroes
    // the internal `query` variable to undefined (FIFO order, it runs first).
    // The setter then sees `query === v` and early-returns without ever
    // calling router.replace(). Instead we read the live route.query directly
    // (which is router state, not affected by that cleanup) and push the update.
    //
    // For type-scoped filters (typeKeys set): in a parent-driven type switch
    // (router.push to a new route), the filter component unmounts AFTER navigation
    // commits, at which point route.query no longer contains the param → the
    // condition below is false and no router.replace() is issued — no race with
    // the parent's push. In an in-page type switch (same route), the component
    // unmounts synchronously, route.query still has the old value, and the
    // replace clears it correctly.
    if (route.query[urlParam] !== undefined) {
      const { [urlParam]: _removed, ...restQuery } = route.query
      router.replace({
        query: defaultValue === undefined ? restQuery : { ...restQuery, [urlParam]: String(defaultValue) },
      })
    }
    context.unregister(urlParam)
  })

  return value
}
