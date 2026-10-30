import { describe, expect, it } from 'vitest'
import type { ColumnDefinition } from '@datagouv/components-next'
import { buildDefaultQuery } from '~/components/Charts/defaultChartQuery'

function column(name: string, type: ColumnDefinition['type']): ColumnDefinition {
  return { name, type }
}

describe('buildDefaultQuery', () => {
  it('picks the first name matching the X pattern and the first numeric column for Y', () => {
    const columns = [
      column('libelle', 'text'),
      column('Région', 'categorical'),
      column('Nombre de logements', 'number'),
      column('nb2', 'number'),
    ]

    expect(buildDefaultQuery(columns)).toBe('SELECT "Région", "Nombre de logements" FROM data ORDER BY "Nombre de logements" DESC LIMIT 20')
  })

  it('matches the unaccented and uppercase X variants (annee, ANNEE)', () => {
    const columns = [column('ANNEE', 'number'), column('taux', 'number')]

    expect(buildDefaultQuery(columns)).toBe('SELECT "ANNEE", "taux" FROM data ORDER BY "taux" DESC LIMIT 20')
  })

  it('does not match "region" without the accent: falls back to the first column', () => {
    const columns = [column('id', 'number'), column('nom_region', 'categorical'), column('nb', 'number')]

    expect(buildDefaultQuery(columns)).toBe('SELECT "id", "nb" FROM data ORDER BY "nb" DESC LIMIT 20')
  })

  it('falls back to the first column when no name matches the X pattern', () => {
    const columns = [column('libelle', 'text'), column('valeur', 'number')]

    expect(buildDefaultQuery(columns)).toBe('SELECT "libelle", "valeur" FROM data ORDER BY "valeur" DESC LIMIT 20')
  })

  it('never picks the same column for X and Y', () => {
    const columns = [column('année', 'number'), column('taux', 'number')]

    expect(buildDefaultQuery(columns)).toBe('SELECT "année", "taux" FROM data ORDER BY "taux" DESC LIMIT 20')
  })

  it('falls back to SELECT * when no numeric column exists', () => {
    const columns = [column('nom_region', 'categorical'), column('libelle', 'text')]

    expect(buildDefaultQuery(columns)).toBe('SELECT * FROM data LIMIT 20')
  })

  it('returns an empty string when the resource has no columns', () => {
    expect(buildDefaultQuery([])).toBe('')
  })

  it('escapes double quotes in column names', () => {
    const columns = [column('région " sud"', 'categorical'), column('nb', 'number')]

    expect(buildDefaultQuery(columns)).toBe('SELECT "région "" sud""", "nb" FROM data ORDER BY "nb" DESC LIMIT 20')
  })
})
