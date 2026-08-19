<template>
  <div v-if="!error">
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
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { StatBox, useMetrics, type Reuse } from '@datagouv/components-next'

const props = defineProps<{
  reuse: Reuse
}>()

const config = useRuntimeConfig()
const { getReuseMetrics } = useMetrics()

// The metrics API is a third party this page can live without, so it stays out of the SSR
// render, and `useLazyAsyncData` exposes a failure (request blocked by a browser extension,
// flaky network, navigation cancelling the request) as `error` instead of letting it bubble
// up as an unhandled rejection. Without metrics we hide the box rather than show zeroes.
const { data: metrics, error } = useLazyAsyncData(
  () => `reuse-metrics-${props.reuse.id}`,
  () => getReuseMetrics(props.reuse.id),
  { server: false },
)

const metricsSince = computed(() => {
  // max of the start of metrics computing and the creation of the reuse on the platform
  return [props.reuse.created_at, config.public.metricsSince].reduce((max, c) => c > max ? c : max)
})
</script>
