import { computedAsync } from '@vueuse/core'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { fetchReuseTypes, getType } from '../functions/reuses'

export function useReuseType(id: MaybeRefOrGetter<string>) {
  const label = computedAsync(async () => {
    const idValue = toValue(id)
    const types = await fetchReuseTypes()
    return getType(types, idValue)
  }, '')
  return {
    label,
  }
}
