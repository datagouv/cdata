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
      Explorer les données tabulaires
    </h1>
    <p class="text-gray-medium mb-6">
      À ce stade, seuls les fichiers tabulaires de moins de
      <strong>100 Mo</strong> sont disponibles.
    </p>

    <form @submit.prevent="() => execute()">
      <SearchInput
        v-model="query"
        placeholder="Rechercher un fichier (exemple : élections)…"
      />
    </form>

    <p
      v-show="status === 'pending'"
      class="mt-4 text-sm text-gray-medium"
    >
      Chargement…
    </p>

    <div
      v-if="flatResults.length > 0"
      class="mt-6 space-y-3"
    >
      <p class="text-sm text-gray-medium">
        {{ results!.total }} résultat{{ results!.total > 1 ? 's' : '' }}
      </p>
      <DatasetCard
        v-for="entry in flatResults"
        :key="`${entry.dataset.id}-${entry.resource.id}`"
        :dataset="entry.dataset"
        :dataset-url="exploreLink(entry.resource.id)"
      >
        <p class="text-sm text-gray-700 mb-0">
          Fichier : <strong>{{ entry.resource.title || 'Sans titre' }}</strong>
        </p>
      </DatasetCard>
    </div>

    <p
      v-else-if="results && status === 'success' && query"
      class="mt-4 text-sm text-gray-medium italic"
    >
      Aucun résultat
    </p>

    <div
      v-if="featuredEntries && featuredEntries.length > 0"
      class="mt-12 space-y-3"
    >
      <h2 class="text-gray-title font-extrabold text-xl mb-2">
        Quelques exemples
      </h2>
      <p class="text-gray-medium">
        Si vous ne savez pas par quoi commencer à explorer, nous vous
        proposons ci-dessous une sélection de quelques jeux de données.
      </p>
      <DatasetCard
        v-for="entry in featuredEntries"
        :key="`${entry.dataset.id}-${entry.resource.id}`"
        :dataset="entry.dataset"
        :dataset-url="exploreLink(entry.resource.id)"
      >
        <p class="text-sm text-gray-700 mb-0">
          Fichier : <strong>{{ entry.resource.title || 'Sans titre' }}</strong>
        </p>
      </DatasetCard>
    </div>
  </div>

  <div
    v-else
    class="px-4 py-4"
  >
    <NuxtLink
      :to="backLink"
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm mb-4"
    >
      ← Retour à la recherche
    </NuxtLink>
    <TabularExplorer
      :key="resourceId"
      :resource-id="resourceId"
    />
  </div>
</template>

<script setup lang="ts">
import { DatasetCard, SearchInput, TabularExplorer, useHasTabularData } from '@datagouv/components-next'
import type { Dataset, DatasetV2, Resource } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import type { PaginatedArray } from '~/types/types'

useSeoMeta({
  title: 'Explorer les données tabulaires',
  description: 'Explorer facilement les fichiers tabulaires (CSV, XLSX) référencés sur data.gouv.fr.',
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

const backLink = computed(() => {
  const q = { ...route.query }
  delete q.resource_id
  return { query: q }
})

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
  return { query: { ...route.query, resource_id: id } }
}
</script>
