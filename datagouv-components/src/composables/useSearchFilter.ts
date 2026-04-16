import { type InjectionKey, type Ref, inject, onMounted, onScopeDispose } from 'vue'
import { useRouteQuery } from '@vueuse/router'

export interface CustomFilterEntry {
  apiParam: string
  ref: Ref<string | undefined>
  defaultValue: string | undefined
}

export interface SearchFilterContext {
  register(urlParam: string, entry: CustomFilterEntry): void
  unregister(urlParam: string): void
}

export const searchFilterContextKey: InjectionKey<SearchFilterContext>
  = Symbol('SearchFilterContext')

export interface UseSearchFilterOptions {
  /** The API parameter name to map this filter to. Defaults to the urlParam. */
  apiParam?: string
  /** Default value when not present in URL. Defaults to undefined. */
  defaultValue?: string
}

/**
 * Registers a custom filter with the parent GlobalSearch component.
 *
 * Must be called inside a component rendered within GlobalSearch's `#custom-filters` slot.
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

  const { apiParam = urlParam, defaultValue = undefined } = options

  const value = useRouteQuery<string | undefined>(urlParam, defaultValue)

  // Register in onMounted to avoid SSR/hydration mismatch: the registry must be
  // empty during SSR so server and client produce the same initial HTML.
  onMounted(() => {
    context.register(urlParam, { apiParam, ref: value, defaultValue })
  })

  onScopeDispose(() => {
    value.value = defaultValue
    context.unregister(urlParam)
  })

  return value
}
