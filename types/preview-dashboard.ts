export type PreviewType = 'map' | 'tabular' | 'json' | 'pdf' | 'xml' | 'datafair' | 'openapi'

export type PreviewDashboardResource = {
  'id': string
  'title': string
  'url': string
  'format renseigné': string
  'format détecté': string | null
  'filesize renseignée': number | null
  'filesize détectée': number | null
  'source': string
  'previews': string | null
  'tabular preview last update': string | null
  'format normalisé': string
  'famille': string
  'a un aperçu': boolean
  'a une erreur': boolean
  'a un too big': boolean
  'err source unreachable': boolean
  'err parsing error': boolean
  'err no parsing table': boolean
  'err cors blocked': boolean
  'err cors unknown': boolean
  'err file too big': boolean
  'err unknown size': boolean
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
