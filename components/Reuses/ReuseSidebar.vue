<template>
  <dl class="m-0 space-y-4 p-0">
    <div>
      <DescriptionListTerm>{{ $t('Thématique') }}</DescriptionListTerm>
      <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
        <template v-if="topic">
          {{ topic }}
        </template>
        <MetadataEmptyValue v-else />
      </dd>
    </div>
    <div>
      <DescriptionListTerm>{{ $t('Type') }}</DescriptionListTerm>
      <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
        <template v-if="label">
          {{ label }}
        </template>
        <MetadataEmptyValue v-else />
      </dd>
    </div>
    <div>
      <DescriptionListTerm>{{ $t('Mots clés') }}</DescriptionListTerm>
      <dd class="m-0 flex flex-wrap gap-2 p-0 text-sm/[22px] text-gray-title">
        <Tag
          v-for="tag in reuse.tags"
          :key="tag"
        >
          {{ tag }}
        </Tag>
        <MetadataEmptyValue v-if="!reuse.tags?.length" />
      </dd>
    </div>
    <div>
      <DescriptionListTerm>{{ $t('Dernière mise à jour') }}</DescriptionListTerm>
      <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
        <FormattedDate :date="reuse.last_modified" />
      </dd>
    </div>
    <div>
      <DescriptionListTerm>{{ $t('Date de création') }}</DescriptionListTerm>
      <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
        <FormattedDate :date="reuse.created_at" />
      </dd>
    </div>
    <div v-if="showMetrics && !metricsError">
      <!-- ClientOnly: the loading skeletons of StatBox get their ids from
           `Math.random()`, which differ between the server and the client render. -->
      <ClientOnly>
        <!-- `?? null`: StatBox shows its loading skeletons on a strict `null`, and
             `data` is `undefined` until the request answers. -->
        <StatBox
          :title="$t('Vues')"
          :data="reuseMetrics?.visits ?? null"
          size="sm"
          type="line"
          :summary="reuseMetrics?.visitsTotal ?? null"
          :since="metricsSince"
        />
      </ClientOnly>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { FormattedDate, getTopic, MetadataEmptyValue, StatBox, Tag, useMetrics, useReuseType, type Reuse, type ReuseTopic } from '@datagouv/components-next'
import DescriptionListTerm from '~/components/DescriptionList/DescriptionListTerm.vue'

// Side metadata of a reuse page. Also shown on /design/metadata: the design page and
// the reuse pages render this same component, so they cannot drift apart.
const props = withDefaults(defineProps<{
  reuse: Reuse
  // The design page leaves the statistics out of its demonstration.
  showMetrics?: boolean
}>(), {
  showMetrics: true,
})

const config = useRuntimeConfig()

const { label } = useReuseType(props.reuse.type)
const { data: topics } = await useAPI<Array<ReuseTopic>>('/api/1/reuses/topics/')
const topic = computed(() => getTopic(topics.value ?? [], props.reuse.topic))

const metricsSince = computed(() => {
  // max of the start of metrics computing and the creation of the reuse on the platform
  return [props.reuse.created_at, config.public.metricsSince].reduce((max, c) => c > max ? c : max)
})

const { getReuseMetrics } = useMetrics()

// `server: false` keeps the call out of the render: the metrics API is a third-party service
// and its numbers are secondary to the page, so waiting for it would delay the whole page.
// The box disappears on `error` rather than loading forever.
const { data: reuseMetrics, error: metricsError } = useAsyncData(
  'reuse-metrics',
  () => props.reuse.id ? getReuseMetrics(props.reuse.id) : Promise.resolve(null),
  { lazy: true, server: false, immediate: props.showMetrics, watch: [() => props.reuse.id] },
)
</script>
