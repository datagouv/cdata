/**
 * Normalizes a description for SEO meta tags (`name="description"`, `og:description`):
 * collapses internal whitespace runs (newlines, repeated spaces) to a single space and
 * trims the ends, so multi-line source text renders as a single-line tag. Returns
 * `undefined` for a nullish or blank input, leaving the site-wide description in place
 * at the page boundary instead of emitting an empty tag.
 */
export function normalizeSeoDescription(description: string | null | undefined): string | undefined {
  const normalized = description?.replace(/\s+/g, ' ').trim()
  return normalized || undefined
}
