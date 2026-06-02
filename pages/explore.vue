<template>
  <div
    v-if="!resourceId"
    class="container mb-16"
  >
    <Breadcrumb>
      <BreadcrumbItem to="/">
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Explorer') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="text-gray-title font-extrabold text-2xl mb-2">
      {{ $t('Explorer les données tabulaires') }}
    </h1>
    <TranslationT
      keypath="À ce stade, seuls les fichiers tabulaires de moins de {size} sont disponibles."
      tag="p"
      class="text-gray-medium mb-6"
    >
      <template #size>
        <strong>{{ $t('100 Mo') }}</strong>
      </template>
    </TranslationT>

    <form @submit.prevent="() => execute()">
      <SearchInput
        v-model="query"
        :placeholder="$t('Rechercher un fichier (exemple : élections)…')"
      />
    </form>

    <p
      v-show="status === 'pending'"
      class="mt-4 text-sm text-gray-medium"
    >
      {{ $t('Chargement…') }}
    </p>

    <div
      v-if="flatResults.length > 0"
      class="mt-6 space-y-3"
    >
      <p class="text-sm text-gray-medium">
        {{ $t('{n} résultat | {n} résultats', results!.total) }}
      </p>
      <DatasetCard
        v-for="entry in flatResults"
        :key="`${entry.dataset.id}-${entry.resource.id}`"
        :dataset="entry.dataset"
        :dataset-url="exploreLink(entry.resource.id)"
      >
        <TranslationT
          keypath="Fichier : {file}"
          tag="p"
          class="text-sm text-gray-700 mb-0"
        >
          <template #file>
            <strong>{{ entry.resource.title || $t('Sans titre') }}</strong>
          </template>
        </TranslationT>
      </DatasetCard>
    </div>

    <div
      v-else-if="results && status === 'success' && query"
      class="mt-8 flex flex-col items-center text-center py-8"
    >
      <img
        src="/illustrations/magnifying_glass.svg"
        class="h-20 mb-4"
        alt=""
      >
      <p class="font-bold mb-2">
        {{ $t('Pas de résultats pour « {q} »', { q: query }) }}
      </p>
      <p class="text-sm text-gray-medium mb-4">
        {{ $t('Essayez avec d\'autres mots-clés ou parcourez la sélection ci-dessous.') }}
      </p>
      <BrandedButton
        color="secondary"
        @click="query = ''"
      >
        {{ $t('Réinitialiser la recherche') }}
      </BrandedButton>
    </div>

    <div
      v-if="featuredEntries && featuredEntries.length > 0"
      class="mt-12 space-y-3"
    >
      <h2 class="text-gray-title font-extrabold text-xl mb-2">
        {{ $t('Quelques exemples') }}
      </h2>
      <p class="text-gray-medium">
        {{ $t('Si vous ne savez pas par quoi commencer à explorer, nous vous proposons ci-dessous une sélection de quelques jeux de données.') }}
      </p>
      <DatasetCard
        v-for="entry in featuredEntries"
        :key="`${entry.dataset.id}-${entry.resource.id}`"
        :dataset="entry.dataset"
        :dataset-url="exploreLink(entry.resource.id)"
      >
        <TranslationT
          keypath="Fichier : {file}"
          tag="p"
          class="text-sm text-gray-700 mb-0"
        >
          <template #file>
            <strong>{{ entry.resource.title || $t('Sans titre') }}</strong>
          </template>
        </TranslationT>
      </DatasetCard>
    </div>
  </div>

  <ExploreResourceView
    v-else-if="currentResource && currentDataset"
    :resource="currentResource"
    :dataset="currentDataset"
  />
</template>

<script setup lang="ts">
import {
  BrandedButton,
  DatasetCard,
  SearchInput,
  TranslationT,
  useHasTabularData,
  useTranslation,
} from '@datagouv/components-next'
import type { Dataset, DatasetV2, Resource } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import type { PaginatedArray } from '~/types/types'

const { t } = useTranslation()

useSeoMeta({
  title: () => t('Explorer les données tabulaires'),
  description: () => t('Explorer facilement les fichiers tabulaires (CSV, XLSX) référencés sur data.gouv.fr.'),
  robots: 'noindex',
})

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()

const featuredResourceIds = config.public.featuredResourceIds

const query = computed({
  get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
  set: (v: string) => {
    const q = { ...route.query }
    if (v) q.q = v
    else delete q.q
    router.replace({ query: q })
  },
})

const resourceId = computed(() =>
  typeof route.query.resource_id === 'string' ? route.query.resource_id : '',
)

const searchParams = computed(() => ({ q: query.value, page_size: 10, format: 'csv' }))

const { data: results, status, execute } = await useAPI<PaginatedArray<Dataset>>(
  '/api/1/datasets/',
  {
    query: searchParams,
    immediate: !!query.value,
    watch: false,
  },
)

const hasTabularData = useHasTabularData()

function explorableResources(dataset: Dataset) {
  return dataset.resources.filter(hasTabularData)
}

type ResourceInDataset = { dataset: Dataset | DatasetV2, resource: Resource }

const flatResults = computed<ResourceInDataset[]>(() => {
  const out: ResourceInDataset[] = []
  for (const dataset of results.value?.data ?? []) {
    for (const resource of explorableResources(dataset)) {
      out.push({ dataset, resource })
    }
  }
  return out
})

const { data: featuredEntries } = await useAsyncData(
  'explore-featured',
  async () => {
    const entries = await Promise.all(
      featuredResourceIds.map(async (id): Promise<ResourceInDataset | null> => {
        try {
          const r = await $api<{ resource: Resource, dataset_id: string }>(
            `/api/2/datasets/resources/${id}/`,
          )
          const dataset = await $api<DatasetV2>(`/api/2/datasets/${r.dataset_id}/`)
          return { dataset, resource: r.resource }
        }
        catch {
          return null
        }
      }),
    )
    return entries.filter((e): e is ResourceInDataset => e !== null)
  },
)

function exploreLink(id: string) {
  return { query: { ...route.query, resource_id: id, tab: undefined } }
}

// Resource view: fetch the current resource + its parent dataset
type ResourceWithDataset = { resource: Resource, dataset_id: string }

const { data: resourceData } = await useAsyncData(
  'explore-current-resource',
  async () => {
    if (!resourceId.value) return null
    try {
      const r = await $api<ResourceWithDataset>(
        `/api/2/datasets/resources/${resourceId.value}/`,
      )
      const dataset = await $api<Dataset>(`/api/1/datasets/${r.dataset_id}/`)
      return { resource: r.resource, dataset }
    }
    catch {
      return null
    }
  },
  { watch: [resourceId] },
)

const currentResource = computed(() => resourceData.value?.resource ?? null)
const currentDataset = computed(() => resourceData.value?.dataset ?? null)
</script>
