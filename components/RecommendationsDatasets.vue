<template>
  <div
    v-if="datasetsIds.length"
    class="space-y-1"
  >
    <div class="uppercase text-gray-plain text-sm font-bold">
      {{ $t('{n} jeux de données recommandés', { n: datasetsIds.length }) }}
    </div>
    <ul class="space-y-4 mt-2 p-0 border-t border-gray-default relative z-2 list-none">
      <li
        v-for="recommendationDataset in datasets"
        :key="recommendationDataset.id"
        class="p-0"
        data-track-content
        data-content-name="dataset recommendations"
        :data-content-piece="recommendationDataset.title"
        :data-content-target="recommendationDataset.page"
      >
        <DatasetCardLg :dataset="recommendationDataset" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'

const props = defineProps<{ dataset: DatasetV2 }>()

const datasets = ref<Record<string, DatasetV2>>({})

const datasetsIds = computed(() => {
  const recommendations = props.dataset.extras['recommendations'] || null
  if (!recommendations || !recommendations.length) return []

  console.log(recommendations)
  return recommendations.map((r: { id: string }) => r.id)
})

const { $api } = useNuxtApp()
watchEffect(async () => {
  for (const id of datasetsIds.value) {
    if (id in datasets.value) return
    datasets.value[id] = await $api<DatasetV2>(`/api/2/datasets/${id}/`)
  }
})
</script>
