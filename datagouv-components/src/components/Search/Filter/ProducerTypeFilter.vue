<template>
  <FilterButtonGroup
    :model-value="modelValue"
    :options="options"
    :label="t(`Type d'organisation`)"
    :all-label="t('Toutes')"
    name="producer_type"
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
  { value: 'public-service', label: t('Service public') },
  { value: 'local-authority', label: t('Collectivité territoriale') },
  { value: 'company', label: t('Entreprise') },
  { value: 'association', label: t('Association') },
  { value: 'user', label: t('Utilisateur') },
]
</script>
