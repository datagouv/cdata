import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { ColumnFilters, ColumnType, DateFilter, SortConfig, TabularUrlAlias } from '~/datagouv-components/src/components/TabularExplorer/types'
import { buildCellValueFilter, buildDateFilterParams, filtersFromUrlQuery, filtersToUrlQuery, hasFilterForColumn, resolveColumnType, buildGlobalSearchConditions, searchFromUrlParam, sortFromUrlParam, sortToUrlParam, toIsoDay, useFormatTabular } from '~/datagouv-components/src/functions/tabular'

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

  it('detects a date filter', () => {
    expect(has({ date: { operator: 'is', start: '2024-04-07' } })).toBe(true)
  })
})

describe('toIsoDay', () => {
  it('keeps a plain date as-is', () => {
    expect(toIsoDay('2024-11-01')).toBe('2024-11-01')
  })

  it('keeps only the day of a timestamp', () => {
    expect(toIsoDay('2026-09-07T09:22:54.968+02:00')).toBe('2026-09-07')
  })

  it('rejects anything that is not an ISO date', () => {
    expect(toIsoDay('01/11/2024')).toBeNull()
    expect(toIsoDay('')).toBeNull()
    expect(toIsoDay(null)).toBeNull()
    expect(toIsoDay('2024-13-01')).toBeNull()
  })
})

describe('buildDateFilterParams', () => {
  const params = (filter: DateFilter) => buildDateFilterParams('published', filter)

  // Every operator becomes a half-open day interval, so the same params work on
  // a `date` column and on a `datetime` one — `resolveColumnType` merges the two,
  // and `__exact` on a bare day matches nothing.
  it('turns "is" into the whole day', () => {
    expect(params({ operator: 'is', start: '2024-04-07' })).toEqual({
      published__greater: '2024-04-07',
      published__strictly_less: '2024-04-08',
    })
  })

  it('excludes the day itself from "before"', () => {
    expect(params({ operator: 'before', start: '2024-04-07' })).toEqual({
      published__strictly_less: '2024-04-07',
    })
  })

  it('excludes the day itself from "after"', () => {
    expect(params({ operator: 'after', start: '2024-04-07' })).toEqual({
      published__greater: '2024-04-08',
    })
  })

  it('includes both ends of "between"', () => {
    expect(params({ operator: 'between', start: '2024-04-07', end: '2024-04-20' })).toEqual({
      published__greater: '2024-04-07',
      published__strictly_less: '2024-04-21',
    })
  })

  it('rolls over month and year boundaries', () => {
    expect(params({ operator: 'is', start: '2024-02-29' })).toEqual({
      published__greater: '2024-02-29',
      published__strictly_less: '2024-03-01',
    })
    expect(params({ operator: 'after', start: '2023-12-31' })).toEqual({
      published__greater: '2024-01-01',
    })
  })

  it('leaves "between" open-ended until an end date is picked', () => {
    expect(params({ operator: 'between', start: '2024-04-07' })).toEqual({
      published__greater: '2024-04-07',
    })
  })

  // `initialFilters` is a public prop, so it can carry anything: an unparseable
  // date drops the filter instead of throwing and breaking the whole explorer.
  it('drops a filter whose date is not an ISO date', () => {
    expect(params({ operator: 'is', start: '07/04/2024' })).toEqual({})
    expect(params({ operator: 'between', start: '2024-04-07', end: 'nope' })).toEqual({
      published__greater: '2024-04-07',
    })
  })
})

