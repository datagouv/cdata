import type { Component } from 'vue'
import {
  RiHashtag,
  RiPriceTag3Line,
  RiText,
  RiCalendarLine,
  RiCheckboxLine,
} from '@remixicon/vue'
import { useTranslation } from '../composables/useTranslation'
import { useFormatDate } from './dates'
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

export function formatNumber(value: unknown): string {
  const { locale } = useTranslation()
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return num.toLocaleString(locale)
}

export function formatCellDate(value: unknown): string {
  if (value == null || value === '') return '–'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value)
  const { formatDate } = useFormatDate()
  return formatDate(d, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function isTruthy(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return Boolean(value)
}
