import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { useRoute } from 'vue-router'
import type { LocationQueryValue } from 'vue-router'
import { useComponentsConfig } from '../../config'
import {
  TABULAR_FILTERS_PARAM,
  TABULAR_SORT_PARAM,
  filtersFromUrlQuery,
  filtersToUrlQuery,
  sortFromUrlParam,
  sortToUrlParam,
} from '../../functions/tabular'
import type { ColumnFilters, SortConfig, TabularUrlAlias } from './types'

type QueryRef = Ref<LocationQueryValue | LocationQueryValue[] | undefined>

/**
 * Sort and filters of the explorer, stored in the URL: going back to the page
 * finds them again, and a link to it shares them. Only the `columns` of the
 * resource are read from it.
 *
 * Every param goes through `useRouteQuery`, which batches the writes of a tick
 * into a single `router.replace`: a change never stacks history entries, and
 * moving a filter from an alias to the JSON param is one navigation, not two.
 */
export function useTabularUrlState(
  aliases: Record<string, TabularUrlAlias>,
  defaultSort: SortConfig | null,
  columns: MaybeRefOrGetter<readonly string[]>,
) {
  const config = useComponentsConfig()
  const route = (config.useRoute ?? useRoute)()
  const filterRefs = [...Object.keys(aliases), TABULAR_FILTERS_PARAM]
    .map(param => [param, useRouteQuery(param, undefined, { route }) as QueryRef] as const)
  const sortRef = useRouteQuery(TABULAR_SORT_PARAM, undefined, { route }) as QueryRef

  const filters = computed<Record<string, ColumnFilters>>({
    get: () => filtersFromUrlQuery(
      Object.fromEntries(filterRefs.map(([param, ref]) => [param, ref.value])),
      aliases,
      toValue(columns),
    ),
    set: (value) => {
      const query = filtersToUrlQuery(value, aliases)
      for (const [param, ref] of filterRefs) ref.value = query[param]
    },
  })

  const sort = computed<SortConfig | null>({
    get: () => sortFromUrlParam(sortRef.value, defaultSort, toValue(columns)),
    set: (value) => {
      sortRef.value = sortToUrlParam(value, defaultSort)
    },
  })

  return { filters, sort }
}