describe('buildCellValueFilter', () => {
  const ALL_TYPES: ColumnType[] = ['number', 'categorical', 'text', 'date', 'boolean', 'year']

  it('filters on the missing values whatever the type of an empty cell', () => {
    // An empty cell used to be turned into an empty `__in` / `__exact` param,
    // which the Tabular API rejects with a 400 the browser reports as a network
    // error — and into `0` on a number column, silently filtering on a value
    // the cell does not hold.
    for (const type of ALL_TYPES) {
      expect(buildCellValueFilter(type, null, {})).toEqual({ null: 'only' })
      expect(buildCellValueFilter(type, '', {})).toEqual({ null: 'only' })
    }
  })

  it('keeps the filters already set on the column', () => {
    expect(buildCellValueFilter('text', null, { contains: 'needle' })).toEqual({ contains: 'needle', null: 'only' })
    expect(buildCellValueFilter('text', 'Ain', { in: ['Aisne'] })).toEqual({ in: ['Aisne', 'Ain'] })
  })

  it('adds a value to the selection of the value-based types', () => {
    for (const type of ['categorical', 'text', 'year'] as const) {
      expect(buildCellValueFilter(type, 'Ain', {})).toEqual({ in: ['Ain'] })
    }
  })

  it('does not select an already selected value twice', () => {
    expect(buildCellValueFilter('text', 'Ain', { in: ['Ain'] })).toEqual({ in: ['Ain'] })
  })

  it('pins a number column to the exact value, zero included', () => {
    expect(buildCellValueFilter('number', 42, {})).toEqual({ min: 42, max: 42 })
    expect(buildCellValueFilter('number', 0, {})).toEqual({ min: 0, max: 0 })
  })

  it('leaves the filters untouched when a number cell holds no number', () => {
    expect(buildCellValueFilter('number', 'N/A', { contains: 'needle' })).toEqual({ contains: 'needle' })
  })

  it('selects the day a date cell falls on', () => {
    expect(buildCellValueFilter('date', '2026-09-07T09:22:54.968+02:00', {}))
      .toEqual({ date: { operator: 'is', start: '2026-09-07' } })
  })

  it('leaves the filters untouched when a date cell holds no ISO date', () => {
    expect(buildCellValueFilter('date', '07/09/2026', { contains: 'needle' })).toEqual({ contains: 'needle' })
  })

  it('matches a boolean cell exactly', () => {
    expect(buildCellValueFilter('boolean', true, {})).toEqual({ exact: 'true' })
    expect(buildCellValueFilter('boolean', false, {})).toEqual({ exact: 'false' })
  })
})

