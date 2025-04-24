import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../config'
import type { ReuseType } from '../types/reuses'

let reuseTypesRequest: Promise<Array<ReuseType>> | null = null

export async function fetchReuseTypes() {
  if (!reuseTypesRequest) {
    const config = useComponentsConfig()
    reuseTypesRequest = ofetch<Array<ReuseType>>('api/1/reuses/types/', {
      baseURL: config.apiBase,
      params: {
        lang: config.i18n?.global.locale,
      },
    })
  }
  return await reuseTypesRequest
}

export function getType(types: Array<ReuseType>, id: string): string {
  console.log(types, id)
  const type = types.find(t => t.id === id)
  return type ? type.label : ''
}
