import type { LocationQuery } from 'vue-router'
import type { ColumnFilters } from '~/datagouv-components/src/components/TabularExplorer/types'
import type { PreviewDashboardFormatStat } from '~/types/preview-dashboard'

const FORMAT_COLUMN = 'format normalisé'

export type PreviewDashboardFilters = Record<string, ColumnFilters>

export function buildFiltersFromQuery(query: LocationQuery): PreviewDashboardFilters {
  const raw = query.format
  if (raw == null || raw === '') return {}

  const values = Array.isArray(raw) ? raw : String(raw).split(',')
  const normalized = values.map(v => String(v).trim()).filter(Boolean)

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

export function getDeltaDirection(value: number): DeltaDirection {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'neutral'
}

export function formatDelta(value: number, unit: 'count' | 'points'): string {
  const formatted = unit === 'points' ? `${Math.abs(value).toFixed(1)}%` : `${Math.abs(Math.round(value))}`
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
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

export function computeFamilyStats(
  rows: PreviewDashboardFormatStat[],
  currentMonth: string,
  previousMonth?: string,
): PreviewDashboardFamilyStats[] {
  const totalCount = rows
    .filter(row => row.Mois === currentMonth)
    .reduce((sum, row) => sum + row.Nombre, 0)

  const byFamily = new Map<string, PreviewDashboardFormatStat[]>()
  for (const row of rows) {
    if (row.Mois !== currentMonth) continue
    const family = row['Famille de format']
    if (!byFamily.has(family)) {
      byFamily.set(family, [])
    }
    byFamily.get(family)!.push(row)
  }

  const previousFamilyMap = new Map<string, PreviewDashboardFormatStat>()
  const previousFormatMap = new Map<string, PreviewDashboardFormatStat>()
  if (previousMonth) {
    for (const row of rows) {
      if (row.Mois !== previousMonth) continue
      const family = row['Famille de format']
      if (!previousFamilyMap.has(family)) {
        previousFamilyMap.set(family, { ...row })
      }
      else {
        const existing = previousFamilyMap.get(family)!
        existing.Nombre += row.Nombre
        existing['Prévisualisable'] += row['Prévisualisable']
      }
      previousFormatMap.set(`${family}|${row.Format}`, row)
    }
  }

  return Array.from(byFamily.entries())
    .map(([family, formats]) => {
      const count = formats.reduce((sum, row) => sum + row.Nombre, 0)
      const withPreview = formats.reduce((sum, row) => sum + row['Prévisualisable'], 0)
      const percentageOfCatalog = totalCount > 0 ? (count / totalCount) * 100 : 0
      const weightedMissingPreviewSum = formats.reduce((sum, row) => sum + ((row['% prévisualisation manquante'] ?? 0) * row.Nombre), 0)
      const percentageMissingPreview = count > 0 ? weightedMissingPreviewSum / count : 0
      const weightedErrorSum = formats.reduce((sum, row) => sum + ((row['% erreur'] ?? 0) * row.Nombre), 0)
      const percentageError = count > 0 ? weightedErrorSum / count : 0
      const weightedTooBigSum = formats.reduce((sum, row) => sum + ((row['% too big'] ?? 0) * row.Nombre), 0)
      const percentageTooBig = count > 0 ? weightedTooBigSum / count : 0
      const percentageWithPreview = count > 0 ? (withPreview / count) * 100 : 0

      const previousFamily = previousFamilyMap.get(family)
      const previousCount = previousFamily?.Nombre
      const previousWithPreview = previousFamily?.['Prévisualisable']
      const countDelta = previousCount != null ? count - previousCount : undefined
      const previewDelta = previousCount != null && previousCount > 0 && count > 0
        ? ((withPreview / count) - (previousWithPreview! / previousCount)) * 100
        : undefined

      const formatsWithDelta = formats.map((row) => {
        const previousRow = previousFormatMap.get(`${family}|${row.Format}`)
        const rowCountDelta = previousRow != null ? row.Nombre - previousRow.Nombre : undefined
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

export function computeSummaryStats(
  rows: PreviewDashboardFormatStat[],
  currentMonth: string,
): { total: number, previewableCount: number, previewablePercentage: number } | null {
  const currentRows = rows.filter(row => row.Mois === currentMonth)
  if (currentRows.length === 0) return null
  const total = currentRows.reduce((sum, row) => sum + row.Nombre, 0)
  const previewableCount = currentRows.reduce((sum, row) => sum + row['Prévisualisable'], 0)
  const previewablePercentage = total > 0 ? (previewableCount / total) * 100 : 0
  return { total, previewableCount, previewablePercentage }
}