describe('filters in the URL', () => {
  const ALIASES: Record<string, TabularUrlAlias> = {
    administration: { column: 'Administration', operator: 'contains' },
    part: { column: 'Partie', operator: 'exact' },
  }

  const COLUMNS = ['Administration', 'Partie', 'Type', 'Année', 'Mots clés', 'Séance', 'Objet']

  const roundTrip = (filters: Record<string, ColumnFilters>) =>
    filtersFromUrlQuery(filtersToUrlQuery(filters, ALIASES), ALIASES, COLUMNS)

  it('writes a filter matching an alias under that alias only', () => {
    expect(filtersToUrlQuery({ Administration: { contains: 'Mairie' }, Partie: { exact: 'II' } }, ALIASES)).toStrictEqual({
      administration: 'Mairie',
      part: 'II',
    })
  })

  it('writes a column with more than its alias criterion into the JSON param', () => {
    const query = filtersToUrlQuery({ Administration: { contains: 'Mairie', null: 'exclude' } }, ALIASES)
    expect(query.administration).toBeUndefined()
    expect(JSON.parse(query.filters!)).toEqual({ Administration: { contains: 'Mairie', null: 'exclude' } })
  })

  it('writes a criterion of another operator than the alias into the JSON param', () => {
    const query = filtersToUrlQuery({ Partie: { contains: 'I' } }, ALIASES)
    expect(query.part).toBeUndefined()
    expect(JSON.parse(query.filters!)).toEqual({ Partie: { contains: 'I' } })
  })

  it('writes no param once the filters are gone', () => {
    expect(filtersToUrlQuery({}, ALIASES)).toStrictEqual({})
  })

  it('leaves out the columns without any criterion left', () => {
    // Removing the last criterion of a column leaves `{}` or an empty `in` behind
    expect(filtersToUrlQuery({ Administration: {}, Type: { in: [] }, Objet: { contains: '' } }, ALIASES).filters)
      .toBeUndefined()
  })

  it('reads back every kind of filter it wrote', () => {
    const filters: Record<string, ColumnFilters> = {
      'Administration': { contains: 'Mairie' },
      'Partie': { exact: 'II' },
      'Type': { in: ['Avis', 'Conseil'] },
      'Année': { min: 2010, max: 2015 },
      'Mots clés': { null: 'only' },
      'Séance': { date: { operator: 'between', start: '2015-06-11', end: '2015-06-18' } },
      'Objet': { contains: 'cheval', null: 'exclude' },
    }
    expect(roundTrip(filters)).toEqual(filters)
  })

  it('reads the first value of a repeated param', () => {
    expect(filtersFromUrlQuery({ part: ['II', 'III'] }, ALIASES, COLUMNS)).toEqual({ Partie: { exact: 'II' } })
  })

  it('ignores a JSON param that is not JSON, or not an object of filters', () => {
    expect(filtersFromUrlQuery({ filters: '{nope' }, ALIASES, COLUMNS)).toEqual({})
    expect(filtersFromUrlQuery({ filters: '["Type"]' }, ALIASES, COLUMNS)).toEqual({})
  })

  it('drops the filters on a column the resource does not have', () => {
    // The Tabular API answers 400 to a query naming an unknown column
    const query = {
      administration: 'Mairie',
      filters: JSON.stringify({ Type: { in: ['Avis'] }, Renamed: { contains: 'x' } }),
    }
    expect(filtersFromUrlQuery(query, ALIASES, ['Type'])).toEqual({ Type: { in: ['Avis'] } })
  })

  it('drops the criteria of the wrong type a hand-edited URL can carry', () => {
    // `in` is joined and `date` read as an object when the query is built:
    // letting a string or a bare value through would throw there
    const query = {
      filters: JSON.stringify({
        Type: { in: 'Avis', contains: 'ok' },
        Séance: { date: '2015-06-18' },
        Année: { min: '2010', null: 'sometimes' },
      }),
    }
    expect(filtersFromUrlQuery(query, ALIASES, COLUMNS)).toEqual({ Type: { contains: 'ok' } })
  })

  it('drops a date filter with an unknown operator', () => {
    const query = { filters: JSON.stringify({ Séance: { date: { operator: 'around', start: '2015-06-18' } } }) }
    expect(filtersFromUrlQuery(query, ALIASES, COLUMNS)).toEqual({})
  })
})

describe('sort in the URL', () => {
  const DEFAULT: SortConfig = { column: 'Séance', direction: 'desc' }
  const COLUMNS = ['Séance', 'Année']

  it('keeps the default sort out of the URL', () => {
    expect(sortToUrlParam(DEFAULT, DEFAULT)).toBeUndefined()
    expect(sortFromUrlParam(undefined, DEFAULT, COLUMNS)).toEqual(DEFAULT)
  })

  it('writes a descending sort with a leading dash', () => {
    const sort: SortConfig = { column: 'Année', direction: 'desc' }
    expect(sortToUrlParam(sort, DEFAULT)).toBe('-Année')
    expect(sortFromUrlParam('-Année', DEFAULT, COLUMNS)).toEqual(sort)
  })

  it('writes an ascending sort as the bare column', () => {
    const sort: SortConfig = { column: 'Séance', direction: 'asc' }
    expect(sortToUrlParam(sort, DEFAULT)).toBe('Séance')
    expect(sortFromUrlParam('Séance', DEFAULT, COLUMNS)).toEqual(sort)
  })

  it('writes a dropped default sort as an empty param, so it is not restored', () => {
    expect(sortToUrlParam(null, DEFAULT)).toBe('')
    expect(sortFromUrlParam('', DEFAULT, COLUMNS)).toBeNull()
  })

  it('needs no param for the absence of sort when there is no default one', () => {
    expect(sortToUrlParam(null, null)).toBeUndefined()
    expect(sortFromUrlParam(undefined, null, COLUMNS)).toBeNull()
  })

  it('falls back to the default sort on a column the resource does not have', () => {
    expect(sortFromUrlParam('-Renamed', DEFAULT, COLUMNS)).toEqual(DEFAULT)
    // A bare dash names the empty column
    expect(sortFromUrlParam('-', DEFAULT, COLUMNS)).toEqual(DEFAULT)
  })
})

