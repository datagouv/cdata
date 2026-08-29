import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useColumnMetadata } from '~/datagouv-components/src/components/TabularExplorer/useColumnMetadata'
import type { TabularProfileResponse } from '~/datagouv-components/src/components/TabularExplorer/types'
import type { TranslationFunction } from '~/datagouv-components/src/composables/useTranslation'

const t: TranslationFunction = key => key

// The profile the API returns for a parquet resource: csv-detective only runs on
// CSVs, so `categorical`, `profile` and the rest of its output are missing.
const parquetProfile: TabularProfileResponse = {
  profile: {
    header: ['code_insee', 'population'],
    columns: {
      code_insee: { format: 'string', python_type: 'string' },
      population: { format: 'int', python_type: 'int' },
    },
    total_lines: 35000,
  },
  deleted_at: null,
  dataset_id: 'dataset-1',
  indexes: null,
}

describe('useColumnMetadata on a profile without csv-detective output', () => {
  const metadata = useColumnMetadata(ref(parquetProfile), ['code_insee', 'population'], t)

  it('resolves types from the python type alone, without a categorical list', () => {
    expect(metadata.getColumnType('code_insee')).toBe('text')
    expect(metadata.getColumnType('population')).toBe('number')
  })

  it('falls back to the type display when no column profile is available', () => {
    expect(metadata.getColumnDisplay('code_insee').label).toBe('Texte')
    expect(metadata.getColumnProfile('code_insee')).toBeNull()
    expect(metadata.getNullPercent('code_insee')).toBe('0%')
    expect(metadata.getBooleanCounts('code_insee')).toEqual({ trueCount: 0, falseCount: 0 })
  })
})

describe('useColumnMetadata on a full csv-detective profile', () => {
  const csvProfile: TabularProfileResponse = {
    ...parquetProfile,
    profile: {
      ...parquetProfile.profile,
      categorical: ['code_insee'],
      formats: {},
      profile: {
        code_insee: { tops: [], nb_distinct: 3, nb_missing_values: 3500 },
        population: { tops: [], nb_distinct: 100, nb_missing_values: 0 },
      },
    },
  }
  const metadata = useColumnMetadata(ref(csvProfile), ['code_insee', 'population'], t)

  it('marks a column listed as categorical', () => {
    expect(metadata.getColumnType('code_insee')).toBe('categorical')
    expect(metadata.getColumnDisplay('code_insee').label).toBe('Catégoriel')
  })

  it('computes the null ratio from the column profile', () => {
    expect(metadata.getNullPercent('code_insee')).toBe('10.0%')
  })
})
