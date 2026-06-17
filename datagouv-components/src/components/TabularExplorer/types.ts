/** Response from /api/resources/{rid}/data/ */
export type TabularDataResponse = {
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
export type TabularProfileResponse = {
  profile: TabularProfile
}

export type TabularProfile = {
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

export type TabularColumnInfo = {
  score: number
  format: string
  python_type: string
}

export type TabularColumnProfile = {
  tops: TabularTopValue[]
  nb_distinct: number
  nb_missing_values: number
  min?: number
  max?: number
  std?: number
  mean?: number
}

export type TabularTopValue = {
  value: string
  count: number
}

export type ColumnType = 'number' | 'categorical' | 'text' | 'date' | 'boolean'

export type ColumnFilters = {
  in?: string[]
  exact?: string
  min?: number
  max?: number
  contains?: string
  null?: 'only' | 'exclude'
}

export type SortDirection = 'asc' | 'desc'

export type SortConfig = {
  column: string
  direction: SortDirection
}

export type BadgeStyle = {
  backgroundColor: string
  color: string
}
