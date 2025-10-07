export type Recommendation = {
  id: string
  score: number
  source: 'edito' | 'schemas'
  reason: string
  type?: 'external' | 'dataset' | 'reuse'
}

export type ExternalRecommendation = Recommendation & {
  type: 'external'
  messages: {
    [locale: string]: {
      title: string
      message: string
      button: string
    }
  }
}
