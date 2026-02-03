<template>
  <FilterButtonGroup
    :model-value="modelValue"
    :options="options"
    :label="t('Type de réutilisation')"
    :all-label="t('Tous')"
    name="type"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { useTranslation } from '../../../composables/useTranslation'
import FilterButtonGroup from './FilterButtonGroup.vue'

defineProps<{
  modelValue: string | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const { t } = useTranslation()

const options = [
  { value: 'visualization', label: t('Visualisation') },
  { value: 'application', label: t('Application') },
  { value: 'post', label: t('Article de blog') },
  { value: 'news_article', label: t('Article de presse') },
  { value: 'api', label: 'API' },
  { value: 'paper', label: t('Publication scientifique') },
  { value: 'idea', label: t('Idée') },
  { value: 'hardware', label: t('Matériel connecté') },
]
</script>
