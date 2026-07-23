export type PreviewType = 'map' | 'tabular' | 'json' | 'pdf' | 'xml' | 'datafair' | 'openapi'

export type PreviewDashboardResource = {
  'id': string
  'titre': string
  'url': string
  'source': string
  'format déclaré': string
  'format détecté': string | null
  'format normalisé': string
  'famille': string
  'taille déclarée': number | null
  'taille détectée': number | null
  'téléchargements': number
  'dernière modification': string | null
  'dernière maj tabular': string | null
  'délai tabular (jours)': number
  'aperçus actifs': string | null
  'a un aperçu': boolean
  'a une erreur': boolean
  'a un too big': boolean
  'aperçu manquant': boolean
  'erreur source inaccessible': boolean
  'erreur analyse': boolean
  'erreur cors': boolean
  'erreur cors inconnu': boolean
  'erreur fichier trop volumineux': boolean
  'erreur taille inconnue': boolean
  '__id': number
}

export type PreviewDashboardFormatStat = {
  'Famille de format': string
  'Format': string
  'Nombre': number
  'Prévisualisable': number
  '% catalogue': number
  '% erreur': number
  '% too big': number
  '% prévisualisable': number
  '% prévisualisation manquante': number
  'Mois': string
  '__id': number
}

export type TabularDataResponse<T = unknown> = {
  data: T[]
  meta: {
    page: number
    page_size: number
    total: number
  }
  links: {
    profile: string
    swagger: string
    next: string | null
    prev: string | null
  }
}
