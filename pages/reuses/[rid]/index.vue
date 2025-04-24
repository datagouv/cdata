<template>
  <div class="divide-y divide-gray-default *:py-5">
    <section>
      <h2 class="uppercase text-sm mb-2.5">
        {{ $t('Description') }}
      </h2>
      <div class="flex flex-wrap">
        <MarkdownViewer
          class="w-full md:w-9/12"
          :content="reuse.description"
          :min-heading="3"
        />
        <div class="w-full md:w-3/12">
          <dl class="p-0 space-y-5">
            <div>
              <dt class="font-bold text-sm pb-1">
                {{ $t('Topic') }}
              </dt>
              <dd class="p-0 text-sm text-mention-grey">
                {{ reuse.topic }}
              </dd>
            </div>
            <div>
              <dt class="font-bold text-sm pb-1">
                {{ $t('Type') }}
              </dt>
              <dd class="p-0 text-sm text-mention-grey">
                {{ label }}
              </dd>
            </div>
            <div>
              <dt class="font-bold text-sm pb-1">
                {{ $t('Tags') }}
              </dt>
              <dd class="flex flex-wrap gap-0.5 p-0 text-sm">
                <span
                  v-for="tag in reuse.tags"
                  :key="tag"
                  class="text-xs px-2 py-1 rounded-xl bg-gray-default"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="!reuse.tags?.length"
                  class="text-mention-grey"
                >
                  {{ $t('No tags set') }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="font-bold text-sm pb-1">
                {{ $t('Last update') }}
              </dt>
              <dd class="p-0 text-sm text-mention-grey">
                {{ formatDate(reuse.last_modified) }}
              </dd>
            </div>
            <div>
              <dt class="font-bold text-sm pb-1">
                {{ $t('Creation date') }}
              </dt>
              <dd class="p-0 text-sm text-mention-grey">
                {{ formatDate(reuse.created_at) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
    <section>
      <h2 class="uppercase text-sm mb-2.5">
        {{ $t('{n} associated datasets', { n: reuse.metrics.datasets }) }}
      </h2>
      <div class="grid md:grid-cols-2 gap-5">
        <DatasetCardLg
          v-for="dataset in reuse.datasets"
          :key="dataset.id"
          :dataset="dataset"
          :show-description="false"
          class="m-0"
        />
      </div>
    </section>
    <section>
      <div class="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h2 class="uppercase text-sm mb-0">
            {{ $t('Statistics for the last 12 months') }}
          </h2>
          <div class="text-gray-medium font-normal text-sm/6">
            <span v-if="new Date().getHours() > 7 - 1">{{ $t('Updated this morning') }}</span>
            <span v-else>{{ $t('Updated yesterday') }}</span>
          </div>
        </div>
        <div>
          <BrandedButton
            :disabled="!downloadStatsUrl"
            :href="downloadStatsUrl || ''"
            rel="ugc nofollow noopener"
            download="stats.csv"
            :icon="RiDownloadLine"
            color="secondary"
            size="xs"
            class="relative z-2"
          >
            {{ $t('Download the statistics as CSV') }}
          </BrandedButton>
        </div>
      </div>
      <div class="grid md:grid-cols-3">
        <StatBox
          :title="$t('Views')"
          :data="metricsViews"
          type="line"
          :summary="metricsViewsTotal"
          class="mb-8 md:mb-0"
        />
        <StatBox
          :title="$t('Followers')"
          type="line"
          :summary="reuse.metrics.followers"
          class="mb-8 md:mb-0"
        />
      </div>
    </section>
    <section>
      <LoadingBlock
        :status
        class="min-h-32"
      >
        <h2 class="uppercase text-sm mb-2.5">
          {{ $t('{n} reuses from the same creator', { n: relatedReuses.total }) }}
        </h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ReuseCard
            v-for="related in relatedReuses.data"
            :key="related.id"
            :reuse="related"
          />
        </div>
        <Pagination
          v-if="relatedReuses.total > relatedReuses.page_size"
          class="mt-3"
          :page="relatedReuses.page"
          :page-size="relatedReuses.page_size"
          :total-results="relatedReuses.total"
          :link="getLink"
          @change="change"
        />
      </LoadingBlock>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReuseType, BrandedButton, Pagination, StatBox, type Reuse } from '@datagouv/components-next'
import { RiDownloadLine } from '@remixicon/vue'
import type { LocationQueryValue } from 'vue-router'
import ReuseCard from '~/components/Reuses/ReuseCard.vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  reuse: Reuse
}>()

const route = useRoute()
const page = ref(parseInt(route.query.page as LocationQueryValue ?? '1', 10))

const { label } = useReuseType(props.reuse.type)

const { data: relatedReuses, status } = await useAPI<PaginatedArray<Reuse>>(`/api/2/reuses/search/`, {
  headers: {
    'X-Fields': reusesXFields,
  },
  params: {
    page,
    page_size: 3,
    organization: props.reuse.organization?.id,
    owner: props.reuse.owner?.id,
  },
})

const metricsViews = ref<null | Record<string, number>>(null)
const metricsViewsTotal = ref<null | number>(null)

watchEffect(async () => {
  if (!props.reuse.id) return
  const metrics = await getReuseMetrics(props.reuse.id)
  metricsViews.value = metrics.reuseViews
  metricsViewsTotal.value = metrics.reuseViewsTotal
})

const downloadStatsUrl = computed(() => {
  if (!metricsViews.value) {
    return null
  }

  return createReuseMetricsUrl(metricsViews.value)
})

function change(newPage: number) {
  page.value = newPage
  return navigateTo({
    ...route,
    query: {
      ...route.query,
      page: newPage,
    },
  })
}
</script>
