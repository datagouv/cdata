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

  <div
    v-else-if="currentResource && currentDataset"
    class="mb-16"
  >
    <div class="container">
      <Breadcrumb>
        <BreadcrumbItem to="/">
          {{ $t('Accueil') }}
        </BreadcrumbItem>
        <BreadcrumbItem :to="backLink">
          {{ $t('Explorer') }}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {{ currentResource.title || $t('Fichier sans nom') }}
        </BreadcrumbItem>
      </Breadcrumb>

      <header class="flex flex-wrap md:flex-nowrap gap-4 items-start justify-between mb-4">
        <div class="min-w-0">
          <Popover
            v-slot="{ open, close }"
            class="relative inline-block"
          >
            <PopoverButton
              class="inline-flex items-center gap-1 -mx-1 px-1 py-1 rounded text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-new-primary"
            >
              <ResourceIcon
                :resource="currentResource"
                class="size-4 mr-1 shrink-0"
              />
              <span class="text-lg font-bold line-clamp-2">
                {{ currentResource.title || $t('Fichier sans nom') }}
              </span>
              <RiArrowDownSLine
                class="size-4 shrink-0 text-gray-medium"
                :class="{ 'rotate-180': open }"
                aria-hidden="true"
              />
            </PopoverButton>
            <PopoverPanel
              class="absolute left-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-default rounded shadow-lg p-3 space-y-2"
            >
              <input
                v-model="dropdownQuery"
                type="search"
                class="w-full border border-gray-default rounded px-2.5 py-1.5 text-sm"
                :placeholder="$t('Rechercher dans les ressources…')"
              >
              <ul
                v-if="filteredDatasetResources.length > 0"
                class="list-none p-0 m-0 space-y-0.5 max-h-80 overflow-y-auto"
              >
                <li
                  v-for="r in filteredDatasetResources"
                  :key="r.id"
                >
                  <NuxtLink
                    v-if="isExplorable(r)"
                    :to="exploreLink(r.id)"
                    class="flex items-center gap-1.5 px-2 py-1.5 rounded text-sm hover:bg-gray-100"
                    :class="{ 'font-bold bg-blue-50': r.id === currentResource.id }"
                    @click="close()"
                  >
                    <ResourceIcon
                      :resource="r"
                      class="size-3.5 shrink-0"
                    />
                    <span class="truncate">{{ r.title || $t('Fichier sans nom') }}</span>
                  </NuxtLink>
                  <div
                    v-else
                    class="flex items-center gap-1.5 px-2 py-1.5 rounded text-sm text-gray-medium cursor-not-allowed"
                    :title="$t('Cette ressource n\'est pas explorable')"
                  >
                    <ResourceIcon
                      :resource="r"
                      class="size-3.5 shrink-0 opacity-50"
                    />
                    <span class="truncate opacity-70">{{ r.title || $t('Fichier sans nom') }}</span>
                  </div>
                </li>
              </ul>
              <p
                v-else
                class="text-sm text-gray-medium italic mb-0 px-2 py-2"
              >
                {{ $t('Aucune ressource correspondante') }}
              </p>
            </PopoverPanel>
          </Popover>
          <div class="text-sm text-gray-medium flex items-center gap-1 mt-1">
            <ObjectCardOwner
              :organization="currentDataset.organization"
              :owner="currentDataset.owner"
            />
            <template v-if="currentResource.format">
              <span>·</span>
              <span>{{ currentResource.format.toLowerCase() }}</span>
            </template>
          </div>
        </div>
        <BrandedButton
          :href="currentResource.latest"
          :icon="RiDownloadLine"
          rel="ugc nofollow noopener"
          download
          external
          class="shrink-0"
        >
          {{ $t('Télécharger') }}
        </BrandedButton>
      </header>

      <TabGroup
        :default-index="defaultTabIndex"
        @change="onTabChange"
      >
        <TabList class="max-w-full overflow-x-auto">
          <Tab
            v-for="tab in displayedTabs"
            :key="tab.key"
          >
            {{ tab.label }}
          </Tab>
        </TabList>
      </TabGroup>
    </div>

    <!-- Data tab is lazy-mounted (only when first visited) to avoid
         TabularExplorer's top-level `await useFetch` blocking the page
         when landing directly on a different tab. Once mounted, we keep
         it via `v-show` so quick tab switches don't unmount mid-fetch
         (which would leave Suspense hanging on a stale promise). -->
    <div
      v-show="activeTabKey === 'data'"
      class="mt-4 px-4"
    >
      <TabularExplorer
        v-if="hasVisitedDataTab"
        :key="currentResource.id"
        :resource-id="currentResource.id"
      />
    </div>
    <div
      v-show="activeTabKey !== 'data'"
      class="container mt-4"
    >
      <DataStructure
        v-if="activeTabKey === 'data-structure'"
        :resource="currentResource"
      />
      <MarkdownViewer
        v-else-if="activeTabKey === 'description'"
        :content="currentResource.description ?? ''"
        size="sm"
      />
      <Metadata
        v-else-if="activeTabKey === 'metadata'"
        :resource="currentResource"
      />
      <Downloads
        v-else-if="activeTabKey === 'downloads'"
        :resource="currentResource"
        :dataset="currentDataset"
      />
      <OpenApiViewer
        v-else-if="activeTabKey === 'swagger'"
        :url="`${tabularApiUrl}/api/resources/${currentResource.id}/swagger/`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { RiArrowDownSLine, RiDownloadLine } from '@remixicon/vue'
