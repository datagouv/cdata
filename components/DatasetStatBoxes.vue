<template>
  <div
    v-if="!error"
    class="grid gap-4 xl:grid-cols-2"
  >
    <!-- ClientOnly: the loading skeletons of StatBox get ids from `Math.random()`, which differ
         between the server and the client render and break hydration. -->
    <ClientOnly>
      <StatBox
        :title="$t('Vues')"
        :data="metrics?.visits ?? null"
        size="sm"
        type="line"
        :summary="metrics?.visitsTotal ?? null"
        :since="metricsSince"
      />
      <StatBox
        v-if="dataset.access_type === 'open'"
        :title="$t('Téléchargements')"
        :data="metrics?.downloads ?? null"
        size="sm"
        type="line"
        :summary="metrics?.downloadsTotal ?? null"
        :since="metricsSince"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { StatBox, useMetrics, type DatasetV2WithFullObject } from '@datagouv/components-next'

const props = defineProps<{
  dataset: DatasetV2WithFullObject
}>()

const config = useRuntimeConfig()
const { getDatasetMetrics } = useMetrics()

// The metrics API is a third party this page can live without, so it stays out of the SSR
// render, and `useLazyAsyncData` exposes a failure (request blocked by a browser extension,
// flaky network, navigation cancelling the request) as `error` instead of letting it bubble
// up as an unhandled rejection. Without metrics we hide the boxes rather than show zeroes.
const { data: metrics, error } = useLazyAsyncData(
  () => `dataset-metrics-${props.dataset.id}`,
  () => getDatasetMetrics(props.dataset.id),
  { server: false },
)

const metricsSince = computed(() => {
  // max of the start of metrics computing and the creation of the dataset on the platform
  return [props.dataset.internal.created_at_internal, config.public.metricsSince].reduce((max, c) => c > max ? c : max)
})
</script>