describe('search in the URL', () => {
  it('reads no search from an absent param', () => {
    expect(searchFromUrlParam(undefined)).toBe('')
    expect(searchFromUrlParam(null)).toBe('')
  })

  it('reads the first value of a repeated param', () => {
    expect(searchFromUrlParam(['cheval', 'vache'])).toBe('cheval')
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

  it('resolves json and geojson as text, or categorical when they are', () => {
    expect(resolveColumnType({ python_type: 'json' }, false)).toBe('text')
    expect(resolveColumnType({ python_type: 'json' }, true)).toBe('categorical')
    expect(resolveColumnType({ python_type: 'string', format: 'geojson' }, false)).toBe('text')
  })

  it('resolves everything else as text', () => {
    expect(resolveColumnType({ python_type: 'string' }, false)).toBe('text')
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

  it('encodes the characters of the or(...) grammar the API would fail to parse', () => {
    // A raw dot ends the operator, a raw parenthesis closes the expression:
    // either one makes the API reject the whole query with a 400.
    expect(buildGlobalSearchConditions(['Objet'], typeForCadaCol, 'art. 6'))
      .toEqual(['Objet__contains.art%252E%206'])
    expect(buildGlobalSearchConditions(['Objet'], typeForCadaCol, 'mairie (Paris)'))
      .toEqual(['Objet__contains.mairie%20%2528Paris%2529'])
    expect(buildGlobalSearchConditions(['Objet'], typeForCadaCol, 'a,b'))
      .toEqual(['Objet__contains.a%2Cb'])
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

  it('rejects the numeric-looking values the API cannot parse as a number', () => {
    const cols = ['id', 'name']
    const types: Record<string, ColumnType> = { id: 'number', name: 'text' }

    // `Number()` accepts all of these, the number column does not — and one bad
    // condition makes the API reject the whole `or(...)`.
    for (const value of ['0x10', '1e5', ' ', '+42', '42px']) {
      const conditions = buildGlobalSearchConditions(cols, c => types[c], value)
      expect(conditions.find(c => c.includes('__exact')), value).toBeUndefined()
    }

    // The decimal separator is encoded like any other dot of the grammar
    expect(buildGlobalSearchConditions(cols, c => types[c], '-12.5')).toContain('id__exact.-12%252E5')
  })

  it('excludes date, year and boolean columns from global search', () => {
    const cols = ['a_date', 'a_year', 'a_bool', 'a_text']
    const types: Record<string, ColumnType> = {
      a_date: 'date',
      a_year: 'year',
      a_bool: 'boolean',
      a_text: 'text',
    }
    const conditions = buildGlobalSearchConditions(cols, c => types[c], 'search')
    expect(conditions.find(c => c.startsWith('a_date__'))).toBeUndefined()
    expect(conditions.find(c => c.startsWith('a_year__'))).toBeUndefined()
    expect(conditions.find(c => c.startsWith('a_bool__'))).toBeUndefined()
    expect(conditions).toContain('a_text__contains.search')
    expect(conditions).toHaveLength(1)
  })
})

describe('formatCellDate', () => {
  // The shift only shows up away from UTC: read as an instant, a bare day lands on
  // the day before here — in the table cells as well as in the filter chips.
  beforeAll(() => vi.stubEnv('TZ', 'America/Cayenne'))
  afterAll(() => vi.unstubAllEnvs())

  it('shows the day the API sent, whatever the reader timezone', () => {
    const { formatCellDate } = useFormatTabular()
    expect(formatCellDate('2015-06-18')).toBe('18/06/2015')
  })

  it('still reads a timestamp as the instant it is', () => {
    const { formatCellDate } = useFormatTabular()
    expect(formatCellDate('2015-06-18T09:30:00Z')).toBe('18/06/2015')
  })

  it('falls back to the raw value it cannot read as a date', () => {
    const { formatCellDate } = useFormatTabular()
    expect(formatCellDate('')).toBe('–')
    expect(formatCellDate(null)).toBe('–')
    expect(formatCellDate('pas une date')).toBe('pas une date')
  })
})
