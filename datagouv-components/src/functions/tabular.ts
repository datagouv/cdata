import type { Component } from 'vue'
import { parseDate, type CalendarDate } from '@internationalized/date'
import {
  RiHashtag,
  RiPriceTag3Line,
  RiText,
  RiCalendarLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiCheckboxLine,
  RiMapPin2Line,
  RiGlobalLine,
  RiFocus3Line,
  RiFingerprintLine,
  RiMailLine,
  RiLinksLine,
  RiPhoneLine,
  RiUserLine,
  RiMoneyEuroCircleLine,
  RiPercentLine,
  RiBracesLine,
  RiCodeLine,
} from '@remixicon/vue'
import { useTranslation } from '../composables/useTranslation'
import type { TranslationFunction } from '../composables/useTranslation'
import type { LocationQueryValue } from 'vue-router'
import type { ColumnFilters, ColumnType, DateFilter, DateFilterOperator, SortConfig, TabularUrlAlias } from '../components/TabularExplorer/types'
import { parseDateValue } from './dates'

export function hasFilterForColumn(filters: Record<string, ColumnFilters>, column: string): boolean {
  const f = filters[column]
  if (!f) return false
  return !!(f.in?.length || f.exact != null || f.contains || f.null || f.min != null || f.max != null || f.date)
}

// `initialFilters` is a public prop of TabularExplorer, so a filter can carry
// anything a consumer put in it. An unparseable date is dropped rather than
// thrown, the way a non-numeric `min` is already ignored by `Number.isFinite`.
export function parseIsoDate(value: string | undefined): CalendarDate | null {
  if (!value) return null
  try {
    return parseDate(value)
  }
  catch {
    return null
  }
}

/**
 * The calendar day a cell of a date column falls on, as an ISO date, or null
 * when the value is not one the API produced. Timestamps keep only their day:
 * filtering a whole day is the useful reading of "filter by this value", where
 * the exact millisecond would only ever match that one row.
 */
export function toIsoDay(value: unknown): string | null {
  const day = String(value ?? '').slice(0, 10)
  return parseIsoDate(day) ? day : null
}

/**
 * The day interval a date filter selects, half-open: `[lower, upper)`.
 * An absent bound means the interval is open on that side.
 */
function dateFilterBounds(filter: DateFilter): { lower: CalendarDate | null, upper: CalendarDate | null } {
  const start = parseIsoDate(filter.start)
  if (!start) return { lower: null, upper: null }
  switch (filter.operator) {
    case 'is':
      return { lower: start, upper: start.add({ days: 1 }) }
    case 'before':
      return { lower: null, upper: start }
    case 'after':
      return { lower: start.add({ days: 1 }), upper: null }
    case 'between': {
      const end = parseIsoDate(filter.end)
      return { lower: start, upper: end ? end.add({ days: 1 }) : null }
    }
  }
}

/**
 * Query params for a date filter, as a half-open day interval.
 *
 * The same two operators cover `date` and `datetime` columns, which
 * `resolveColumnType` merges into one display type. `__exact` would not: a
 * timestamp is never equal to a bare day, so an exact filter silently matches
 * nothing on a `datetime` column.
 */
export function buildDateFilterParams(column: string, filter: DateFilter): Record<string, string> {
  const { lower, upper } = dateFilterBounds(filter)
  const params: Record<string, string> = {}
  if (lower) params[`${column}__greater`] = lower.toString()
  if (upper) params[`${column}__strictly_less`] = upper.toString()
  return params
}

/**
 * The filter "filter by this value" sets on a column for the cell that was
 * clicked, merged into the filters already set on that column.
 *
 * An empty cell holds no value to match on: whatever the column type, filtering
 * on the missing values is what "this value" means there — and it is the filter
 * the column panel offers for them.
 */
export function buildCellValueFilter(columnType: ColumnType, value: unknown, existing: ColumnFilters): ColumnFilters {
  if (value == null || value === '') return { ...existing, null: 'only' }
  switch (columnType) {
    // A date goes through the same `date` filter the column panel writes, so the
    // calendar opens on the day that was clicked instead of on an empty month.
    case 'date': {
      const day = toIsoDay(value)
      return day ? { ...existing, date: { operator: 'is', start: day } } : existing
    }
    case 'number': {
      const num = Number(value)
      return Number.isFinite(num) ? { ...existing, min: num, max: num } : existing
    }
    case 'boolean':
      return { ...existing, exact: String(value) }
    case 'categorical':
    case 'text':
    case 'year': {
      const val = String(value)
      const selected = existing.in ?? []
      return selected.includes(val) ? existing : { ...existing, in: [...selected, val] }
    }
  }
}

