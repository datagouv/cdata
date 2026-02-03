<template>
  <FilterButtonGroup
    :model-value="modelValue"
    :options="options"
    :label="t('Date de mise à jour')"
    :all-label="t('Toutes')"
    :facets="facets"
    :loading="loading"
    name="last_update_range"
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
  { value: 'last_30_days', label: t('Les 30 derniers jours') },
  { value: 'last_12_months', label: t('Les 12 derniers mois') },
  { value: 'last_3_years', label: t('Les 3 dernières années') },
]
</script>
