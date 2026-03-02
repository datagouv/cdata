/** Response from /api/resources/{rid}/data/ */
export interface TabularDataResponse {
  data: TabularRow[]
  meta: {
    page: number
    page_size: number
    total: number
  }
  links: {
    profile: string
    swagger: string
    next: string | null
    prev: string | null
  }
}

export type TabularRow = Record<string, unknown> & { __id: number }

/** Response from /api/resources/{rid}/profile/ */
export interface TabularProfileResponse {
  profile: TabularProfile
}

export interface TabularProfile {
  header: string[]
  columns: Record<string, TabularColumnInfo>
  formats: Record<string, string[]>
  profile: Record<string, TabularColumnProfile>
  encoding: string
  separator: string
  categorical: string[]
  total_lines: number
  nb_duplicates: number
  columns_fields: unknown
  columns_labels: unknown
  header_row_idx: number
  heading_columns: number
  trailing_columns: number
}

export interface TabularColumnInfo {
  score: number
  format: string
  python_type: string
}

export interface TabularColumnProfile {
  tops: TabularTopValue[]
  nb_distinct: number
  nb_missing_values: number
  min?: number
  max?: number
  std?: number
  mean?: number
}

export interface TabularTopValue {
  value: string
  count: number
}

export type ColumnType = 'number' | 'categorical' | 'text' | 'date' | 'boolean'

export interface ColumnFilters {
  in?: string[]
  min?: number
  max?: number
}

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  column: string
  direction: SortDirection
}
