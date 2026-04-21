import type { Component } from 'vue'
import {
  RiHashtag,
  RiPriceTag3Line,
  RiText,
  RiCalendarLine,
  RiCheckboxLine,
} from '@remixicon/vue'
import { useTranslation } from '../composables/useTranslation'
import type { ColumnFilters, ColumnType } from '../components/TabularExplorer/types'

export function hasFilterForColumn(filters: Record<string, ColumnFilters>, column: string): boolean {
  const f = filters[column]
  if (!f) return false
  return !!(f.in?.length || f.exact != null || f.contains || f.null || f.min != null || f.max != null)
}

export function buildTypeConfig(t: (s: string) => string): Record<ColumnType, { icon: Component, label: string }> {
  return {
    number: { icon: RiHashtag, label: t('Nombre') },
    categorical: { icon: RiPriceTag3Line, label: t('Catégoriel') },
    text: { icon: RiText, label: t('Texte') },
    date: { icon: RiCalendarLine, label: t('Date') },
    boolean: { icon: RiCheckboxLine, label: t('Booléen') },
  }
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
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return String(value)
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
  }

  return { formatNumber, formatCellDate }
}

const TRUTHY_VALUES = ['true', '1', 'oui', 'yes']
const FALSY_VALUES = ['false', '0', 'non', 'no']

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
