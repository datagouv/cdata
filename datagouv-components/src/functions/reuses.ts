import { ofetch } from 'ofetch'
import { useI18n } from 'vue-i18n'
import { useComponentsConfig } from '../config'
import type { ReuseTopic, ReuseType } from '../types/reuses'

let reuseTypesRequest: Promise<Array<ReuseType>> | null = null

export async function fetchReuseTypes() {
  if (!reuseTypesRequest) {
    const config = useComponentsConfig()
    const { locale } = useI18n()
    reuseTypesRequest = ofetch<Array<ReuseType>>('api/1/reuses/types/', {
      baseURL: config.apiBase,
      query: { lang: locale.value },
    })
  }
  return await reuseTypesRequest
}

export function getType(types: Array<ReuseType>, id: string): string {
  const type = types.find(t => t.id === id)
  return type ? type.label : ''
}

export function getTopic(topics: Array<ReuseTopic>, id: string): string {
  const topic = topics.find(t => t.id === id)
  return topic ? topic.label : ''
}