export const TABULAR_FILTERS_PARAM = 'filters'
export const TABULAR_SORT_PARAM = 'sort'

const DATE_FILTER_OPERATORS: readonly DateFilterOperator[] = ['is', 'before', 'after', 'between']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function firstQueryValue(value: LocationQueryValue | LocationQueryValue[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value
  return first ?? undefined
}

/**
 * The criteria of a column filter that actually filter something, read from any
 * value: the ones from the URL can be anything a user typed. Empty criteria are
 * dropped too, so that a column left with none of them has no key left.
 */
export function normalizeColumnFilters(value: unknown): ColumnFilters {
  if (!isRecord(value)) return {}
  const filter: ColumnFilters = {}
  if (Array.isArray(value.in) && value.in.length && value.in.every(v => typeof v === 'string')) filter.in = value.in
  if (typeof value.exact === 'string' && value.exact) filter.exact = value.exact
  if (typeof value.min === 'number' && Number.isFinite(value.min)) filter.min = value.min
  if (typeof value.max === 'number' && Number.isFinite(value.max)) filter.max = value.max
  if (typeof value.contains === 'string' && value.contains) filter.contains = value.contains
  if (value.null === 'only' || value.null === 'exclude') filter.null = value.null
  const date = value.date
  if (isRecord(date) && DATE_FILTER_OPERATORS.includes(date.operator as DateFilterOperator) && typeof date.start === 'string') {
    filter.date = { operator: date.operator as DateFilterOperator, start: date.start }
    if (typeof date.end === 'string') filter.date.end = date.end
  }
  return filter
}

/**
 * The URL params holding `filters`. A column whose only criterion is the one of
 * an alias is written under that alias; every other column goes, whole, into a
 * single JSON param. Unused params are `undefined`, so that writing them all
 * removes the stale ones.
 */
export function filtersToUrlQuery(
  filters: Record<string, ColumnFilters>,
  aliases: Record<string, TabularUrlAlias>,
): Record<string, string | undefined> {
  const query: Record<string, string | undefined> = { [TABULAR_FILTERS_PARAM]: undefined }
  for (const param of Object.keys(aliases)) query[param] = undefined
  const rest: Record<string, ColumnFilters> = {}
  for (const [column, raw] of Object.entries(filters)) {
    const filter = normalizeColumnFilters(raw)
    const criteria = Object.keys(filter)
    if (!criteria.length) continue
    const alias = criteria.length === 1
      ? Object.entries(aliases).find(([, a]) => a.column === column && a.operator === criteria[0])
      : undefined
    if (alias) query[alias[0]] = filter[alias[1].operator]
    else rest[column] = filter
  }
  if (Object.keys(rest).length) query[TABULAR_FILTERS_PARAM] = JSON.stringify(rest)
  return query
}

export function filtersFromUrlQuery(
  query: Record<string, LocationQueryValue | LocationQueryValue[] | undefined>,
  aliases: Record<string, TabularUrlAlias>,
): Record<string, ColumnFilters> {
  const filters: Record<string, ColumnFilters> = {}
  for (const [param, { column, operator }] of Object.entries(aliases)) {
    const value = firstQueryValue(query[param])
    if (value) filters[column] = { [operator]: value }
  }
  const json = firstQueryValue(query[TABULAR_FILTERS_PARAM])
  if (!json) return filters
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  }
  catch {
    return filters
  }
  if (!isRecord(parsed)) return filters
  for (const [column, raw] of Object.entries(parsed)) {
    const filter = normalizeColumnFilters(raw)
    if (Object.keys(filter).length) filters[column] = filter
  }
  return filters
}

/**
 * The URL param holding `sort`, in the `-column` for descending convention of
 * the udata API. The default sort stays out of the URL; dropping it is written as
 * an empty value, since an absent param already means "the default sort".
 */
export function sortToUrlParam(sort: SortConfig | null, defaultSort: SortConfig | null): string | undefined {
  if (sort?.column === defaultSort?.column && sort?.direction === defaultSort?.direction) return undefined
  if (!sort) return ''
  return sort.direction === 'desc' ? `-${sort.column}` : sort.column
}

export function sortFromUrlParam(
  param: LocationQueryValue | LocationQueryValue[] | undefined,
  defaultSort: SortConfig | null,
): SortConfig | null {
  const value = firstQueryValue(param)
  if (value === undefined) return defaultSort
  if (value === '') return null
  return value.startsWith('-')
    ? { column: value.slice(1), direction: 'desc' }
    : { column: value, direction: 'asc' }
}

