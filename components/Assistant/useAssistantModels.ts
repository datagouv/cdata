import { readonly, ref } from 'vue'
import { isRecord } from '@datagouv/components-next'
import { apiAuthOptions } from '~/utils/auth'

/** A model udata offers: the first of its list is the default one. */
export type AssistantModel = { id: string, label: string }

function isAssistantModel(entry: unknown): entry is AssistantModel {
  return isRecord(entry) && typeof entry.id === 'string' && typeof entry.label === 'string'
}

/** Models udata offers: on any failure the list stays as it was and the server's default model answers ($api would toast it). */
export function useAssistantModels() {
  const runtimeConfig = useRuntimeConfig()
  const models = ref<Array<AssistantModel>>([])

  function reload(): Promise<void> {
    return $fetch<unknown>(`${runtimeConfig.public.apiBase as string}/api/1/assistant/models/`, apiAuthOptions(runtimeConfig.public.devApiKey as string | undefined))
      .then((list) => {
        if (Array.isArray(list)) models.value = list.filter(isAssistantModel)
      })
      .catch(() => {})
  }

  reload()

  return { models: readonly(models), reload }
}
