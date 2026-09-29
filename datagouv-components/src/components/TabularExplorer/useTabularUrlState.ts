import { computed } from 'vue'
import type { Ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import type { LocationQueryValue } from 'vue-router'
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
 * finds them again, and a link to it shares them.
 *
 * Every param goes through `useRouteQuery`, which batches the writes of a tick
 * into a single `router.replace`: a change never stacks history entries, and
 * moving a filter from an alias to the JSON param is one navigation, not two.
 */
export function useTabularUrlState(aliases: Record<string, TabularUrlAlias>, defaultSort: SortConfig | null) {
  const filterParams = [...Object.keys(aliases), TABULAR_FILTERS_PARAM]
  const filterRefs = Object.fromEntries(filterParams.map(param => [param, useRouteQuery(param) as QueryRef]))
  const sortRef = useRouteQuery(TABULAR_SORT_PARAM) as QueryRef

  const filters = computed<Record<string, ColumnFilters>>({
    get: () => filtersFromUrlQuery(
      Object.fromEntries(filterParams.map(param => [param, filterRefs[param]!.value])),
      aliases,
    ),
    set: (value) => {
      for (const [param, paramValue] of Object.entries(filtersToUrlQuery(value, aliases))) {
        filterRefs[param]!.value = paramValue
      }
    },
  })

  const sort = computed<SortConfig | null>({
    get: () => sortFromUrlParam(sortRef.value, defaultSort),
    set: (value) => {
      sortRef.value = sortToUrlParam(value, defaultSort)
    },
  })

  return { filters, sort }
}
