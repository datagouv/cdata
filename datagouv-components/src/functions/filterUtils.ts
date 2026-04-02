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
 * Maps Tabular API operators to frontend filter conditions
 */
export const OPERATOR_TO_CONDITION: Record<string, FilterCondition> = {
  exact: 'exact',
  differs: 'differs',
  isnull: 'is_null',
  isnotnull: 'is_not_null',
  greater: 'greater',
  less: 'less',
  strictly_greater: 'strictly_greater',
  strictly_less: 'strictly_less',
}

/**
 * Converts a Filter API format object to the frontend Filter format
 */
export function filterFromApiFormat(filter: Array<{
  column: string
  operator: string
  value?: string
}> | undefined): Filter | undefined {
  if (!filter || filter.length === 0) return undefined
  
  const filterObj = filter[0]
  const condition = OPERATOR_TO_CONDITION[filterObj.operator]
  if (!condition) return undefined
  
  return {
    column: filterObj.column,
    condition,
    value: filterObj.value || undefined,
  }
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
