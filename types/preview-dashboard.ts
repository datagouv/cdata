export type PreviewDashboardFormatStat = {
  'famille': string
  'format normalisé': string
  'nombre': number
  'prévisualisable': number
  '% catalogue': number
  '% erreur': number
  '% trop volumineux': number
  '% prévisualisable': number
  '% prévisualisation manquante': number
  'mois': string
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
