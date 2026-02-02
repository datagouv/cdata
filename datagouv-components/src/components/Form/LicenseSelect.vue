<template>
  <SearchableSelect
    v-model="model"
    :options="licenses ?? []"
    :loading="status === 'pending'"
    :label="t('Licences')"
    :explanation="t('Les licences définissent les règles de réutilisation des jeux de données publiés.')"
    :placeholder="t('Toutes les licences')"
    :get-option-id="(l: License) => l.id"
    :display-value="(l: License) => l.title"
    :multiple="false"
  />
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import { useSelectModelSync } from '../../composables/useSelectModelSync'
import { useFetch } from '../../functions/api'
import type { License } from '../../types/licenses'
import SearchableSelect from './SearchableSelect.vue'

const model = defineModel<License | null>({ default: null })
const id = defineModel<string | undefined>('id')

const { t } = useTranslation()

const { data: licenses, status } = await useFetch<License[]>('/api/1/datasets/licenses/', { lazy: true })

useSelectModelSync({ model, id, items: licenses, getId: l => l.id })
</script>
