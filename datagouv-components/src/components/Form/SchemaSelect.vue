<template>
  <SearchableSelect
    v-model="model"
    :options="schemas ?? []"
    :loading="status === 'pending'"
    :label="t('Schéma')"
    :explanation="t('Les schémas de données permettent de décrire des modèles de données.')"
    :placeholder="t('Tous les schémas')"
    :get-option-id="(s: RegisteredSchema) => s.name"
    :display-value="(s: RegisteredSchema) => s.name"
    :multiple="false"
  />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useTranslation } from '../../composables/useTranslation'
import { useFetch } from '../../functions/api'
import type { RegisteredSchema } from '../../types/schemas'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<RegisteredSchema | null>({ default: null })
const id = defineModel<string | undefined>('id')

const { t } = useTranslation()

const { data: schemas, status } = await useFetch<RegisteredSchema[]>('/api/1/datasets/schemas/')

watch(model, (newModel) => {
  id.value = newModel?.name
})

watch([id, schemas], ([newId]) => {
  if (!newId) {
    model.value = null
    return
  }
  if (model.value?.name === newId) return
  model.value = schemas.value?.find(s => s.name === newId) ?? null
}, { immediate: true })
</script>
