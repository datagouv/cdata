import { describe, expect, it } from 'vitest'
import { DESCRIPTION_SHORT_MAX_LENGTH, getDescriptionShort } from '~/datagouv-components/src/functions/description'

// The output feeds HTML meta tags (name="description", og:description): the head
// renderer silently drops a meta whose content contains a raw newline, so the
// short description must be single-line.
describe('getDescriptionShort', () => {
  it('collapses newlines and repeated whitespace into single spaces', () => {
    const result = getDescriptionShort({ description: 'Ligne 1\n\nLigne 2   suite', descriptionShort: null })
    expect(result).toBe('Ligne 1 Ligne 2 suite')
  })

  it('collapses whitespace in an explicit descriptionShort too', () => {
    const result = getDescriptionShort({ description: null, descriptionShort: 'Court\nsur plusieurs lignes' })
    expect(result).toBe('Court sur plusieurs lignes')
  })

  it('truncates a long plain description to the short limit', () => {
    const long = 'a'.repeat(DESCRIPTION_SHORT_MAX_LENGTH + 50)
    const result = getDescriptionShort({ description: long, descriptionShort: null })
    expect(result).toHaveLength(DESCRIPTION_SHORT_MAX_LENGTH)
    expect(result.endsWith('…')).toBe(true)
  })

  it('keeps markdown input single-line (the production bug path)', () => {
    const markdown = '## Titre\n\nUn paragraphe\nsur plusieurs lignes.\n\n- item 1\n- item 2'
    const result = getDescriptionShort({ description: markdown, descriptionShort: null })
    expect(result).not.toContain('\n')
    expect(result).toContain('Titre')
    expect(result).toContain('paragraphe')
  })

  it('returns an empty string for a whitespace-only description', () => {
    expect(getDescriptionShort({ description: '  \n\n  ', descriptionShort: null })).toBe('')
    expect(getDescriptionShort({ description: null, descriptionShort: '  ' })).toBe('')
  })

  it('does not truncate at exactly the short limit', () => {
    const exact = 'b'.repeat(DESCRIPTION_SHORT_MAX_LENGTH)
    const result = getDescriptionShort({ description: exact, descriptionShort: null })
    expect(result).toHaveLength(DESCRIPTION_SHORT_MAX_LENGTH)
    expect(result.endsWith('…')).toBe(false)
  })
})
