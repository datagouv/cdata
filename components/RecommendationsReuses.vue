<template>
  <div
    v-if="recommendedReuses.length"
    class="space-y-1"
  >
    <div class="uppercase text-gray-plain text-sm font-bold">
      {{ $t('{n} réutilisations recommandées | {n} réutilisation recommandée | {n} réutilisations recommandées', { n: recommendedReuses.length }) }}
    </div>
    <div class="space-y-2.5">
      <div class="grid sm:grid-cols-3 gap-2.5">
        <ReuseCard
          v-for="reuse in recommendedReuses"
          :key="reuse.id"
          :reuse-url="reuse.page"
          :reuse
          data-track-content
          data-content-name="reuse recommendations"
          :data-content-piece="reuse.title"
          :data-content-target="reuse.page"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ReuseCard, type DatasetV2, type Reuse } from '@datagouv/components-next'

const props = defineProps<{ dataset: DatasetV2 }>()

const reuses = ref<Record<string, Reuse>>({})

const reusesIds = computed(() => {
  const recommendations = props.dataset.extras['recommendations-reuses'] as Array<{ id: string }> | undefined
  if (!recommendations || !recommendations.length) return []

  return recommendations.map(r => r.id)
})

// Only the reuses we actually managed to load: a recommended reuse may have been
// deleted/unpublished since the recommendation was computed, so we don't want a
// missing one to inflate the count or break the listing.
const recommendedReuses = computed(() => Object.values(reuses.value))

const { $api } = useNuxtApp()
watchEffect(async () => {
  for (const id of reusesIds.value) {
    if (id in reuses.value) continue
    try {
      reuses.value[id] = await $api<Reuse>(`/api/1/reuses/${id}/`)
    }
    catch {
      // A recommended reuse may no longer exist (404): skip it silently instead of
      // letting the rejection bubble up as an unhandled error.
    }
  }
})
</script>
