<template>
  <div :class="[{ 'border border-gray-default': bordered }, fullscreen ? 'flex min-h-0 flex-1 flex-col' : '']">
    <ResourceViewerHeader
      :dataset
      :resource
      :resources
      :resource-to
      :explore-to="exploreTo"
      :replace
      :fullscreen
    />

    <section :class="fullscreen ? 'flex min-h-0 flex-1 flex-col' : ''">
      <TabGroup
        size="sm"
        :default-index="defaultTabIndex"
        :class="fullscreen ? 'flex min-h-0 flex-1 flex-col' : ''"
        @change="switchTab"
      >
        <div class="flex shrink-0 items-center border-b border-gray-default p-2">
          <TabList class="max-w-full overflow-x-auto">
            <Tab
              v-for="tab in tabsOptions"
              :key="tab.key"
            >
              {{ tab.label }}
            </Tab>
          </TabList>
        </div>
        <TabPanels :class="fullscreen ? 'flex min-h-0 flex-1 flex-col' : ''">
          <TabPanel
            v-for="tab in tabsOptions"
            :key="tab.key"
            :class="[tab.key === 'data' || tab.key === 'map' ? '' : 'p-4', fullscreen ? 'flex min-h-0 flex-1 flex-col' : '']"
          >
            <div
              v-if="tab.key === 'map'"
              :class="fullscreen ? 'flex min-h-0 flex-1 flex-col' : 'h-[600px]'"
            >
              <Pmtiles
                v-if="hasPmtiles"
                :resource="resource"
                :dataset="dataset"
              />
              <MapContainer
                v-if="ogcWms"
                :resource="resource"
              />
              <PreviewUnavailable v-if="!hasPmtiles && !ogcWms && hasPmtilesError">
                {{ t("La carte n'a pas pu être générée automatiquement pour ce fichier.") }}
                <br>
                <span class="text-gray-medium text-xs">{{ pmtilesError }}</span>
              </PreviewUnavailable>
            </div>
            <div
              v-if="tab.key === 'data'"
              :class="fullscreen ? 'flex min-h-0 flex-1 flex-col' : ''"
            >
              <!-- Interactive table: full width, composes its own framed toolbar + table.
                   Wrapped in Suspense so switching to this tab (or loading its data) shows
                   the table skeleton instead of a blank gap while TabularExplorer resolves. -->
              <Suspense
                v-if="previewKind === 'tabular'"
                :timeout="200"
              >
                <TabularExplorer :resource-id="resource.id">
                  <div class="flex shrink-0 items-center gap-2 border-b border-gray-default p-2">
                    <div class="flex min-w-0 flex-1 items-center gap-1.5">
                      <TabularMobileFilterButton class="md:hidden" />
                      <div class="hidden md:block">
                        <TabularActiveFilters with-clear />
                      </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-4">
                      <TabularColumnsMenu />
                      <TabularRowsInfo />
                    </div>
                  </div>
                  <TabularTable :fill="fullscreen" />
                  <TabularMobileFilters />
                </TabularExplorer>
                <template #fallback>
                  <TabularSkeleton :fill="fullscreen" />
                </template>
              </Suspense>

              <!-- PDF is a full-bleed visual preview like the table and the map: it
                   owns its own reader backdrop, so it sits outside the padded wrapper. -->
              <PdfPreview
                v-else-if="previewKind === 'pdf'"
                :resource="resource"
                :fill="fullscreen"
              />

              <!-- Text previews stay padded inside the tab panel -->
              <div
                v-else
                class="p-4"
              >
                <JsonPreview
                  v-if="previewKind === 'json'"
                  :resource="resource"
                />
                <XmlPreview
                  v-else-if="previewKind === 'xml'"
                  :resource="resource"
                />
                <ImagePreview
                  v-else-if="previewKind === 'image'"
                  :resource="resource"
                />
                <DatafairPreview
                  v-else-if="previewKind === 'datafair'"
                  :resource="resource"
                  :dataset="dataset"
                />
                <OpenApiViewer
                  v-else-if="previewKind === 'openapi'"
                  :url="resource.extras['apidocUrl'] as string"
                />
                <PreviewUnavailable v-else>
                  <!-- "File too large to download" is the only analysis:error value from hydra for now -->
                  <template v-if="resource.extras['analysis:error'] === 'File too large to download'">
                    {{ t("Ce fichier est trop volumineux pour être analysé et prévisualisé. Téléchargez-le avec le bouton Télécharger.") }}
                  </template>
                  <template v-else-if="resource.extras['analysis:parsing:error']">
                    {{ t("L'analyse de ce fichier a rencontré une erreur, l'aperçu n'est pas disponible. Téléchargez-le avec le bouton Télécharger.") }}
                    <br>
                    <span class="text-gray-medium text-xs">{{ resource.extras['analysis:parsing:error'] }}</span>
                  </template>
                  <template v-else>
                    {{ t("Ce fichier ne peut pas être prévisualisé. Téléchargez-le avec le bouton Télécharger.") }}
                  </template>
                </PreviewUnavailable>
              </div>
            </div>
            <div v-if="tab.key === 'description'">
              <MarkdownViewer
                :content="resource.description || ''"
                size="sm"
              />
            </div>
            <div v-if="tab.key === 'data-structure'">
              <DataStructure
                v-if="hasTabularData"
                :resource="resource"
              />
            </div>
            <div v-if="tab.key === 'metadata'">
              <Metadata :resource />
            </div>
            <div v-if="tab.key === 'api'">
              <div class="fr-mb-4w">
                <p>{{ t("Cette API est générée automatiquement par {platform} à partir du fichier.", { platform: config.name }) }}</p>
                <p>{{ t("- Si le fichier est modifié, l'API sera mise à jour et sa structure pourra changer.") }}</p>
                <p>{{ t("- Si le fichier est supprimé, l'API sera également supprimée.") }}</p>
                <p>{{ t("Pour des usages pérennes, prévoyez que cette API dépend directement du fichier source.") }}</p>
                <p v-if="config.tabularApiUrl">
                  {{ t("L'URL de base de l'API est {url}", { url: config.tabularApiUrl }) }}
                </p>
              </div>
              <OpenApiViewer
                v-if="hasTabularData"
                :url="`${config.tabularApiUrl}/api/resources/${resource.id}/swagger/`"
              />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PreviewUnavailable from '../ResourceAccordion/PreviewUnavailable.vue'
