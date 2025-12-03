export function cleanSiret(siret: string | null | undefined): string | null {
  if (!siret) return null
  return siret.replace(/\s+/g, '')
}
