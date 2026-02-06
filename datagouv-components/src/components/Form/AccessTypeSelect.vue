<template>
  <SelectGroup
    v-model="model"
    :label="t('Accès')"
    :options="accessOptions"
    hide-null-option
  />
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import SelectGroup from './SelectGroup.vue'

const model = defineModel<boolean | undefined>()

const { t } = useTranslation()

const accessOptions = [
  { value: undefined, label: t(`Toutes les modalités d'accès`) },
  { value: false, label: t('Les API ouvertes à tous') },
  { value: true, label: t('Les API en accès restreint') },
]
</script>
