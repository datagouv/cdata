import type { FilterCondition, Filter } from '../types/visualizations'

/**
 * Maps frontend filter conditions to Tabular API query parameter operators
 */
export const CONDITION_TO_OPERATOR: Record<FilterCondition, string> = {
  exact: 'exact',
  differs: 'differs',
  is_null: 'isnull',
  is_not_null: 'isnotnull',
  greater: 'greater',
  less: 'less',
  strictly_greater: 'strictly_greater',
  strictly_less: 'strictly_less',
}

/**
 * Converts a Filter object to the format expected by fetchTabularData
 */
export function filterToApiFormat(filter: Filter | undefined): Array<{
  column: string
  operator: string
  value?: string
}> | undefined {
  if (!filter || !filter.column) return undefined
  
  const operator = CONDITION_TO_OPERATOR[filter.condition]
  if (!operator) return undefined
  
  return [{
    column: filter.column,
    operator,
    value: filter.value || undefined,
  }]
}
