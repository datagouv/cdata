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
  BadgeStyle,
  ColumnType,
  TabularColumnProfile,
  TabularProfileResponse,
  TabularTopValue,
} from './types'

const BADGE_PALETTE = [
  { bg: '#E6EEFE', text: '#3558A2' }, // blue-cumulus
  { bg: '#E8E3DB', text: '#6A6156' }, // beige-gris-galet
  { bg: '#FEECC2', text: '#695240' }, // yellow-tournesol
  { bg: '#C7F6FC', text: '#006A6F' }, // green-archipel
  { bg: '#E9EDFE', text: '#2323FF' }, // blue-ecume
  { bg: '#FFE0C7', text: '#885B40' }, // orange-terre-battue
  { bg: '#F2E9DB', text: '#6B4C35' }, // brown-cafe-creme
  { bg: '#BAFAEE', text: '#297254' }, // green-menthe
  { bg: '#FEE0EB', text: '#8D5368' }, // pink-macaron
  { bg: '#FCE164', text: '#695240' }, // yellow-moutarde
] as const

const BADGE_FALLBACK = { bg: '#F0E0CF', text: '#745B47' } // brown-opera

// Pure derivations of the csv-detective profile: a column's display type, its
// human-facing label/icon, null ratio, category badge colors and boolean counts.
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

  const badgeColorMap = computed(() => {
    const map = new Map<string, { bg: string, text: string }>()
    const profile = profileData.value?.profile
    if (!profile) return map
    for (const col of profile.categorical) {
      getTopsEntries(col).forEach((top, i) => {
        map.set(`${col}::${top.value}`, BADGE_PALETTE[i % BADGE_PALETTE.length]!)
      })
    }
    return map
  })

  function getCategoryBadgeStyle(col: string, value: string): BadgeStyle {
    const colors = badgeColorMap.value.get(`${col}::${value}`) ?? BADGE_FALLBACK
    return { backgroundColor: colors.bg, color: colors.text }
  }

  function getCategoryBadgeStylesForColumn(col: string): Record<string, BadgeStyle> {
    const styles: Record<string, BadgeStyle> = {}
    for (const top of getTopsEntries(col)) {
      styles[top.value] = getCategoryBadgeStyle(col, top.value)
    }
    return styles
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
    getCategoryBadgeStyle,
    getCategoryBadgeStylesForColumn,
    getBooleanCounts,
  }
}