import MarkdownViewer from '../MarkdownViewer.vue'
import OpenApiViewer from '../OpenApiViewer/OpenApiViewer.vue'
import TabGroup from '../Tabs/TabGroup.vue'
import TabList from '../Tabs/TabList.vue'
import Tab from '../Tabs/Tab.vue'
import TabPanels from '../Tabs/TabPanels.vue'
import TabPanel from '../Tabs/TabPanel.vue'
import TabularExplorer from '../TabularExplorer/TabularExplorer.vue'
import TabularActiveFilters from '../TabularExplorer/TabularActiveFilters.vue'
import TabularColumnsMenu from '../TabularExplorer/TabularColumnsMenu.vue'
import TabularRowsInfo from '../TabularExplorer/TabularRowsInfo.vue'
import TabularTable from '../TabularExplorer/TabularTable.vue'
import TabularMobileFilters from '../TabularExplorer/TabularMobileFilters.vue'
import TabularMobileFilterButton from '../TabularExplorer/TabularMobileFilterButton.vue'
import TabularSkeleton from '../TabularExplorer/TabularSkeleton.vue'
import DataStructure from '../ResourceAccordion/DataStructure.vue'
import Metadata from '../ResourceAccordion/Metadata.vue'
import ResourceViewerHeader from './ResourceViewerHeader.vue'
import { trackEvent } from '../../functions/matomo'
import { useComponentsConfig } from '../../config'
import { useTranslation } from '../../composables/useTranslation'
import { useResourceCapabilities } from '../../composables/useResourceCapabilities'
import { provideTabularProfile } from '../../composables/useTabularProfile'
import type { RouteLocationRaw } from 'vue-router'
import type { Resource } from '../../types/resources'
import type { Dataset, DatasetV2 } from '../../types/datasets'

const JsonPreview = defineAsyncComponent(() =>
  import('../ResourceAccordion/JsonPreview.client.vue'),
)
const PdfPreview = defineAsyncComponent(() =>
  import('../ResourceAccordion/PdfPreview.client.vue'),
)
const XmlPreview = defineAsyncComponent(() =>
  import('../ResourceAccordion/XmlPreview.client.vue'),
)
const ImagePreview = defineAsyncComponent(() =>
  import('../ResourceAccordion/ImagePreview.client.vue'),
)
const DatafairPreview = defineAsyncComponent(() =>
  import('../ResourceAccordion/Datafair.client.vue'),
)
const MapContainer = defineAsyncComponent(() =>
  import('../ResourceAccordion/MapContainer.client.vue'),
)
const Pmtiles = defineAsyncComponent(() =>
  import('../ResourceAccordion/Pmtiles.client.vue'),
)

const props = withDefaults(defineProps<{
  dataset: Dataset | DatasetV2
  resource: Resource
  resources?: Resource[]
  resourceTo: (resource: Resource) => RouteLocationRaw
  // When provided (inline mode), shows an "Explorer" button next to the download
  // action that opens the fullscreen explorer on the current resource.
  exploreTo?: (resource: Resource) => string
  replace?: boolean
  bordered?: boolean
  // Fullscreen mode: make the viewer a flex column so the table fills down to the
  // bottom, and hide the inline download/visit/copy actions — they're shown in the
  // dataset context bar above. Inline mode (dataset page) shows them in the header.
  fullscreen?: boolean
}>(), {
  bordered: true,
  fullscreen: false,
})

const { t } = useTranslation()
const config = useComponentsConfig()
const route = useRoute()
const router = useRouter()

const {
  previewKind,
  hasTabularData,
  hasPmtiles,
  hasPmtilesError,
  pmtilesError,
  ogcWms,
  tabsOptions,
} = useResourceCapabilities(() => props.resource, () => props.dataset)

// Share the tabular profile fetch between TabularExplorer and DataStructure tabs.
await provideTabularProfile(() => props.resource.id)

// The active tab lives in the URL so a shared link opens on the same one. Read once
// at mount (TabGroup only takes an initial index), which is enough: switching resource
// remounts the viewer, and the tab is preserved when the new resource also has it.
const defaultTabIndex = computed(() => {
  const index = tabsOptions.value.findIndex(option => option.key === route.query.tab)
  return index === -1 ? 0 : index
})

const switchTab = (index: number) => {
  const option = tabsOptions.value[index]
  if (!option) return
  // The first tab is the default: drop `tab` rather than writing it in the URL.
  const { tab: _, ...query } = route.query
  router.replace({ query: index === 0 ? query : { ...query, tab: option.key } })
  trackEvent('View resource tab', props.resource.id, option.label)
  if (option.key === 'data') {
    trackEvent('Show preview', props.resource.id)
  }
  if (option.key === 'data-structure') {
    trackEvent('Show data structure', props.resource.id)
  }
}
</script>
