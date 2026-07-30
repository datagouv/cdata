import { describe, expect, it } from 'vitest'
import { cadaMeaningBadgeClass, cadaPartLabel, splitCadaValues } from '~/utils/cada'

describe('splitCadaValues', () => {
  it('returns an empty list for an empty value', () => {
    expect(splitCadaValues(null)).toEqual([])
    expect(splitCadaValues(undefined)).toEqual([])
    expect(splitCadaValues('')).toEqual([])
  })

  it('splits on commas and trims each value', () => {
    expect(splitCadaValues('Agriculture, Environnement')).toEqual(['Agriculture', 'Environnement'])
    expect(splitCadaValues('Agriculture,Environnement')).toEqual(['Agriculture', 'Environnement'])
    expect(splitCadaValues('  Agriculture ,   Environnement  ')).toEqual(['Agriculture', 'Environnement'])
  })

  it('drops the empty parts of a trailing or doubled comma', () => {
    expect(splitCadaValues('Agriculture,')).toEqual(['Agriculture'])
    expect(splitCadaValues('Agriculture,, Environnement')).toEqual(['Agriculture', 'Environnement'])
    expect(splitCadaValues(',')).toEqual([])
  })

  it('keeps the hierarchy inside a value', () => {
    expect(splitCadaValues('Agriculture/Secteurs Économiques, Environnement'))
      .toEqual(['Agriculture/Secteurs Économiques', 'Environnement'])
  })
})

describe('cadaPartLabel', () => {
  it('returns an empty label when the advice has no Partie', () => {
    expect(cadaPartLabel(null)).toBe('')
    expect(cadaPartLabel(undefined)).toBe('')
    expect(cadaPartLabel('')).toBe('')
  })

  it('maps every roman numeral to its label', () => {
    expect(cadaPartLabel('I')).toBe('Avec audition de l\'administration')
    expect(cadaPartLabel('II')).toBe('Affaire de principe')
    expect(cadaPartLabel('III')).toBe('Affaire courante')
    expect(cadaPartLabel('IV')).toBe('Délégué')
  })

  it('ignores the surrounding whitespace of the source data', () => {
    expect(cadaPartLabel(' II ')).toBe('Affaire de principe')
  })

  it('falls back to the raw value for an unknown numeral', () => {
    expect(cadaPartLabel('V')).toBe('V')
  })
})

describe('cadaMeaningBadgeClass', () => {
  it('marks a negative conclusion as an error', () => {
    expect(cadaMeaningBadgeClass('Défavorable')).toBe('fr-badge--error')
    expect(cadaMeaningBadgeClass('Refus')).toBe('fr-badge--error')
  })

  it('marks a positive conclusion as a success', () => {
    expect(cadaMeaningBadgeClass('Favorable')).toBe('fr-badge--success')
    expect(cadaMeaningBadgeClass('La commission recommande')).toBe('fr-badge--success')
  })

  it('does not read "défavorable" as "favorable"', () => {
    expect(cadaMeaningBadgeClass('Défavorable/Sauf vie privée')).toBe('fr-badge--error')
    expect(cadaMeaningBadgeClass('défavorable')).toBe('fr-badge--error')
  })

  it('falls back to a warning for any other conclusion', () => {
    expect(cadaMeaningBadgeClass('Incompétence')).toBe('fr-badge--warning')
    expect(cadaMeaningBadgeClass('Sans objet')).toBe('fr-badge--warning')
  })
})
