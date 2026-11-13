import { ofetch } from 'ofetch'
import { useComponentsConfig, type PluginConfig } from '../config'
import { encodeConditionColumn, encodeConditionValue, encodeTabularParam, isRecord } from './tabular'
import type { AndFilters, Filter, GenericFilter, OrFilters } from '../types/visualizations'
import type { SortConfig, TabularProfileResponse } from '../components/TabularExplorer/types'
import type { TranslationFunction } from '../composables/useTranslation'

export type { SortConfig }

export type TabularDataResponse = {
  data: Array<Record<string, unknown>>
  links: {
    profile: string
    swagger: string
    next: string | null
    prev: string | null
  }
  meta: {
    page: number
    page_size: number
    /** Absent from the answer to an aggregate */
    total?: number
  }
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
    url += `&columns=${options.columns.map(encodeTabularParam).join(',')}`
  }
  if (options.sort) {
    url += `&${encodeTabularParam(options.sort.column)}__sort=${options.sort.direction}`
  }
  if (options.groupBy && options.aggregation?.type) {
    url += `&${encodeTabularParam(options.groupBy)}__groupby&${encodeTabularParam(options.aggregation.column)}__${options.aggregation.type}`
  }
  if (options.filters) {
    const filterQuery = buildFilterQuery(options.filters)
    if (filterQuery) {
      url += `&${filterQuery}`
    }
  }
  try {
    return await ofetch<TabularDataResponse>(url)
  }
  catch (error) {
    throw decodeTabularError(error)
  }
}

/** Why tabular-api failed, read from its error body; `unknown` when nothing can be said. */
export type TabularErrorReason
  = | { kind: 'unknown_column', column: string | null }
    | { kind: 'invalid_value', value: string | null, type: string | null }
    | { kind: 'impossible_aggregate' }
    | { kind: 'forbidden_aggregation' }
    | { kind: 'not_indexed', column: string, allowed: Array<string> }
    | { kind: 'invalid_query', detail: string }
    | { kind: 'unavailable' }
    | { kind: 'unknown' }

export class TabularApiError extends Error {
  constructor(
    /** Absent on a network or CORS failure */
    readonly statusCode: number | undefined,
    readonly reason: TabularErrorReason,
    /** Whether the same request may succeed later; a refused query will not */
    readonly retryable: boolean,
  ) {
    super(`tabular-api ${statusCode ?? 'unreachable'}: ${reason.kind}`)
    this.name = 'TabularApiError'
  }
}

// Same rule as udata's assistant client (udata/core/assistant/tabular.py).
const TABLE_NAME = /\b(?:csvapi\.)?[0-9a-f]{32}\b/g
const UNKNOWN_COLUMN = /^column (?:(?:csvapi\.)?[0-9a-f]{32}\.)?"?(.+?)"? does not exist$/s
const INVALID_VALUE = /^invalid input syntax for type ([\w ]+): "(.*)"$/s
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205'])
const INVALID_VALUE_CODES = new Set(['22P02', '22007'])
// api-tabular's two "Unauthorized parameters" details (core/query.py).
const FORBIDDEN_AGGREGATION_DETAIL = /^Aggregation parameters .* are not allowed/
const NOT_INDEXED_DETAIL = /^(?<column>.*) is not among the allowed columns: (?<allowed>\{.*\})$/s
// The items of the Python set repr of the indexed columns
const PYTHON_STRING = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g

function maskTableName(text: string): string {
  return text.replace(TABLE_NAME, 'ressource')
}

/** Turn what ofetch throws into a TabularApiError, from the status and the parsed body. */
export function decodeTabularError(error: unknown): TabularApiError {
  const raw = isRecord(error) ? error : {}
  const statusCode = typeof raw.statusCode === 'number' ? raw.statusCode : undefined
  if (statusCode === undefined) return new TabularApiError(undefined, { kind: 'unknown' }, true)
  const reason = decodeReason(statusCode, raw.data)
  const retryable = reason.kind === 'unavailable'
    ? statusCode !== 410
    : reason.kind === 'unknown' && (statusCode === 429 || statusCode >= 500)
  return new TabularApiError(statusCode, reason, retryable)
}

