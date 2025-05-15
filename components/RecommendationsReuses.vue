<template>
  <div
    v-if="reusesIds.length"
    class="space-y-1"
  >
    <div class="uppercase text-gray-plain text-sm font-bold">
      {{ $t('{n} réutilisations recommandées', { n: reusesIds.length }) }}
    </div>
    <div class="space-y-2.5">
      <div class="grid sm:grid-cols-3 gap-2.5">
        <ReuseCard
          v-for="reuse in reuses"
          :key="reuse.id"
          :reuse-url="reuse.page"
          :reuse
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
  const recommendations = props.dataset.extras['recommendations-reuses'] || null
  if (!recommendations || !recommendations.length) return []

  return recommendations.map((r: { id: string }) => r.id)
})

const { $api } = useNuxtApp()
watchEffect(async () => {
  for (const id of reusesIds.value) {
    if (id in reuses.value) return
    reuses.value[id] = await $api<Reuse>(`/api/1/reuses/${id}/`)
  }
})
</script>
