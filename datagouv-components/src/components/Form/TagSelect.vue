<template>
  <SearchableSelect
    v-model="model"
    :options="[]"
    :suggest="suggestTags"
    :label="t('Mots clés')"
    :placeholder="t('Tous les mots clés')"
    :get-option-id="(tag: string) => tag"
    :display-value="(tag: string) => tag"
    :multiple="false"
  />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { ofetch } from 'ofetch'
import { useComponentsConfig } from '../../config'
import { useTranslation } from '../../composables/useTranslation'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<string | null>({ default: null })
const id = defineModel<string | undefined>('id')

const config = useComponentsConfig()
const { t } = useTranslation()

watch(model, (newModel) => {
  id.value = newModel ?? undefined
})

watch(id, (newId) => {
  if (!newId) {
    model.value = null
    return
  }
  if (model.value === newId) return
  model.value = newId
}, { immediate: true })

type TagSuggest = { text: string }

async function suggestTags(q: string) {
  const tags = await ofetch<TagSuggest[]>('/api/1/tags/suggest/', {
    baseURL: config.apiBase,
    query: { q, size: 20 },
  })
  return tags.map(tag => tag.text)
}
</script>
