import { describe, expect, it } from 'vitest'
import { cadaMeaningTone, cadaPartLabel, splitCadaValues } from '~/utils/cada'

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

describe('cadaMeaningTone', () => {
  it('marks a negative conclusion as an error', () => {
    expect(cadaMeaningTone('Défavorable')).toBe('danger')
    expect(cadaMeaningTone('Refus')).toBe('danger')
  })

  it('marks a positive conclusion as a success', () => {
    expect(cadaMeaningTone('Favorable')).toBe('success')
    expect(cadaMeaningTone('La commission recommande')).toBe('success')
  })

  it('does not read "défavorable" as "favorable"', () => {
    expect(cadaMeaningTone('Défavorable/Sauf vie privée')).toBe('danger')
    expect(cadaMeaningTone('défavorable')).toBe('danger')
  })

  it('falls back to a warning for any other conclusion', () => {
    expect(cadaMeaningTone('Incompétence')).toBe('warning')
    expect(cadaMeaningTone('Sans objet')).toBe('warning')
  })
})
