import { ref, watch, type Ref } from 'vue'

/**
 * Syncs a model (full object) with an id (identifier only) bidirectionally.
 * Used in *Select components where the parent binds via v-model:id but internally we need the full object.
 */
export function useSelectModelSync<T>(options: {
  model: Ref<T | null>
  id: Ref<string | undefined>
  items: Ref<T[] | null | undefined>
  getId: (item: T) => string
}) {
  const { model, id, items, getId } = options

  watch(model, (newModel) => {
    id.value = newModel ? getId(newModel) : undefined
  })

  watch([id, items], ([newId]) => {
    if (!newId) {
      model.value = null
      return
    }
    if (model.value && getId(model.value) === newId) return
    model.value = items.value?.find(item => getId(item) === newId) ?? null
  }, { immediate: true })
}

/**
 * Simplified sync for string-based selects where model and id are both strings.
 */
export function useStringSelectSync(options: {
  model: Ref<string | null>
  id: Ref<string | undefined>
}) {
  const { model, id } = options

  watch(model, (newModel) => {
    id.value = newModel ?? undefined
  })

  watch(id, (newId) => {
    if (!newId) {
      model.value = null
      return
    }
    if (model.value === newId) return
    model.value = newId
  }, { immediate: true })
}

/**
 * Sync with async fetch when id changes and model needs to be fetched.
 * Returns a `fetching` ref for loading state.
 */
export function useAsyncSelectModelSync<T>(options: {
  model: Ref<T | null>
  id: Ref<string | undefined>
  getId: (item: T) => string
  fetchById: (id: string) => Promise<T | null>
}) {
  const { model, id, getId, fetchById } = options
  const fetching = ref(false)

  watch(model, (newModel) => {
    id.value = newModel ? getId(newModel) : undefined
  })

  watch(id, async (newId) => {
    if (!newId) {
      model.value = null
      return
    }
    if (model.value && getId(model.value) === newId) return

    fetching.value = true
    try {
      model.value = await fetchById(newId)
    }
    catch {
      model.value = null
    }
    finally {
      fetching.value = false
    }
  }, { immediate: true })

  return { fetching }
}
