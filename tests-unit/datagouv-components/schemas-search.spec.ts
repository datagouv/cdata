import { describe, expect, it } from 'vitest'
import { schemaMatchesQuery } from '~/datagouv-components/src/functions/schemas'
import type { RegisteredSchema } from '~/datagouv-components/src/types/schemas'

// Names and titles are the real ones, since what is tested is how people type them
const schema = (name: string, title: string, description = ''): RegisteredSchema =>
  ({ name, title, description } as RegisteredSchema)

const LAVE_LINGE = schema('etalab/indice-durabilite-lave-linge', 'Indice de durabilité - Lave-linge')
const TELEVISEUR = schema('etalab/indice-durabilite-televiseur', 'Indice de durabilité - Téléviseur')
const REPARABILITE = schema('etalab/schema-indice-reparabilite', 'Indice de réparabilité')
const IRVE = schema('etalab/schema-irve-statique', 'IRVE statique', 'Bornes de recharge')

describe('schemaMatchesQuery', () => {
  it('matches a hyphenated title typed with a space', () => {
    expect(schemaMatchesQuery(LAVE_LINGE, 'lave linge')).toBe(true)
    expect(schemaMatchesQuery(TELEVISEUR, 'lave linge')).toBe(false)
  })

  it('matches an accented title typed without accents', () => {
    expect(schemaMatchesQuery(REPARABILITE, 'reparabilite')).toBe(true)
    expect(schemaMatchesQuery(REPARABILITE, 'réparabilité')).toBe(true)
  })

  it('matches the technical identifier people copy', () => {
    expect(schemaMatchesQuery(IRVE, 'etalab/schema-irve-statique')).toBe(true)
    expect(schemaMatchesQuery(LAVE_LINGE, 'etalab/schema-irve-statique')).toBe(false)
  })

  it('searches the description too', () => {
    expect(schemaMatchesQuery(IRVE, 'bornes recharge')).toBe(true)
  })

  it('requires every word of the query', () => {
    expect(schemaMatchesQuery(LAVE_LINGE, 'durabilite linge')).toBe(true)
    expect(schemaMatchesQuery(LAVE_LINGE, 'durabilite televiseur')).toBe(false)
  })

  it('matches everything when the query holds no word', () => {
    expect(schemaMatchesQuery(LAVE_LINGE, '')).toBe(true)
    expect(schemaMatchesQuery(LAVE_LINGE, '   ')).toBe(true)
  })
})
