/** Normalize SEO descriptions and omit blanks to preserve the site-wide fallback. */
export function normalizeSeoDescription(description: string | null | undefined): string | undefined {
  const normalized = description?.replace(/\s+/g, ' ').trim()
  return normalized || undefined
}

export function seoTitleWithFallback(title: string | undefined, fallback: string): string {
  return title || fallback
}
