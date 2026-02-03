<template>
  <SearchableSelect
    v-model="selected"
    :options="organizationTypes"
    :label="t(`Type d'organisation`)"
    :placeholder="t('Tous les types')"
    :get-option-id="(opt) => opt.type"
    :display-value="(value) => value.label"
    :multiple="false"
  >
    <template #option="{ option }">
      {{ option.label }}
    </template>
  </SearchableSelect>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getOrganizationTypes, OTHER, USER } from '../../functions/organizations'
import { useTranslation } from '../../composables/useTranslation'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<string | undefined>()

const { t } = useTranslation()

const organizationTypes = getOrganizationTypes()
  .filter(t => t.type !== OTHER && t.type !== USER)

const selected = computed({
  get: () => organizationTypes.find(t => t.type === model.value) ?? null,
  set: (value) => { model.value = value?.type },
})
</script>
