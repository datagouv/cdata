import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../config'
import type { ReuseTopic, ReuseType } from '../types/reuses'

let reuseTypesRequest: Promise<Array<ReuseType>> | null = null
export function useFetchReuseTypes() {
  const config = useComponentsConfig()
  const { locale } = useI18n()

  return async (): Promise<Array<ReuseType>> => {
    if (reuseTypesRequest) {
      return reuseTypesRequest
    }

    return await (reuseTypesRequest = ofetch<Array<ReuseType>>('api/1/reuses/types/', {
      baseURL: config.apiBase,
      query: { lang: locale.value },
    }))
  }
}

export function getType(types: Array<ReuseType>, id: string): string {
  const type = types.find(t => t.id === id)
  return type ? type.label : ''
}

export function getTopic(topics: Array<ReuseTopic>, id: string): string {
  const topic = topics.find(t => t.id === id)
  return topic ? topic.label : ''
}
