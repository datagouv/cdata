import { describe, expect, it } from 'vitest'
import { normalizeSeoDescription, seoTitleWithFallback } from '~/utils/seo'

describe('normalizeSeoDescription', () => {
  it('returns undefined for null', () => {
    expect(normalizeSeoDescription(null)).toBeUndefined()
  })

  it('returns undefined for undefined', () => {
    expect(normalizeSeoDescription(undefined)).toBeUndefined()
  })

  it('returns undefined for an empty string', () => {
    expect(normalizeSeoDescription('')).toBeUndefined()
  })

  it('returns undefined for a whitespace-only string', () => {
    expect(normalizeSeoDescription('   \n\t  ')).toBeUndefined()
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeSeoDescription('  Texte réel  ')).toBe('Texte réel')
  })

  it('collapses internal whitespace runs, including newlines, to a single space', () => {
    expect(normalizeSeoDescription('Ligne 1\n\nLigne 2   suite')).toBe('Ligne 1 Ligne 2 suite')
  })

  it('leaves an already-normalized description untouched', () => {
    expect(normalizeSeoDescription('Texte réel')).toBe('Texte réel')
  })
})

describe('seoTitleWithFallback', () => {
  it('uses the site title only when a page title is missing', () => {
    expect(seoTitleWithFallback(undefined, 'data.gouv.fr')).toBe('data.gouv.fr')
    expect(seoTitleWithFallback('Dataset title', 'data.gouv.fr')).toBe('Dataset title')
  })
})