function decodeReason(status: number, body: unknown): TabularErrorReason {
  const errors = isRecord(body) ? body.errors : undefined
  const first: unknown = Array.isArray(errors) ? errors[0] : undefined
  // A plain-text 404 (or a 410 for a deleted resource) is api-tabular not serving the resource.
  if (!isRecord(first)) return status === 404 || status === 410 ? { kind: 'unavailable' } : { kind: 'unknown' }
  const { title, detail } = first
  if (status === 403) {
    return title === 'Unauthorized parameters' ? unauthorizedReason(detail) : { kind: 'unknown' }
  }
  if (isRecord(detail)) {
    const code = detail.code
    const message = typeof detail.message === 'string' ? detail.message : ''
    if (typeof code !== 'string') return { kind: 'unknown' }
    if (MISSING_TABLE_CODES.has(code)) return { kind: 'unavailable' }
    if (code === '42703') {
      const column = UNKNOWN_COLUMN.exec(message)?.[1]
      return { kind: 'unknown_column', column: column ? maskTableName(column) : null }
    }
    if (INVALID_VALUE_CODES.has(code)) {
      const match = INVALID_VALUE.exec(message)
      return { kind: 'invalid_value', type: match?.[1] ?? null, value: match?.[2] ?? null }
    }
    if (code === '42883') return { kind: 'impossible_aggregate' }
    return { kind: 'unknown' }
  }
  if (status === 400 && typeof detail === 'string' && detail) return { kind: 'invalid_query', detail: maskTableName(detail) }
  return { kind: 'unknown' }
}

function unauthorizedReason(detail: unknown): TabularErrorReason {
  if (typeof detail !== 'string') return { kind: 'unknown' }
  if (FORBIDDEN_AGGREGATION_DETAIL.test(detail)) return { kind: 'forbidden_aggregation' }
  const match = NOT_INDEXED_DETAIL.exec(detail)
  if (!match?.groups) return { kind: 'unknown' }
  const allowed = [...match.groups.allowed!.matchAll(PYTHON_STRING)].map(item => item[1] ?? item[2]!)
  return {
    kind: 'not_indexed',
    column: maskTableName(match.groups.column!),
    allowed: allowed.length > 0 ? allowed.sort() : [match.groups.allowed!],
  }
}

function expectedType(type: string, t: TranslationFunction): string {
  switch (type) {
    case 'smallint':
    case 'integer':
    case 'bigint':
      return t('un nombre entier')
    case 'real':
    case 'double precision':
    case 'numeric':
      return t('un nombre')
    case 'date':
      return t('une date')
    case 'timestamp without time zone':
    case 'timestamp with time zone':
      return t('une date et heure')
    case 'boolean':
      return t('un booléen')
    default:
      return t('du type {type}', { type })
  }
}

/** The message for the user, or null when the error says nothing more than "it failed". */
export function tabularErrorMessage(error: unknown, t: TranslationFunction): string | null {
  if (!(error instanceof TabularApiError)) return null
  const reason = error.reason
  switch (reason.kind) {
    case 'unknown_column':
      return reason.column
        ? t('La colonne {column} n’existe pas dans cette ressource.', { column: reason.column })
        : t('Colonne inconnue : une colonne du graphique n’existe pas dans cette ressource.')
    case 'invalid_value': {
      if (reason.value === null || reason.type === null) return t('Une valeur de filtre n’a pas le bon type.')
      return t('Une valeur de filtre n’a pas le bon type : « {value} » n’est pas {expected}.', {
        value: reason.value,
        expected: expectedType(reason.type, t),
      })
    }
    case 'impossible_aggregate':
      return t('Ce calcul n’est pas possible sur cette colonne.')
    case 'forbidden_aggregation':
      return t('Agrégation non autorisée sur cette ressource.')
    case 'not_indexed':
      return t('Colonne {column} non indexée : seules les colonnes {allowed} peuvent être regroupées ou agrégées.', {
        column: reason.column,
        allowed: reason.allowed.join(', '),
      })
    case 'invalid_query':
      return reason.detail
    case 'unavailable':
      return t('Les données de cette ressource ne sont pas disponibles.')
    case 'unknown':
      return null
  }
}

/**
 * Whether a group exists past the page of `options`: same query, one row per page.
 * Past the last group PostgREST answers an empty page, or a 416 when the offset also
 * passes the rows the filters leave.
 */
export async function hasMoreGroups(config: PluginConfig, options: FetchTabularDataOptions & { pageSize: number }): Promise<boolean> {
  const nextRow = (options.page ?? 1) * options.pageSize + 1
  try {
    const response = await fetchTabularData(config, { ...options, page: nextRow, pageSize: 1 })
    return response.data.length > 0
  }
  catch (error) {
    if (error instanceof TabularApiError && error.statusCode === 416) return false
    throw error
  }
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
  const column = encodeTabularParam(filter.column)
  if (filter.condition === 'is_null') return `${column}__isnull`
  if (filter.condition === 'is_not_null') return `${column}__isnotnull`
  if (filter.value === null || filter.value === undefined || filter.value === '') return null
  return `${column}__${filter.condition}=${encodeTabularParam(filter.value)}`
}

/** `column__condition.value` condition for the `or(...)` / `and(...)` grammar, null when empty */
function serializeCondition(filter: Filter): string | null {
  const column = encodeConditionColumn(filter.column)
  if (filter.condition === 'is_null') return `${column}__isnull`
  if (filter.condition === 'is_not_null') return `${column}__isnotnull`
  if (filter.value === null || filter.value === undefined || filter.value === '') return null
  return `${column}__${filter.condition}.${encodeConditionValue(filter.value)}`
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