export type TypeDisplay = {
  icon: Component
  label: string
}

export function buildTypeConfig(t: TranslationFunction): Record<ColumnType, TypeDisplay> {
  return {
    number: { icon: RiHashtag, label: t('Nombre') },
    categorical: { icon: RiPriceTag3Line, label: t('Catégoriel') },
    text: { icon: RiText, label: t('Texte') },
    date: { icon: RiCalendarLine, label: t('Date') },
    boolean: { icon: RiCheckboxLine, label: t('Booléen') },
    year: { icon: RiCalendarLine, label: t('Année') },
  }
}

export function resolveColumnType(colInfo: { python_type: string, format?: string }, isCategorical: boolean): ColumnType {
  if (colInfo.format === 'year') return 'year'
  if (['int', 'float'].includes(colInfo.python_type)) return 'number'
  if (['date', 'datetime'].includes(colInfo.python_type)) return 'date'
  if (colInfo.python_type === 'bool') return 'boolean'
  if (isCategorical) return 'categorical'
  return 'text'
}

// csv-detective formats that carry no semantic meaning beyond the generic
// display type already resolved by `ColumnType` — these fall back to
// `buildTypeConfig` (Texte / Nombre / Date / Booléen) in the header.
export const GENERIC_FORMATS = new Set(['string', 'int', 'float', 'date', 'bool', 'booleen'])

// Semantic types detected by csv-detective (see ../../../csv-detective/csv_detective/formats).
// The list is intentionally exhaustive, but unknown formats are tolerated:
// `getColumnDisplay` humanizes any format missing from this map.
export function buildFormatConfig(t: TranslationFunction): Record<string, TypeDisplay> {
  return {
    // Geo — territories & addresses
    adresse: { icon: RiMapPin2Line, label: t('Adresse') },
    commune: { icon: RiMapPin2Line, label: t('Commune') },
    code_commune: { icon: RiMapPin2Line, label: t('Code INSEE commune') },
    code_commune_insee: { icon: RiMapPin2Line, label: t('Code INSEE commune') },
    departement: { icon: RiMapPin2Line, label: t('Département') },
    code_departement: { icon: RiMapPin2Line, label: t('Code département') },
    region: { icon: RiMapPin2Line, label: t('Région') },
    code_region: { icon: RiMapPin2Line, label: t('Code région') },
    code_epci: { icon: RiMapPin2Line, label: t('Code EPCI') },
    code_postal: { icon: RiMapPin2Line, label: t('Code postal') },
    insee_canton: { icon: RiMapPin2Line, label: t('Canton') },
    code_fantoir: { icon: RiMapPin2Line, label: t('Code FANTOIR') },
    id_rnb: { icon: RiMapPin2Line, label: t('Identifiant RNB') },
    // Geo — countries
    pays: { icon: RiGlobalLine, label: t('Pays') },
    iso_country_code_alpha2: { icon: RiGlobalLine, label: t('Code pays (ISO α-2)') },
    iso_country_code_alpha3: { icon: RiGlobalLine, label: t('Code pays (ISO α-3)') },
    iso_country_code_numeric: { icon: RiGlobalLine, label: t('Code pays (ISO num.)') },
    // Geo — coordinates
    latitude_wgs: { icon: RiFocus3Line, label: t('Latitude') },
    latitude_wgs_fr_metropole: { icon: RiFocus3Line, label: t('Latitude') },
    longitude_wgs: { icon: RiFocus3Line, label: t('Longitude') },
    longitude_wgs_fr_metropole: { icon: RiFocus3Line, label: t('Longitude') },
    latitude_l93: { icon: RiFocus3Line, label: t('Latitude (Lambert 93)') },
    longitude_l93: { icon: RiFocus3Line, label: t('Longitude (Lambert 93)') },
    latlon_wgs: { icon: RiFocus3Line, label: t('Latitude / longitude') },
    lonlat_wgs: { icon: RiFocus3Line, label: t('Longitude / latitude') },
    // Identifiers
    siren: { icon: RiFingerprintLine, label: t('SIREN') },
    siret: { icon: RiFingerprintLine, label: t('SIRET') },
    code_rna: { icon: RiFingerprintLine, label: t('Identifiant RNA') },
    code_waldec: { icon: RiFingerprintLine, label: t('Identifiant WALDEC') },
    code_import: { icon: RiFingerprintLine, label: t('Code Import') },
    uai: { icon: RiFingerprintLine, label: t('UAI') },
    insee_ape700: { icon: RiFingerprintLine, label: t('Code APE') },
    code_csp_insee: { icon: RiFingerprintLine, label: t('Code CSP') },
    uuid: { icon: RiFingerprintLine, label: t('UUID') },
    mongo_object_id: { icon: RiFingerprintLine, label: t('Identifiant Mongo') },
    // Contact
    email: { icon: RiMailLine, label: t('Email') },
    url: { icon: RiLinksLine, label: t('URL') },
    tel_fr: { icon: RiPhoneLine, label: t('Téléphone') },
    username: { icon: RiUserLine, label: t('Nom d\'utilisateur') },
    // People
    sexe: { icon: RiUserLine, label: t('Sexe') },
    csp_insee: { icon: RiUserLine, label: t('Catégorie socio-pro.') },
    // Quantities
    money: { icon: RiMoneyEuroCircleLine, label: t('Montant') },
    percent: { icon: RiPercentLine, label: t('Pourcentage') },
    // Temporal
    year: { icon: RiCalendarLine, label: t('Année') },
    date_fr: { icon: RiCalendarLine, label: t('Date') },
    jour_de_la_semaine: { icon: RiCalendarEventLine, label: t('Jour de la semaine') },
    mois_de_lannee: { icon: RiCalendarEventLine, label: t('Mois de l\'année') },
    datetime_naive: { icon: RiTimeLine, label: t('Date et heure') },
    datetime_aware: { icon: RiTimeLine, label: t('Date et heure') },
    datetime_rfc822: { icon: RiTimeLine, label: t('Date et heure') },
    // Structured
    json: { icon: RiBracesLine, label: t('JSON') },
    geojson: { icon: RiBracesLine, label: t('GeoJSON') },
    binary: { icon: RiCodeLine, label: t('Binaire') },
  }
}

