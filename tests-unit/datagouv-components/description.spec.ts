import { describe, expect, it } from 'vitest'
import { DESCRIPTION_SHORT_MAX_LENGTH, getDescriptionShort } from '~/datagouv-components/src/functions/description'

describe('getDescriptionShort', () => {
  it('collapses newlines and repeated whitespace into single spaces', () => {
    const result = getDescriptionShort({ description: 'Ligne 1\n\nLigne 2   suite', description_short: null })
    expect(result).toBe('Ligne 1 Ligne 2 suite')
  })

  it('collapses whitespace in an explicit description_short too', () => {
    const result = getDescriptionShort({ description: null, description_short: 'Court\nsur plusieurs lignes' })
    expect(result).toBe('Court sur plusieurs lignes')
  })

  it('prefers description_short over description when both are provided', () => {
    const result = getDescriptionShort({ description: 'A long description that would be truncated', description_short: 'Short one' })
    expect(result).toBe('Short one')
  })

  it('truncates a long plain description to the short limit', () => {
    const long = 'a'.repeat(DESCRIPTION_SHORT_MAX_LENGTH + 50)
    const result = getDescriptionShort({ description: long, description_short: null })
    expect(result).toHaveLength(DESCRIPTION_SHORT_MAX_LENGTH)
    expect(result.endsWith('…')).toBe(true)
  })

  it('keeps markdown input single-line', () => {
    const markdown = '## Titre\n\nUn paragraphe\nsur plusieurs lignes.\n\n- item 1\n- item 2'
    const result = getDescriptionShort({ description: markdown, description_short: null })
    expect(result).not.toContain('\n')
    expect(result).toContain('Titre')
    expect(result).toContain('paragraphe')
  })

  it('returns an empty string for a whitespace-only description', () => {
    expect(getDescriptionShort({ description: '  \n\n  ', description_short: null })).toBe('')
    expect(getDescriptionShort({ description: null, description_short: '  ' })).toBe('')
  })

  it('does not truncate at exactly the short limit', () => {
    const exact = 'b'.repeat(DESCRIPTION_SHORT_MAX_LENGTH)
    const result = getDescriptionShort({ description: exact, description_short: null })
    expect(result).toHaveLength(DESCRIPTION_SHORT_MAX_LENGTH)
    expect(result.endsWith('…')).toBe(false)
  })
})
