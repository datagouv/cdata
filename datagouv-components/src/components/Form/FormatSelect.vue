<template>
  <SearchableSelect
    v-model="model"
    :options="formats ?? []"
    :loading="status === 'pending'"
    :label="t('Formats')"
    :placeholder="t('Tous les formats')"
    :get-option-id="(f: string) => f"
    :display-value="(f: string) => f"
    :multiple="false"
  />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useTranslation } from '../../composables/useTranslation'
import { useFetch } from '../../functions/api'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<string | null>({ default: null })
const id = defineModel<string | undefined>('id')

const { t } = useTranslation()

const { data: formats, status } = await useFetch<string[]>('/api/1/datasets/extensions/')

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
</script>
