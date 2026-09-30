import { ofetch } from 'ofetch'
import { useComponentsConfig, type PluginConfig } from '../config'
import { encodeConditionValue } from './tabular'
import type { AndFilters, Filter, GenericFilter, OrFilters } from '../types/visualizations'
import type { SortConfig, TabularProfileResponse } from '../components/TabularExplorer/types'

export type { SortConfig }

export type TabularDataResponse = {
  data: Array<Record<string, unknown>>
  links: {
    profile: string
    swagger: string
    next: string
  }
  meta: { total: number }
}

export type TabularAggregateType = 'avg' | 'sum' | 'count' | 'min' | 'max'

export type FetchTabularDataOptions = {
  resourceId: string
  page?: number
  pageSize?: number
  columns?: Array<string> | undefined
  sort?: SortConfig
  groupBy?: string | undefined
  aggregation?: {
    column: string
    type: TabularAggregateType
  } | undefined
  filters?: GenericFilter | undefined
}

/**
 * Call Tabular-api to get table content with options object
 */
export async function fetchTabularData(config: PluginConfig, options: FetchTabularDataOptions): Promise<TabularDataResponse> {
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? config.tabularApiPageSize ?? 15
  let url = `${config.tabularApiUrl}/api/resources/${options.resourceId}/data/?page=${page}&page_size=${pageSize}`
  if (options.columns) {
    url += `&columns=${options.columns.map(col => encodeURIComponent(col)).join(',')}`
  }
  if (options.sort) {
    url += `&${encodeURIComponent(options.sort.column)}__sort=${encodeURIComponent(options.sort.direction)}`
  }
  if (options.groupBy && options.aggregation?.type) {
    url += `&${encodeURIComponent(options.groupBy)}__groupby&${encodeURIComponent(options.aggregation.column)}__${encodeURIComponent(options.aggregation.type)}`
  }
  if (options.filters) {
    const filterQuery = buildFilterQuery(options.filters)
    if (filterQuery) {
      url += `&${filterQuery}`
    }
  }
  return await ofetch<TabularDataResponse>(url)
}

/**
 * Serialize a filter tree into tabular-api query params.
 * - `Filter` → `column__condition=value` (ANDed with the other params)
 * - root `AndFilters` → one param per child; `OrFilters` children become `or=(...)` params
 * - root `OrFilters` → a single `or=(...)` param, with `AndFilters` children nested as `and(...)`
 * (nested-condition grammar: `.` instead of `=`, no value for isnull/isnotnull)
 */
export function buildFilterQuery(filters: GenericFilter): string {
  const params: Array<string> = []
  if (filters._cls === 'Filter') {
    const param = serializeParam(filters)
    if (param) params.push(param)
  }
  else if (filters._cls === 'AndFilters') {
    for (const child of filters.filters) {
      if (child._cls === 'Filter') {
        const param = serializeParam(child)
        if (param) params.push(param)
      }
      else {
        // child is an OrFilters group: serializeGroup returns `or(...)`, the param is `or=(...)`
        const nested = serializeGroup(child)
        if (nested) params.push(`or=${nested.slice(2)}`)
      }
    }
  }
  else {
    const nested = serializeGroup(filters)
    if (nested) params.push(`or=${nested.slice(2)}`)
  }
  return params.join('&')
}

/** `column__condition=value` param for a top-level (ANDed) filter, null when empty */
function serializeParam(filter: Filter): string | null {
  const column = encodeURIComponent(filter.column)
  if (filter.condition === 'is_null') return `${column}__isnull`
  if (filter.condition === 'is_not_null') return `${column}__isnotnull`
  if (filter.value === null || filter.value === undefined || filter.value === '') return null
  return `${column}__${encodeURIComponent(filter.condition)}=${encodeURIComponent(filter.value)}`
}

/** `column__condition.value` condition for the `or(...)` / `and(...)` grammar, null when empty */
function serializeCondition(filter: Filter): string | null {
  const column = encodeURIComponent(filter.column)
  if (filter.condition === 'is_null') return `${column}__isnull`
  if (filter.condition === 'is_not_null') return `${column}__isnotnull`
  if (filter.value === null || filter.value === undefined || filter.value === '') return null
  return `${column}__${encodeURIComponent(filter.condition)}.${encodeConditionValue(filter.value)}`
}

/** `or(a,b,...)` / `and(a,b,...)` for the nested-condition grammar, null when empty */
function serializeGroup(group: AndFilters | OrFilters): string | null {
  const operator = group._cls === 'OrFilters' ? 'or' : 'and'
  const conditions = group.filters
    .map(child => ('filters' in child ? serializeGroup(child) : serializeCondition(child)))
    .filter((condition): condition is string => condition !== null)
  if (conditions.length === 0) return null
  return `${operator}(${conditions.join(',')})`
}

/**
 * Call Tabular-api to get table content
 */
export async function getData(config: PluginConfig, id: string, page: number, sortConfig?: SortConfig | null): Promise<TabularDataResponse> {
  return fetchTabularData(config, {
    resourceId: id,
    page,
    sort: sortConfig ?? undefined,
  })
}

/**
 * Call Tabular-api to get table profile
 */
export function useGetProfile() {
  const config = useComponentsConfig()
  return (id: string) => ofetch<TabularProfileResponse>(`${config.tabularApiUrl}/api/resources/${id}/profile/`)
}
