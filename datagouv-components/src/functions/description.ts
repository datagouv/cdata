import { removeMarkdownSync } from './markdown'

// Dataset description constants
export const DESCRIPTION_SHORT_MAX_LENGTH = 200
export const DESCRIPTION_MIN_LENGTH = 200

/**
 * Returns the short description to display.
 * If description_short is provided, it is used.
 * Otherwise, the first DESCRIPTION_SHORT_MAX_LENGTH characters of description are used.
 */
export function getDescriptionShort(
  description: string | null | undefined,
  descriptionShort?: string | null | undefined,
) {
  if (descriptionShort?.trim()) {
    return descriptionShort
  }
  if (description?.trim()) {
    // description field is a markdown field that may contain HTML tags, so we should trim it
    const plainText = removeMarkdownSync(description).trim()
    if (plainText.length > DESCRIPTION_SHORT_MAX_LENGTH) {
      return `${plainText.substring(0, DESCRIPTION_SHORT_MAX_LENGTH - 1)}…`
    }
    return plainText
  }
  return ''
}
