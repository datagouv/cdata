<template>
  <FilterButtonGroup
    :model-value="modelValue"
    :options="options"
    :label="t('Label de donnée')"
    :all-label="t('Tous')"
    name="badge"
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
  { value: 'hvd', label: t('Données de forte valeur (HVD)') },
  { value: 'inspire', label: 'INSPIRE' },
  { value: 'spd', label: t('Service public de la donnée (SPD)') },
]
</script>
