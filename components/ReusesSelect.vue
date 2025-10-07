<template>
  <ObjectsSelect
    v-model="selectedReuses"
    :single
    :main-label="label"
    :the-label="$t('la réutilisation')"
    :a-label="$t('une réutilisation')"
    :this-label="$t('cette réutilisation')"
    :allow-reorder
    :suggest="(query) => $api<Array<ReuseSuggest>>('/api/1/reuses/suggest/', { query })"
    :fetch="(id) => $api<Reuse>(`/api/1/reuses/${id}/`)"
    :object-image-url="(reuse) => ('image_url' in reuse && reuse.image_url) ? reuse.image_url : ''"
    :is-full-object="(reuse) => ('datasets' in reuse) ? reuse : null"
    :match-url="/\/reuses\/(.+?)\/?$/"
  >
    <template #default="{ object: reuse }">
      <div class="flex-1 border p-4">
        {{ reuse.title }}
      </div>
    </template>
  </ObjectsSelect>
</template>

<script setup lang="ts">
import type { Reuse } from '@datagouv/components-next'
import type { ReuseSuggest } from '~/types/types'

withDefaults(defineProps<{
  single?: boolean
  label?: string
  allowReorder?: boolean
}>(), {
  single: false,
  allowReorder: true,
})

const selectedReuses = defineModel<Array<Reuse>>({ required: true })
</script>
