<template>
  <div>
    <div
      v-for="(recommendations, source) in datasetsIdsBySource"
      :key="source"
      class="space-y-1"
    >
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('1 jeu de données recommandé ') }}
        {{ getRecommendationReason(recommendations[0]) }}
      </div>
      <ul class="space-y-4 mt-2 p-0 border-t border-gray-default relative z-2 list-none">
        <li
          v-for="recommendation in recommendations"
          :key="recommendation.id"
          class="p-0"
        >
          <EmbedsDatasetCard
            :slug="recommendation.id"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import type { Recommendation } from '~/types/recommendations'

const props = defineProps<{ dataset: DatasetV2 }>()

const { getRecommendationReason } = useRecommendationReason()

const datasetsIdsBySource = computed(() => {
  const recommendations = props.dataset.extras['recommendations'] as Array<Recommendation> || null
  if (!recommendations || !recommendations.length) return {}

  return recommendations.reduce((acc, r) => {
    if (!acc[r.source]) {
      acc[r.source] = []
    }
    if (!r.type) {
      r.type = 'dataset'
    }
    if (r.type === 'dataset') {
      acc[r.source].push(r)
    }
    return acc
  }, {} as Record<string, Array<Recommendation>>)
})
</script>
