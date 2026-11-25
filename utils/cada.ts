import type { BadgeTone } from '@datagouv/components-next'

// The CADA source data packs several values in a single cell, comma-separated.
export function splitCadaValues(value: string | null | undefined): Array<string> {
  if (!value) return []
  return value.split(',').map(part => part.trim()).filter(Boolean)
}

// `Partie` holds a roman numeral, or nothing at all for older advices.
export function cadaPartLabel(part: string | null | undefined): string {
  if (!part) return ''
  const { t } = useTranslation()
  switch (part.trim()) {
    case 'I': return t('Avec audition de l\'administration')
    case 'II': return t('Affaire de principe')
    case 'III': return t('Affaire courante')
    case 'IV': return t('Délégué')
    default: return part
  }
}

export function cadaMeaningTone(meaning: string): BadgeTone {
  const lower = meaning.toLowerCase()
  // `défavorable` contains `favorable`, so it has to be matched first.
  if (lower.includes('défavorable') || lower.includes('refus')) return 'danger'
  if (lower.includes('favorable') || lower.includes('recommande')) return 'success'
  return 'warning'
}
