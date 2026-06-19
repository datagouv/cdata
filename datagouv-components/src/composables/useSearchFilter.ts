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
    // Type-scoped filters (typeKeys set) are cleared by GlobalSearch's
    // watch(currentType) instead, so their URL update batches with the other
    // type-change resets via useRouteQuery rather than racing them with the
    // separate router.replace below. Here we only clear filters that apply to
    // all types: their unmount is a consumer signal unrelated to a type switch,
    // which GlobalSearch has no way to detect.
    //
    // We cannot use `value.value = defaultValue` here because VueUse's
    // useRouteQuery registers its own tryOnScopeDispose cleanup that zeroes
    // the internal `query` variable to undefined (FIFO order, it runs first).
    // The setter then sees `query === v` and early-returns without ever
    // calling router.replace(). Instead we read the live route.query directly
    // (which is router state, not affected by that cleanup) and push the update.
    if (normalizedTypeKeys === undefined && route.query[urlParam] !== undefined) {
      const { [urlParam]: _removed, ...restQuery } = route.query
      router.replace({
        query: defaultValue === undefined ? restQuery : { ...restQuery, [urlParam]: String(defaultValue) },
      })
    }
    context.unregister(urlParam)
  })

  return value
}
