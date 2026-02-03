<template>
  <SearchableSelect
    v-model="model"
    :options="topics ?? []"
    :loading="status === 'pending'"
    :label="t('Thématique')"
    :placeholder="t('Toutes les thématiques')"
    :get-option-id="(topic: ReuseTopic) => topic.id"
    :display-value="(topic: ReuseTopic) => topic.label"
    :multiple="false"
  />
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import { useSelectModelSync } from '../../composables/useSelectModelSync'
import { useFetch } from '../../functions/api'
import type { ReuseTopic } from '../../types/reuses'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<ReuseTopic | null>({ default: null })
const id = defineModel<string | undefined>('id')

const { t } = useTranslation()

const { data: topics, status } = await useFetch<ReuseTopic[]>('/api/1/reuses/topics/', { lazy: true })

useSelectModelSync({ model, id, items: topics, getId: topic => topic.id })
</script>
