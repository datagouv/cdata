import type { ColumnDefinition, DataSeriesForm, TabularAggregateType } from '@datagouv/components-next'

/**
 * Keep a combined sort value only if it still exists among the available options.
 * Returns an empty string when the value is missing or already empty.
 */
export function keepValidSortCombined<T extends string>(currentSortCombined: T, availableValues: Array<T>): T {
  if (!currentSortCombined) {
    return '' as T
  }
  return availableValues.includes(currentSortCombined) ? currentSortCombined : '' as T
}

/** What the Y axis shows: an aggregate of a column, or its raw values ('none'). */
export type SerieCalculation = TabularAggregateType | 'none'

export function getSerieCalculation(serie: Pick<DataSeriesForm, 'aggregate_y'>): SerieCalculation {
  return serie.aggregate_y || 'none'
}

export function getSerieColumnYOptions(calculation: SerieCalculation, columns: Array<ColumnDefinition>): Array<ColumnDefinition> {
  if (calculation === 'count') return []
  if (calculation === 'none') return columns
  return columns.filter(column => column.type === 'number')
}

export function applySerieCalculation(serie: DataSeriesForm, calculation: SerieCalculation, columnX: string, columns: Array<ColumnDefinition>) {
  if (calculation === 'count') {
    // A count series counts the X column by convention.
    serie.column_y = columnX
    serie.aggregate_y = 'count'
    return
  }
  serie.aggregate_y = calculation === 'none' ? null : calculation
  const options = getSerieColumnYOptions(calculation, columns)
  if (!options.some(column => column.name === serie.column_y)) {
    serie.column_y = options.find(column => column.name !== '__id')?.name ?? ''
  }
}
