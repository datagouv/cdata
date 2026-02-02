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
import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../../config'
import { useTranslation } from '../../composables/useTranslation'
import { useAsyncSelectModelSync } from '../../composables/useSelectModelSync'
import type { SpatialZone } from '../../types/granularity'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<SpatialZone | null>({ default: null })
const id = defineModel<string | undefined>('id')

const config = useComponentsConfig()
const { t } = useTranslation()

const { fetching } = useAsyncSelectModelSync({
  model,
  id,
  getId: z => z.id,
  fetchById: async (zoneId) => {
    const zones = await suggestGeozones(zoneId)
    return zones.find(z => z.id === zoneId) ?? null
  },
})

async function suggestGeozones(q: string) {
  return await ofetch<SpatialZone[]>('/api/1/spatial/zones/suggest/', {
    baseURL: config.apiBase,
    query: { q, size: 20 },
  })
}
</script>
