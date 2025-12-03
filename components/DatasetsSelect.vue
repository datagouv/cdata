<template>
  <ObjectsSelect
    v-model="selectedDatasets"
    :single
    :main-label="label"
    :the-label="$t('le jeu de données')"
    :a-label="$t('un jeu de données')"
    :this-label="$t('ce jeu de données')"
    :allow-reorder
    :suggest="suggestDataset"
    :fetch="(id) => $api<DatasetV2>(`/api/2/datasets/${id}/`)"
    :object-image-url="(dataset) => ('image_url' in dataset && dataset.image_url) ? dataset.image_url : ''"
    :is-full-object="(dataset) => ('harvest' in dataset) ? dataset : null"
    :match-url="/\/datasets\/(.+?)\/?$/"
  >
    <template #default="{ object: dataset }">
      <CardLg
        class="flex-1 min-w-0"
        :dataset
      />
    </template>
  </ObjectsSelect>
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import CardLg from '~/components/dataset/card-lg.vue'
import type { DatasetSuggest } from '~/types/types'

const props = withDefaults(defineProps<{
  single?: boolean
  label?: string
  allowReorder?: boolean
  organizationId?: string
}>(), {
  single: false,
  allowReorder: true,
})

const { $api } = useNuxtApp()

const selectedDatasets = defineModel<Array<DatasetV2 | DatasetSuggest>>({ required: true })

const suggestDataset = async (query: Record<string, string | number>): Promise<Array<DatasetSuggest>> => {
  if (props.organizationId) {
    const searchResults = await $api<{ data: Array<DatasetV2> }>('/api/2/datasets/search/', {
      query: {
        ...query,
        page_size: 5,
        organization: props.organizationId,
      },
    })

    // Convertir les résultats de recherche en format DatasetSuggest
    return searchResults.data.map(dataset => ({
      id: dataset.id,
      title: dataset.title,
      slug: dataset.slug,
      acronym: dataset.acronym || '',
      page: dataset.page || '',
      image_url: null, // L'API de recherche ne retourne pas image_url
    }))
  }
  return await $api<Array<DatasetSuggest>>('/api/1/datasets/suggest/', {
    query: {
      ...query,
      size: 5,
    },
  })
}
</script>
