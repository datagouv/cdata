<template>
  <FilterButtonGroup
    :model-value="modelValue"
    :options="options"
    :label="t(`Type d'organisation`)"
    :all-label="t('Toutes')"
    :facets="facets"
    :loading="loading"
    name="producer_type"
    highlight-active
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import type { FacetItem } from '../../../types/search'
import { useTranslation } from '../../../composables/useTranslation'
import FilterButtonGroup from './FilterButtonGroup.vue'

defineProps<{
  modelValue: string | undefined
  facets?: FacetItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const { t } = useTranslation()

const options = [
  { value: 'public-service', label: t('Service public') },
  { value: 'local-authority', label: t('Collectivité territoriale') },
  { value: 'company', label: t('Entreprise') },
  { value: 'association', label: t('Association') },
  { value: 'user', label: t('Utilisateur') },
]
</script>