// Tolerant fallback for a semantic format we don't explicitly know about:
// "code_truc_machin" -> "Code truc machin".
export function humanizeFormat(format: string): string {
  const spaced = format.replace(/_/g, ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export function useFormatTabular() {
  const { locale } = useTranslation()

  function formatNumber(value: unknown): string {
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    return num.toLocaleString(locale)
  }

  function formatCellDate(value: unknown): string {
    if (value == null || value === '') return '–'
    const d = parseDateValue(String(value))
    if (!d) return String(value)
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
  }

  return { formatNumber, formatCellDate }
}

const TRUTHY_VALUES = ['true', '1', 'oui', 'yes']
const FALSY_VALUES = ['false', '0', 'non', 'no']

// `encodeURIComponent` leaves `.`, `(` and `)` as-is, but they are the operator
// separator and the delimiters of the API's `or(...)` grammar: a search value
// containing one makes the parser reject the whole query with a 400.
// The API percent-decodes the query string once before running the grammar
// parser, then percent-decodes the parsed value: grammar-significant characters
// must therefore be sent double-encoded (`%252E`) so the first decode leaves
// them escaped (`%2E`) for the parser to unquote after parsing.
export function encodeConditionValue(value: string): string {
  return encodeURIComponent(value)
    .replace(/\./g, '%252E')
    .replace(/\(/g, '%2528')
    .replace(/\)/g, '%2529')
}

// A decimal literal, not `Number()`: the API compares against a number column,
// and it answers an error for the whole `or(...)` when it is handed something it
// cannot parse as one — which `Number()` happily accepts (`0x10`, `1e5`, ` `).
const NUMBER_LITERAL_RE = /^-?\d+(\.\d+)?$/

/**
 * Builds the OR conditions for global search across all columns.
 * Text and categorical columns get a `__contains` filter; number columns
 * get a `__exact` filter only when the search value is numeric.
 * Year, date and boolean columns are excluded.
 */
export function buildGlobalSearchConditions(
  allColumns: string[],
  getColumnType: (col: string) => ColumnType,
  searchValue: string,
): string[] {
  const conditions: string[] = []
  for (const col of allColumns) {
    const type = getColumnType(col)
    if (type === 'text' || type === 'categorical') {
      conditions.push(col + '__contains.' + encodeConditionValue(searchValue))
    }
    else if (type === 'number' && NUMBER_LITERAL_RE.test(searchValue)) {
      conditions.push(col + '__exact.' + encodeConditionValue(searchValue))
    }
  }
  return conditions
}

export function isTruthy(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return TRUTHY_VALUES.includes(value.toLowerCase())
  return Boolean(value)
}

export function isFalsy(value: unknown): boolean {
  if (typeof value === 'boolean') return !value
  if (typeof value === 'string') return FALSY_VALUES.includes(value.toLowerCase())
  return !value
}
