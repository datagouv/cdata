<template>
  <SearchableSelect
    v-model="model"
    :options="formats ?? []"
    :loading="status === 'pending'"
    :label="t('Formats')"
    :placeholder="t('Tous les formats')"
    :get-option-id="(f: string) => f"
    :display-value="(f: string) => f"
    :multiple="false"
  />
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import { useStringSelectSync } from '../../composables/useSelectModelSync'
import { useFetch } from '../../functions/api'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<string | null>({ default: null })
const id = defineModel<string | undefined>('id')

const { t } = useTranslation()

const { data: formats, status } = await useFetch<string[]>('/api/1/datasets/extensions/', { lazy: true })

useStringSelectSync({ model, id })
</script>