import {
  BrandedButton,
  DatasetCard,
  DataStructure,
  Downloads,
  MarkdownViewer,
  Metadata,
  ObjectCardOwner,
  OpenApiViewer,
  ResourceIcon,
  SearchInput,
  Tab,
  TabGroup,
  TabList,
  TabularExplorer,
  TranslationT,
  provideTabularProfile,
  useHasTabularData,
  useResourceCapabilities,
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
const tabularApiUrl = config.public.tabularApiUrl

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
  const params = new URLSearchParams()
  if (typeof route.query.q === 'string' && route.query.q) params.set('q', route.query.q)
  const qs = params.toString()
  return qs ? `/explore?${qs}` : '/explore'
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

// Share the tabular profile fetch between TabularExplorer and DataStructure tabs.
provideTabularProfile(() => currentResource.value?.id ?? '')

const { tabsOptions } = useResourceCapabilities(
  () => currentResource.value as Resource,
  () => currentDataset.value as Dataset,
)

// Map tab is out of scope per current product decision; everything else from useResourceCapabilities is shown.
const displayedTabs = computed(() =>
  currentResource.value ? tabsOptions.value.filter(tab => tab.key !== 'map') : [],
)

const defaultTabIndex = computed(() => {
  const tabKey = typeof route.query.tab === 'string' ? route.query.tab : null
  if (!tabKey) return 0
  const idx = displayedTabs.value.findIndex(tab => tab.key === tabKey)
  return idx >= 0 ? idx : 0
})

const activeTabKey = computed(() => {
  const tabKey = typeof route.query.tab === 'string' ? route.query.tab : null
  if (tabKey && displayedTabs.value.some(tab => tab.key === tabKey)) return tabKey
  return displayedTabs.value[0]?.key ?? 'data'
})

// Lazy-mount TabularExplorer: only mount it the first time the user lands on
// (or switches to) the Data tab. Once mounted, we keep it via v-show even
// when other tabs are active, so we don't pay the suspended-fetch cost on
// quick tab switches.
const hasVisitedDataTab = ref(false)
watch(activeTabKey, (key) => {
  if (key === 'data') hasVisitedDataTab.value = true
}, { immediate: true })

function onTabChange(index: number) {
  const tab = displayedTabs.value[index]
  if (!tab) return
  const q = { ...route.query }
  if (tab.key === 'data') delete q.tab
  else q.tab = tab.key
  router.replace({ query: q })
}

// Resource picker dropdown in the title — filters resources of current dataset by title.
// Non-tabular ones are shown but disabled (only tabular resources can be explored on /explore).
const dropdownQuery = ref('')

const datasetResources = computed<Resource[]>(() => currentDataset.value?.resources ?? [])

const filteredDatasetResources = computed(() => {
  const q = dropdownQuery.value.trim().toLowerCase()
  if (!q) return datasetResources.value
  return datasetResources.value.filter(r => (r.title ?? '').toLowerCase().includes(q))
})

function isExplorable(resource: Resource) {
  return hasTabularData(resource)
}
</script>
