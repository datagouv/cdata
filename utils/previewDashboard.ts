import type { LocationQuery } from 'vue-router'
import type { ColumnFilters } from '~/datagouv-components/src/components/TabularExplorer/types'

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

export function buildQueryFromFilters(filters: PreviewDashboardFilters): { format?: string } {
  const formatFilter = filters[FORMAT_COLUMN]
  if (!formatFilter) return {}

  if (formatFilter.in && formatFilter.in.length > 0) return { format: formatFilter.in.join(',') }

  return {}
}
