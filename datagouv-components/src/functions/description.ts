import { removeMarkdownSync } from './markdown'

// Dataset description constants

// Form validation (client-side rules)
export const DESCRIPTION_SHORT_MAX_LENGTH = 200 // max for `description_short` (+ truncation/output cap)
export const DESCRIPTION_MIN_LENGTH = 200 // min (recommendation) for `description` (not AI gating)

// AI gating (enable AI suggestions; not validation)
export const AI_SUGGESTION_MIN_DESCRIPTION_LENGTH = 200 // min `description` length to enable suggestions

/**
 * Returns the short description to display.
 * If description_short is provided, it is used.
 * Otherwise, the first DESCRIPTION_SHORT_MAX_LENGTH characters of description are used.
 */
export function getDescriptionShort({ description, descriptionShort }: {
  description: string | null | undefined
  descriptionShort?: string | null | undefined
}) {
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
