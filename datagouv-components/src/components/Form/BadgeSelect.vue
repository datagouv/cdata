<template>
  <SearchableSelect
    v-model="model"
    :options="badges"
    :loading="status === 'pending'"
    :label="t('Label de données')"
    :placeholder="t('Tous les labels')"
    :get-option-id="(b: TranslatedBadge) => b.kind"
    :display-value="(b: TranslatedBadge) => b.label"
    :multiple="false"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/useTranslation'
import { useSelectModelSync } from '../../composables/useSelectModelSync'
import { useFetch } from '../../functions/api'
import type { TranslatedBadge } from '../../types/badges'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<TranslatedBadge | null>({ default: null })
const id = defineModel<string | undefined>('id')

const { t } = useTranslation()

const { data: badgesRecord, status } = await useFetch<Record<string, string>>('/api/1/datasets/badges/')

const badges = computed<TranslatedBadge[]>(() => {
  if (!badgesRecord.value) return []
  return Object.entries(badgesRecord.value).map(([kind, label]) => ({ kind, label }))
})

useSelectModelSync({ model, id, items: badges, getId: b => b.kind })
</script>
