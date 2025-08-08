<template>
  <ObjectsSelect
    v-model="selectedDataservices"
    :single
    :main-label="label"
    :the-label="$t(`l'API`)"
    :a-label="$t('une API')"
    :this-label="$t('cette API')"
    :allow-reorder
    :suggest="(query) => $api<PaginatedArray<Dataservice>>('/api/1/dataservices/', { query }).then(({ data }) => data)"
    :fetch="(id) => $api<Dataservice>(`/api/1/dataservices/${id}/`)"
    :object-image-url="(dataservice) => ''"
    :is-full-object="(dataservice) => dataservice"
    :match-url="/\/dataservices\/(.+?)\/?$/"
  >
    <template #default="{ object: dataservice }">
      <DataserviceCard
        :dataservice
        class="w-full"
      />
    </template>
  </ObjectsSelect>
</template>

<script setup lang="ts">
import { DataserviceCard, type Dataservice } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'

withDefaults(defineProps<{
  single?: boolean
  label?: string
  allowReorder?: boolean
}>(), {
  single: false,
  allowReorder: true,
})

const selectedDataservices = defineModel<Array<Dataservice>>({ required: true })
</script>
