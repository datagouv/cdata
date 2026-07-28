// The CADA source data packs several values in a single cell, comma-separated.
export function splitCadaValues(value: string | null | undefined): Array<string> {
  if (!value) return []
  return value.split(',').map(part => part.trim()).filter(Boolean)
}

const CADA_PART_LABELS: Record<string, string> = {
  I: 'Avec audition de l\'administration',
  II: 'Affaire de principe',
  III: 'Affaire courante',
  IV: 'Délégué',
}

// `Partie` holds a roman numeral, or nothing at all for older advices.
export function cadaPartLabel(part: string | null | undefined): string {
  if (!part) return ''
  return CADA_PART_LABELS[part.trim()] ?? part
}

export function cadaMeaningBadgeClass(meaning: string): string {
  const lower = meaning.toLowerCase()
  // `défavorable` contains `favorable`, so it has to be matched first.
  if (lower.includes('défavorable') || lower.includes('refus')) return 'fr-badge--error'
  if (lower.includes('favorable') || lower.includes('recommande')) return 'fr-badge--success'
  return 'fr-badge--warning'
}
