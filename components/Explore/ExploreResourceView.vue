<template>
  <div class="mb-16">
    <div class="container">
      <Breadcrumb>
        <BreadcrumbItem to="/">
          {{ $t('Accueil') }}
        </BreadcrumbItem>
        <BreadcrumbItem :to="backLink">
          {{ $t('Explorer') }}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {{ resource.title || $t('Fichier sans nom') }}
        </BreadcrumbItem>
      </Breadcrumb>

      <header class="flex flex-wrap md:flex-nowrap gap-4 items-start justify-between mb-4">
        <div class="min-w-0">
          <ResourceSelector
            :resources="datasetResources"
            :selected-id="resource.id"
            searchable
            :is-disabled="(r) => !hasTabularData(r)"
            :disabled-title="$t('Cette ressource n\'est pas explorable')"
            @select="onResourceSelect"
          >
            <template #trigger="{ open }">
              <PopoverButton
                class="inline-flex items-center gap-1 -mx-1 px-1 py-1 rounded text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-new-primary"
              >
                <ResourceIcon
                  :resource="resource"
                  class="size-4 mr-1 shrink-0"
                />
                <span class="text-lg font-bold line-clamp-2">
                  {{ resource.title || $t('Fichier sans nom') }}
                </span>
                <RiArrowDownSLine
                  class="size-4 shrink-0 text-gray-medium"
                  :class="{ 'rotate-180': open }"
                  aria-hidden="true"
                />
              </PopoverButton>
            </template>
          </ResourceSelector>
          <div class="text-sm text-gray-medium flex items-center gap-1 mt-1">
            <ObjectCardOwner
              :organization="dataset.organization"
              :owner="dataset.owner"
            />
            <template v-if="resource.format">
              <span>·</span>
              <span>{{ resource.format.toLowerCase() }}</span>
            </template>
          </div>
        </div>
        <BrandedButton
          :href="resource.latest"
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
        :key="resource.id"
        :resource-id="resource.id"
      />
    </div>
    <div
      v-show="activeTabKey !== 'data'"
      class="container mt-4"
    >
      <DataStructure
        v-if="activeTabKey === 'data-structure'"
        :resource="resource"
      />
      <MarkdownViewer
        v-else-if="activeTabKey === 'description'"
        :content="resource.description ?? ''"
        size="sm"
      />
      <Metadata
        v-else-if="activeTabKey === 'metadata'"
        :resource="resource"
      />
      <Downloads
        v-else-if="activeTabKey === 'downloads'"
        :resource="resource"
        :dataset="dataset"
      />
      <OpenApiViewer
        v-else-if="activeTabKey === 'swagger'"
        :url="`${tabularApiUrl}/api/resources/${resource.id}/swagger/`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PopoverButton } from '@headlessui/vue'
import { RiArrowDownSLine, RiDownloadLine } from '@remixicon/vue'
import {
  BrandedButton,
  DataStructure,
  Downloads,
  MarkdownViewer,
  Metadata,
  ObjectCardOwner,
  OpenApiViewer,
  ResourceIcon,
  ResourceSelector,
  Tab,
  TabGroup,
  TabList,
  TabularExplorer,
  provideTabularProfile,
  useHasTabularData,
  useResourceCapabilities,
} from '@datagouv/components-next'
import type { Dataset, Resource } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const props = defineProps<{
  resource: Resource
  dataset: Dataset
}>()

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const tabularApiUrl = config.public.tabularApiUrl

const backLink = computed(() => {
  const params = new URLSearchParams()
  if (typeof route.query.q === 'string' && route.query.q) params.set('q', route.query.q)
  const qs = params.toString()
  return qs ? `/explore?${qs}` : '/explore'
})

const hasTabularData = useHasTabularData()
const datasetResources = computed<Resource[]>(() => props.dataset.resources ?? [])

function onResourceSelect(resource: Resource) {
  router.push({ query: { ...route.query, resource_id: resource.id, tab: undefined } })
}

// Share the tabular profile fetch between the TabularExplorer and DataStructure
// tabs. Mounting this component only when a resource exists guarantees the id is
// always valid, so we never fetch a null profile URL.
await provideTabularProfile(() => props.resource.id)

const { tabsOptions } = useResourceCapabilities(() => props.resource, () => props.dataset)

// Map tab is out of scope per current product decision; everything else from useResourceCapabilities is shown.
const displayedTabs = computed(() => tabsOptions.value.filter(tab => tab.key !== 'map'))

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
</script>
