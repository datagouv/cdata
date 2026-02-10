<template>
  <FilterButtonGroup
    :model-value="modelValue"
    :options="options"
    :label="t('Label de donnée')"
    :all-label="t('Tous')"
    :facets="facets"
    :loading="loading"
    name="badge"
    highlight-active
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FacetItem } from '../../../types/search'
import { useFetch } from '../../../functions/api'
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

const { data: badgesRecord } = await useFetch<Record<string, string>>('/api/1/datasets/badges/', { lazy: true })

const options = computed(() => {
  if (!badgesRecord.value) return []
  return Object.entries(badgesRecord.value).map(([value, label]) => ({ value, label }))
})
</script>
