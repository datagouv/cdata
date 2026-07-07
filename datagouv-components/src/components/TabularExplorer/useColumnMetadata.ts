import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import type { TranslationFunction } from '../../composables/useTranslation'
import {
  buildFormatConfig,
  buildTypeConfig,
  GENERIC_FORMATS,
  humanizeFormat,
  isFalsy,
  isTruthy,
  resolveColumnType,
} from '../../functions/tabular'
import type { ColumnDisplay } from './useTabularContext'
import type {
  ColumnType,
  TabularColumnProfile,
  TabularProfileResponse,
  TabularTopValue,
} from './types'

// Pure derivations of the csv-detective profile: a column's display type, its
// human-facing label/icon, null ratio and boolean counts.
// Kept out of TabularExplorer so the fetch/pagination/filter state doesn't drown
// under a hundred lines of metadata math — and so this logic stays unit-testable
// in isolation from the component.
export function useColumnMetadata(
  profileData: Readonly<Ref<TabularProfileResponse | null>>,
  allColumns: MaybeRefOrGetter<string[]>,
  t: TranslationFunction,
) {
  const typeConfig = buildTypeConfig(t)
  const formatConfig = buildFormatConfig(t)

  function getColumnProfile(col: string): TabularColumnProfile | null {
    return profileData.value?.profile?.profile?.[col] ?? null
  }

  function getTopsEntries(col: string): TabularTopValue[] {
    return getColumnProfile(col)?.tops ?? []
  }

  function getColumnTypeFromName(col: string): ColumnType {
    const profile = profileData.value?.profile
    if (!profile) return 'text'
    const colInfo = profile.columns[col]
    if (!colInfo) return 'text'
    return resolveColumnType(colInfo, profile.categorical.includes(col))
  }

  const columnTypesMap = computed<Record<string, ColumnType>>(() => {
    const map: Record<string, ColumnType> = {}
    for (const col of toValue(allColumns)) {
      map[col] = getColumnTypeFromName(col)
    }
    return map
  })

  function getColumnType(col: string): ColumnType {
    return columnTypesMap.value[col] ?? 'text'
  }

  function getNullPercent(col: string): string {
    const colProfile = getColumnProfile(col)
    const total = profileData.value?.profile?.total_lines
    if (!colProfile || !total) return '0%'
    return `${((colProfile.nb_missing_values / total) * 100).toFixed(1)}%`
  }

  function getTypeConfig(col: string) {
    return typeConfig[getColumnType(col)]
  }

  // Header display: prefer the rich semantic format detected by csv-detective
  // (code INSEE, UAI, département, SIREN, email…) over the generic display type.
  // Tolerant: generic formats fall back to the type config, and unknown semantic
  // formats are humanized rather than dropped.
  function getColumnDisplay(col: string): ColumnDisplay {
    const format = profileData.value?.profile?.columns?.[col]?.format
    const fallback = getTypeConfig(col)
    if (!format || GENERIC_FORMATS.has(format)) return fallback
    return formatConfig[format] ?? { icon: fallback.icon, label: humanizeFormat(format) }
  }

  function getBooleanCounts(col: string): { trueCount: number, falseCount: number } {
    const profile = getColumnProfile(col)
    if (!profile?.tops) return { trueCount: 0, falseCount: 0 }
    let trueCount = 0
    let falseCount = 0
    for (const top of profile.tops) {
      if (isTruthy(top.value ?? '')) trueCount += top.count
      else if (isFalsy(top.value ?? '')) falseCount += top.count
    }
    return { trueCount, falseCount }
  }

  return {
    columnTypesMap,
    getColumnType,
    getColumnProfile,
    getColumnDisplay,
    getTopsEntries,
    getNullPercent,
    getBooleanCounts,
  }
}
