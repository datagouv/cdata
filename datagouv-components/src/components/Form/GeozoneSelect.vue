<template>
  <SearchableSelect
    v-model="model"
    :options="[]"
    :suggest="suggestGeozones"
    :label="t('Couverture spatiale')"
    :placeholder="t('Toutes les couvertures')"
    :get-option-id="(g: SpatialZone) => g.id"
    :display-value="(g: SpatialZone) => g.name"
    :multiple="false"
    :loading="fetching"
  >
    <template #option="{ option }">
      <div class="flex-1">
        {{ option.name }}
      </div>
      <code class="bg-gray-100 text-gray-600 p-1 text-xs rounded">{{ option.code }}</code>
    </template>
  </SearchableSelect>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../../config'
import { useTranslation } from '../../composables/useTranslation'
import type { SpatialZone } from '../../types/granularity'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<SpatialZone | null>({ default: null })
const id = defineModel<string | undefined>('id')

const config = useComponentsConfig()
const { t } = useTranslation()

const fetching = ref(false)

watch(model, (newModel) => {
  id.value = newModel?.id
})

watch(id, async (newId) => {
  if (!newId) {
    model.value = null
    return
  }
  if (model.value?.id === newId) return

  // Fetch the zone by suggesting with the ID
  fetching.value = true
  try {
    const zones = await suggestGeozones(newId)
    model.value = zones.find(z => z.id === newId) ?? null
  }
  catch {
    model.value = null
  }
  finally {
    fetching.value = false
  }
}, { immediate: true })

async function suggestGeozones(q: string) {
  return await ofetch<SpatialZone[]>('/api/1/spatial/zones/suggest/', {
    baseURL: config.apiBase,
    query: { q, size: 20 },
  })
}
</script>
