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
import { useTranslation } from '../../composables/useTranslation'
import { useSelectModelSync } from '../../composables/useSelectModelSync'
import { useFetch } from '../../functions/api'
import type { RegisteredSchema } from '../../types/schemas'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<RegisteredSchema | null>({ default: null })
const id = defineModel<string | undefined>('id')

const { t } = useTranslation()

const { data: schemas, status } = await useFetch<RegisteredSchema[]>('/api/1/datasets/schemas/')

useSelectModelSync({ model, id, items: schemas, getId: s => s.name })
</script>
