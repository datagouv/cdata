<template>
  <SearchableSelect
    v-model="model"
    :options="[]"
    :suggest="suggestOrganizations"
    :label="t('Organisations')"
    :placeholder="t('Toutes les organisations')"
    :get-option-id="(option) => option.id"
    :display-value="(option) => option.name"
    :filter="(option, query) => (option.name).toLocaleLowerCase().includes(query.toLocaleLowerCase())"
    :multiple="false"
    :loading="loading || fetching"
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
import type { Organization, OrganizationSuggest, OrganizationOrSuggest } from '@datagouv/components-next'

const model = defineModel<OrganizationOrSuggest | null>({ default: null })
const id = defineModel<string | undefined>('id')

defineProps<{
  loading?: boolean
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()

const fetching = ref(false)

// When selecting from dropdown: update id from model
watch(model, (newModel) => {
  id.value = newModel?.id
})

// When id changes from URL: fetch organization if needed
watch(id, async (newId) => {
  if (!newId) {
    model.value = null
    return
  }
  if (model.value?.id === newId) return

  fetching.value = true
  try {
    model.value = await $api<Organization>(`/api/1/organizations/${newId}/`)
  }
  catch {
    model.value = null
  }
  finally {
    fetching.value = false
  }
}, { immediate: true })

async function suggestOrganizations(q: string) {
  return await $api<Array<OrganizationSuggest>>('/api/1/organizations/suggest/', {
    query: {
      q,
      size: 20,
    },
  })
}
</script>
