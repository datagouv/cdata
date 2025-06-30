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
                {{ $t('Thématique') }}
              </dt>
              <dd class="p-0 text-sm text-mention-grey">
                {{ topic }}
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
                {{ $t('Mots clés') }}
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
                  {{ $t('Aucun mot clé') }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="font-bold text-sm pb-1">
                {{ $t('Dernière mise à jour') }}
              </dt>
              <dd class="p-0 text-sm text-mention-grey">
                {{ formatDate(reuse.last_modified) }}
              </dd>
            </div>
            <div>
              <dt class="font-bold text-sm pb-1">
                {{ $t('Date de création') }}
              </dt>
              <dd class="p-0 text-sm text-mention-grey">
                {{ formatDate(reuse.created_at) }}
              </dd>
            </div>
            <div>
              <StatBox
                :title="$t('Vues')"
                :data="metricsViews"
                size="sm"
                type="line"
                :summary="metricsViewsTotal"
                class="mb-8 md:mb-0"
              />
            </div>
          </dl>
        </div>
      </div>
    </section>
    <section v-if="datasets">
      <h2 class="uppercase text-sm mb-2.5">
        {{ $t('aucun jeu de données associé | {n} jeu de données associé | {n} jeux de données associés', { n: datasets.total }) }}
      </h2>
      <div
        class="grid gap-5"
        :class="{
          'lg:grid-cols-2': datasets.total > 1,
        }"
      >
        <DatasetCardLg
          v-for="dataset in datasets.data"
          :key="dataset.id"
          :dataset="dataset"
          :show-description="datasets.total === 1"
          class="m-0"
        />
      </div>
      <Pagination
        class="mt-4"
        :page="datasetsPage"
        :page-size="datasetsPageSize"
        :total-results="datasets.total"
        @change="(changedPage: number) => datasetsPage = changedPage"
      />
    </section>
    <section>
      <LoadingBlock
        :status
        class="min-h-32"
      >
        <h2 class="uppercase text-sm mb-2.5">
          {{ $t('{n} réutilisations du même créateur | {n} réutilisation du même créateur | {n} réutilisations du même créateur', { n: relatedReuses.length }) }}
        </h2>
        <div
          v-if="relatedReuses.length"
          class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <ReuseCard
            v-for="related in relatedReuses"
            :key="related.id"
            :reuse="related"
          />
        </div>
        <div
          v-else
          class="flex flex-col items-center"
        >
          <NuxtImg
            src="/illustrations/reuse.svg"
            width="137"
            height="104"
          />
          <p class="mt-4 mb-5 font-bold text-lg">
            {{ $t(`Il n'y a pas d'autres réutilisations du même créateur.`) }}
          </p>
        </div>
      </LoadingBlock>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useReuseType, StatBox, type Reuse, type ReuseTopic, type DatasetV2, Pagination, useFormatDate } from '@datagouv/components-next'
import ReuseCard from '~/components/Reuses/ReuseCard.vue'
import { getTopic } from '~/datagouv-components/src/functions/reuses'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  reuse: Reuse
}>()

const { formatDate } = useFormatDate()

const { label } = useReuseType(props.reuse.type)

const { data: topics } = await useAPI<Array<ReuseTopic>>('/api/1/reuses/topics/')

const datasetsPage = ref(1)
const datasetsPageSize = ref(10)
const datasetsQuery = computed(() => {
  return {
    page: datasetsPage.value,
    page_size: datasetsPageSize.value,
    reuse: props.reuse.id,
  }
})
const { data: datasets } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets/', { query: datasetsQuery })

const topic = computed(() => getTopic(topics.value, props.reuse.topic))

const { data: reuses, status } = await useAPI<PaginatedArray<Reuse>>(`/api/2/reuses/search/`, {
  headers: {
    'X-Fields': reusesXFields,
  },
  params: {
    page: 1,
    page_size: 4,
    organization: props.reuse.organization?.id,
    owner: props.reuse.owner?.id,
  },
})

// We want 3 reuses, but we don't want the one from the current page
const relatedReuses = computed(() => reuses.value.data.filter(r => props.reuse.id != r.id).slice(0, 3))

const metricsViews = ref<null | Record<string, number>>(null)
const metricsViewsTotal = ref<null | number>(null)

watchEffect(async () => {
  if (!props.reuse.id) return
  const metrics = await getReuseMetrics(props.reuse.id)
  metricsViews.value = metrics.reuseViews
  metricsViewsTotal.value = metrics.reuseViewsTotal
})
</script>
