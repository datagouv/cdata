import type { LocationQuery } from 'vue-router'
import type { ColumnFilters } from '~/datagouv-components/src/components/TabularExplorer/types'
import type { PreviewDashboardFormatStat } from '~/types/preview-dashboard'

const FORMAT_COLUMN = 'format normalisé'

export function buildFiltersFromQuery(query: LocationQuery): Record<string, ColumnFilters> {
  const raw = query.format
  if (raw == null) return {}

  const values = Array.isArray(raw) ? raw : raw.split(',')
  const normalized = values.map(v => v?.trim() ?? '').filter(Boolean)

  if (normalized.length === 0) return {}
  return { [FORMAT_COLUMN]: { in: normalized } }
}

export function formatMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  const date = new Date(year, monthNum - 1, 1)
  date.setMonth(date.getMonth() - 1)
  return formatMonth(date)
}

export type DeltaDirection = 'up' | 'down' | 'neutral'

export type DeltaUnit = 'count' | 'points'

export function getDeltaDirection(value: number): DeltaDirection {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'neutral'
}

// The label and the arrow both read this value, never the raw one: a delta of
// -0.03 points rounds to 0.0 and must render as "0.0%" without an arrow.
export function roundDelta(value: number, unit: DeltaUnit): number {
  return unit === 'points' ? Math.round(value * 10) / 10 : Math.round(value)
}

export function formatDelta(value: number, unit: DeltaUnit): string {
  const rounded = roundDelta(value, unit)
  const formatted = unit === 'points' ? `${Math.abs(rounded).toFixed(1)}%` : `${Math.abs(rounded)}`
  if (rounded > 0) return `+${formatted}`
  if (rounded < 0) return `-${formatted}`
  return formatted
}

export type PreviewDashboardFamilyStats = {
  family: string
  count: number
  countDelta?: number
  withPreview: number
  previewDelta?: number
  percentageOfCatalog: number
  percentageMissingPreview: number
  percentageError: number
  percentageTooBig: number
  percentageWithPreview: number
  formats: Array<PreviewDashboardFormatStat & { countDelta?: number, previewDelta?: number }>
}

type WeightedPercentageColumn = '% prévisualisation manquante' | '% erreur' | '% trop volumineux'

export function computeFamilyStats(
  rows: PreviewDashboardFormatStat[],
  currentMonth: string,
  previousMonth: string,
): PreviewDashboardFamilyStats[] {
  const totalCount = rows
    .filter(row => row.mois === currentMonth)
    .reduce((sum, row) => sum + row.nombre, 0)

  const byFamily = new Map<string, PreviewDashboardFormatStat[]>()
  for (const row of rows) {
    if (row.mois !== currentMonth) continue
    const family = row['famille']
    if (!byFamily.has(family)) {
      byFamily.set(family, [])
    }
    byFamily.get(family)!.push(row)
  }

  const previousFamilyTotals = new Map<string, { count: number, withPreview: number }>()
  const previousFormatMap = new Map<string, PreviewDashboardFormatStat>()
  for (const row of rows) {
    if (row.mois !== previousMonth) continue
    const family = row['famille']
    const totals = previousFamilyTotals.get(family) ?? { count: 0, withPreview: 0 }
    totals.count += row.nombre
    totals.withPreview += row['prévisualisable']
    previousFamilyTotals.set(family, totals)
    previousFormatMap.set(`${family}|${row['format normalisé']}`, row)
  }

  return Array.from(byFamily.entries())
    .map(([family, formats]) => {
      const count = formats.reduce((sum, row) => sum + row.nombre, 0)
      const withPreview = formats.reduce((sum, row) => sum + row['prévisualisable'], 0)
      const percentageOfCatalog = totalCount > 0 ? (count / totalCount) * 100 : 0
      // The dataset gives each percentage per format: averaging them at family
      // level only makes sense weighted by the number of resources behind each.
      const weightedAverage = (column: WeightedPercentageColumn) =>
        count > 0 ? formats.reduce((sum, row) => sum + ((row[column] ?? 0) * row.nombre), 0) / count : 0
      const percentageMissingPreview = weightedAverage('% prévisualisation manquante')
      const percentageError = weightedAverage('% erreur')
      const percentageTooBig = weightedAverage('% trop volumineux')
      const percentageWithPreview = count > 0 ? (withPreview / count) * 100 : 0

      const previousFamily = previousFamilyTotals.get(family)
      const countDelta = previousFamily ? count - previousFamily.count : undefined
      const previewDelta = previousFamily && previousFamily.count > 0 && count > 0
        ? ((withPreview / count) - (previousFamily.withPreview / previousFamily.count)) * 100
        : undefined

      const formatsWithDelta = formats.map((row) => {
        const previousRow = previousFormatMap.get(`${family}|${row['format normalisé']}`)
        const rowCountDelta = previousRow != null ? row.nombre - previousRow.nombre : undefined
        const rowPreviewDelta = previousRow != null
          ? row['% prévisualisable'] - previousRow['% prévisualisable']
          : undefined
        return { ...row, countDelta: rowCountDelta, previewDelta: rowPreviewDelta }
      })

      return {
        family,
        count,
        countDelta,
        withPreview,
        previewDelta,
        percentageOfCatalog,
        percentageMissingPreview,
        percentageError,
        percentageTooBig,
        percentageWithPreview,
        formats: formatsWithDelta,
      }
    })
    .sort((a, b) => b.count - a.count)
}
