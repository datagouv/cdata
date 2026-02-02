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
import { ref, watch } from 'vue'
import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../../config'
import { useTranslation } from '../../composables/useTranslation'
import type { Organization, OrganizationSuggest } from '../../types/organizations'
import OrganizationLogo from '../OrganizationLogo.vue'
import SearchableSelect from './SearchableSelect.vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const model = defineModel<any>({ default: null })
const id = defineModel<string | undefined>('id')

defineProps<{
  loading?: boolean
}>()

const config = useComponentsConfig()
const { t } = useTranslation()

const fetching = ref(false)

watch(model, (newModel) => {
  id.value = newModel?.id
})

watch(id, async (newId) => {
  if (!newId) {
    model.value = null
    return
  }
  if (model.value?.id === newId) return

  fetching.value = true
  try {
    model.value = await ofetch<Organization>(`/api/1/organizations/${newId}/`, {
      baseURL: config.apiBase,
    })
  }
  catch {
    model.value = null
  }
  finally {
    fetching.value = false
  }
}, { immediate: true })

async function suggestOrganizations(q: string) {
  return await ofetch<Array<OrganizationSuggest>>('/api/1/organizations/suggest/', {
    baseURL: config.apiBase,
    query: {
      q,
      size: 20,
    },
  })
}
</script>
