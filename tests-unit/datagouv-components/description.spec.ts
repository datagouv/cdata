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
})
