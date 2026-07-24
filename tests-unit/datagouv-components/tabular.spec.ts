import { describe, expect, it } from 'vitest'
import type { ColumnFilters, ColumnType } from '~/datagouv-components/src/components/TabularExplorer/types'
import { hasFilterForColumn, resolveColumnType, buildGlobalSearchConditions } from '~/datagouv-components/src/functions/tabular'

const has = (filter?: ColumnFilters) => hasFilterForColumn(filter ? { price: filter } : {}, 'price')

describe('hasFilterForColumn', () => {
  it('is false without any filter for the column', () => {
    expect(has()).toBe(false)
    expect(has({})).toBe(false)
    expect(has({ in: [] })).toBe(false)
  })

  it('counts zero as an active min/max bound', () => {
    // `0` is a meaningful bound: detection must use `!= null`, not truthiness
    expect(has({ min: 0 })).toBe(true)
    expect(has({ max: 0 })).toBe(true)
  })

  it('counts an empty exact filter as active, unlike contains', () => {
    // `exact` uses `!= null` (filtering on the empty value is meaningful),
    // `contains` uses truthiness (an empty needle filters nothing)
    expect(has({ exact: '' })).toBe(true)
  })

  it('detects the other filter kinds', () => {
    expect(has({ in: ['a'] })).toBe(true)
    expect(has({ contains: 'needle' })).toBe(true)
    expect(has({ null: 'only' })).toBe(true)
  })

  it('ignores an empty contains filter', () => {
    expect(has({ contains: '' })).toBe(false)
  })
})

describe('resolveColumnType', () => {
  it('resolves int/float as number', () => {
    expect(resolveColumnType({ python_type: 'int' }, false)).toBe('number')
    expect(resolveColumnType({ python_type: 'float' }, false)).toBe('number')
  })

  it('resolves year format as year regardless of python_type', () => {
    expect(resolveColumnType({ python_type: 'int', format: 'year' }, false)).toBe('year')
    expect(resolveColumnType({ python_type: 'string', format: 'year' }, false)).toBe('year')
  })

  it('resolves date/datetime as date', () => {
    expect(resolveColumnType({ python_type: 'date' }, false)).toBe('date')
    expect(resolveColumnType({ python_type: 'datetime' }, false)).toBe('date')
  })

  it('resolves bool as boolean', () => {
    expect(resolveColumnType({ python_type: 'bool' }, false)).toBe('boolean')
  })

  it('resolves categorical when isCategorical is true', () => {
    expect(resolveColumnType({ python_type: 'string' }, true)).toBe('categorical')
  })

  it('resolves everything else as text', () => {
    expect(resolveColumnType({ python_type: 'string' }, false)).toBe('text')
    expect(resolveColumnType({ python_type: 'json' }, false)).toBe('text')
  })
})

describe('global search query conditions', () => {
  const cadaColumns = [
    'Numéro de dossier', 'Administration', 'Type', 'Année', 'Séance',
    'Objet', 'Thème et sous thème', 'Mots clés', 'Sens et motivation', 'Partie', 'Avis',
  ]

  function typeForCadaCol(col: string): ColumnType {
    const map: Record<string, ColumnType> = {
      'Numéro de dossier': 'number',
      'Administration': 'text',
      'Type': 'categorical',
      'Année': 'year',
      'Séance': 'date',
      'Objet': 'text',
      'Thème et sous thème': 'categorical',
      'Mots clés': 'text',
      'Sens et motivation': 'text',
      'Partie': 'categorical',
      'Avis': 'text',
    }
    return map[col] ?? 'text'
  }

  it('adds __contains for text and categorical columns, __exact for number columns with numeric search', () => {
    const conditions = buildGlobalSearchConditions(cadaColumns, typeForCadaCol, '19950248')

    // Number columns get __exact
    expect(conditions).toContain('Numéro de dossier__exact.19950248')

    // Text columns get __contains
    expect(conditions).toContain('Administration__contains.19950248')
    expect(conditions).toContain('Objet__contains.19950248')
    expect(conditions).toContain('Mots clés__contains.19950248')
    expect(conditions).toContain('Sens et motivation__contains.19950248')
    expect(conditions).toContain('Avis__contains.19950248')

    // Categorical columns get __contains
    expect(conditions).toContain('Type__contains.19950248')
    expect(conditions).toContain('Thème et sous thème__contains.19950248')
    expect(conditions).toContain('Partie__contains.19950248')

    // Date, year and boolean columns are excluded
    expect(conditions.find(c => c.startsWith('Séance__'))).toBeUndefined()
    expect(conditions.find(c => c.startsWith('Année__'))).toBeUndefined()

    // All 11 columns: 1 number (__exact) + 5 text (__contains) + 3 categorical (__contains) + 1 date + 1 year (excluded)
    expect(conditions).toHaveLength(9)
  })

  it('skips __exact on number columns for non-numeric search', () => {
    const conditions = buildGlobalSearchConditions(cadaColumns, typeForCadaCol, 'cheval')

    // No __exact conditions
    expect(conditions.find(c => c.includes('__exact'))).toBeUndefined()

    // Text/categorical still get __contains
    expect(conditions.find(c => c.includes('__contains'))).toBeDefined()

    // Date column is excluded
    expect(conditions.find(c => c.startsWith('Séance__'))).toBeUndefined()
  })

  it('encodes special characters in the search value', () => {
    const conditions = buildGlobalSearchConditions(['Administration'], typeForCadaCol, 'min+max')
    expect(conditions[0]).toBe('Administration__contains.min%2Bmax')
  })

  it('only adds __exact for number columns when search is a valid number', () => {
    const cols = ['id', 'name', 'score']
    const types: Record<string, ColumnType> = { id: 'number', name: 'text', score: 'number' }

    const numeric = buildGlobalSearchConditions(cols, c => types[c], '42')
    expect(numeric).toContain('id__exact.42')
    expect(numeric).toContain('score__exact.42')
    expect(numeric).toContain('name__contains.42')

    const nonNumeric = buildGlobalSearchConditions(cols, c => types[c], 'abc')
    expect(nonNumeric.find(c => c.includes('__exact'))).toBeUndefined()
    expect(nonNumeric).toContain('name__contains.abc')
  })
})
