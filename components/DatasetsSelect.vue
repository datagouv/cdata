<template>
  <ObjectsSelect
    v-model="selectedDatasets"
    :single
    :main-label="label"
    :the-label="$t('le jeu de données')"
    :a-label="$t('un jeu de données')"
    :this-label="$t('ce jeu de données')"
    :allow-reorder
    :suggest="(query) => $api<Array<DatasetSuggest>>('/api/1/datasets/suggest/', { query })"
    :fetch="(id) => $api<DatasetV2>(`/api/2/datasets/${id}/`)"
    :object-image-url="(dataset) => ('image_url' in dataset && dataset.image_url) ? dataset.image_url : ''"
    :is-full-object="(dataset) => ('harvest' in dataset) ? dataset : null"
    :match-url="/\/datasets\/(.+?)\/?$/"
  >
    <template #default="{ object: dataset }">
      <CardLg
        class="flex-1"
        :dataset
      />
    </template>
  </ObjectsSelect>
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import CardLg from '~/components/dataset/card-lg.vue'
import type { DatasetSuggest } from '~/types/types'

withDefaults(defineProps<{
  single?: boolean
  label?: string
  allowReorder?: boolean
}>(), {
  single: false,
  allowReorder: true,
})

const selectedDatasets = defineModel<Array<DatasetV2 | DatasetSuggest>>({ required: true })
</script>
