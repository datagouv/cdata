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
