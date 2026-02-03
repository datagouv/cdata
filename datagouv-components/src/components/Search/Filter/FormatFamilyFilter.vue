<template>
  <FilterButtonGroup
    :model-value="modelValue"
    :options="options"
    :label="t('Format de données')"
    :all-label="t('Tous')"
    name="format_family"
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
  { value: 'tabular', label: t('Tabulaires'), description: '(csv, xls, xlsx, ods, parquet...)' },
  { value: 'machine_readable', label: t('Structurées'), description: '(json, rdf, xml, sql...)' },
  { value: 'geographical', label: t('Géographiques'), description: '(geojson, shp, kml...)' },
  { value: 'documents', label: t('Documents'), description: '(pdf, doc, docx, md, txt, html...)' },
  { value: 'other', label: t('Autre') },
]
</script>
