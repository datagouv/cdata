<template>
  <FilterButtonGroup
    :model-value="modelValue"
    :options="options"
    :label="t(`Modalités d'accès`)"
    :all-label="t('Toutes')"
    name="access_type"
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
  { value: 'open', label: t('Téléchargement libre') },
  { value: 'open_with_account', label: t('Ouvert sous condition') },
  { value: 'restricted', label: t('Accessible sous habilitation') },
]
</script>
