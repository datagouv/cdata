<template>
  <SearchableSelect
    v-model="model"
    :options="organizations"
    :suggest="suggestOrganizations"
    :label="t('Organisations')"
    :placeholder="t('Toutes les organisations')"
    :get-option-id="(option) => option.id"
    :display-value="(option) => option.name"
    :filter="(option, query) => (option.name).toLocaleLowerCase().includes(query.toLocaleLowerCase())"
    :multiple="false"
    :loading="loading"
  >
    <template #option="{ option }">
      <div class="flex items-center space-x-2">
        <OrganizationLogo
          :organization="option"
          size-class="size-8"
          class="flex-none"
        />
        <span>{{ option.name }}</span>
      </div>
    </template>
  </SearchableSelect>
</template>

<script setup lang="ts">
import { OrganizationLogo } from '@datagouv/components-next'
import type { OrganizationSuggest, OrganizationOrSuggest } from '@datagouv/components-next'

const model = defineModel<OrganizationOrSuggest | null>()

defineProps<{
  organizations: Array<OrganizationOrSuggest>
  loading?: boolean
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()

async function suggestOrganizations(q: string) {
  return await $api<Array<OrganizationSuggest>>('/api/1/organizations/suggest/', {
    query: {
      q,
      size: 20,
    },
  })
}
</script>
