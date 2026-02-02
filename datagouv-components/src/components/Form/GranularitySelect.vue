<template>
  <SearchableSelect
    v-model="model"
    :options="granularities ?? []"
    :loading="status === 'pending'"
    :label="t('Granularité spatiale')"
    :placeholder="t('Toutes les granularités')"
    :get-option-id="(g: Granularity) => g.id"
    :display-value="(g: Granularity) => g.name"
    :multiple="false"
  />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useTranslation } from '../../composables/useTranslation'
import { useFetch } from '../../functions/api'
import type { Granularity } from '../../types/granularity'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<Granularity | null>({ default: null })
const id = defineModel<string | undefined>('id')

const { t } = useTranslation()

const { data: granularities, status } = await useFetch<Granularity[]>('/api/1/spatial/granularities/')

watch(model, (newModel) => {
  id.value = newModel?.id
})

watch([id, granularities], ([newId]) => {
  if (!newId) {
    model.value = null
    return
  }
  if (model.value?.id === newId) return
  model.value = granularities.value?.find(g => g.id === newId) ?? null
}, { immediate: true })
</script>
