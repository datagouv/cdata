<template>
  <div :class="[{ 'border border-gray-default': bordered }, fullscreen ? 'flex min-h-0 flex-1 flex-col' : '']">
    <header class="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-gray-default bg-gray-some px-3">
      <div class="flex min-w-0 items-center gap-1.5 overflow-hidden text-[13px] text-gray-medium">
        <ResourceIcon
          :resource
          class="size-4 shrink-0"
        />
        <span class="shrink-0 whitespace-nowrap font-medium text-gray-title">{{ resource.title || t('Fichier sans nom') }}</span>
        <ResourceSelector
          v-if="resources && resources.length > 1"
          :resources
          :selected-id="resource.id"
          :resource-to
          :replace
          class="shrink-0 md:hidden"
        />
        <!-- Metadata truncates before the title, so the resource name stays fully
             visible. Inline flow (not flex) so text-overflow renders the ellipsis;
             spacing is carried by the separators' margins. -->
        <div class="min-w-0 truncate">
          <span class="mr-1.5">·</span>
          <span :title="formatDate(resource.last_modified)">{{ t('mis à jour {date}', { date: formatRelativeIfRecentDate(resource.last_modified) }) }}</span>
          <template v-if="resourceFilesize">
            <span class="mx-1.5">·</span>
            <span>{{ filesize(resourceFilesize) }}</span>
          </template>
          <template v-if="resource.format">
            <span class="mx-1.5">·</span>
            <span class="rounded bg-gray-lower px-1.5 py-0.5 text-[12px] uppercase leading-4 text-gray-medium">{{ resource.format }}</span>
          </template>
          <template v-if="resource.schema?.name || resource.schema?.url">
            <span class="mx-1.5">·</span>
            <SchemaBadge :resource />
          </template>
          <span class="mx-1.5">·</span>
          <span class="inline-flex items-center gap-0.5 align-middle">
            <RiDownloadLine class="size-3" />
            {{ summarize(resource.metrics.views) }}
          </span>
        </div>
        <CopyButton
          :label="t('Copier le lien')"
          :copied-label="t('Lien copié !')"
          :text="resourceExternalUrl"
          icon-only
          class="hidden shrink-0 md:inline-flex"
        />
      </div>
      <div
        v-if="!fullscreen"
        class="flex shrink-0 items-center gap-2"
      >
        <BrandedButton
          v-if="isResourceUrl"
          :href="resource.latest"
          :title="t('Lien du fichier - ouvre une nouvelle fenêtre')"
          rel="ugc nofollow noopener"
          new-tab
          size="xs"
          external
          @click="trackEvent('Jeux de données', 'Télécharger un fichier', 'Bouton : télécharger un fichier')"
        >
          {{ t('Visiter') }}
        </BrandedButton>
        <BrandedButton
          v-else-if="ogcService"
          :icon="RiFileCopyLine"
          color="primary"
          size="xs"
          @click="copyResourceUrl"
        >
          {{ t('Copier le lien') }}
        </BrandedButton>
        <ResourceDownloadMenu
          v-else
          :resource="resource"
          :dataset="dataset"
        />
        <BrandedButton
          v-if="exploreTo"
          :href="exploreTo(resource)"
          :icon="RiFullscreenLine"
          icon-only
          color="secondary"
          size="xs"
          :title="t('Explorer les données')"
          @click="trackEvent('Jeux de données', 'Explorer les données', 'Bouton : explorer les données')"
        >
          {{ t('Explorer les données') }}
        </BrandedButton>
      </div>
    </header>

    <section :class="fullscreen ? 'flex min-h-0 flex-1 flex-col' : ''">
      <TabGroup
        size="sm"
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
                v-if="isTabularPreview"
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
                v-else-if="isPdfPreview"
                :resource="resource"
                :fill="fullscreen"
              />

              <!-- Text previews stay padded inside the tab panel -->
              <div
                v-else
                class="p-4"
              >
                <JsonPreview
                  v-if="resource.format && resource.format.toLowerCase() === 'json'"
                  :resource="resource"
                />
                <XmlPreview
                  v-else-if="resource.format && resource.format.toLowerCase() === 'xml'"
                  :resource="resource"
                />
                <DatafairPreview
                  v-else-if="hasDatafairPreview"
                  :resource="resource"
                  :dataset="dataset"
                />
                <OpenApiViewer
                  v-else-if="hasOpenAPIPreview"
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
import { RiDownloadLine, RiFileCopyLine, RiFullscreenLine } from '@remixicon/vue'
import PreviewUnavailable from '../ResourceAccordion/PreviewUnavailable.vue'
import { toast } from 'vue-sonner'
import BrandedButton from '../BrandedButton.vue'
import CopyButton from '../CopyButton.vue'
import MarkdownViewer from '../MarkdownViewer.vue'
import ResourceIcon from '../ResourceAccordion/ResourceIcon.vue'
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
import SchemaBadge from '../ResourceAccordion/SchemaBadge.vue'
import ResourceSelector from './ResourceSelector.vue'
import ResourceDownloadMenu from './ResourceDownloadMenu.vue'
import { filesize, summarize } from '../../functions/helpers'
import { getResourceExternalUrl, getResourceFilesize } from '../../functions/resources'
import { trackEvent } from '../../functions/matomo'
import { useComponentsConfig } from '../../config'
import { useFormatDate } from '../../functions/dates'
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
const { formatRelativeIfRecentDate, formatDate } = useFormatDate()

const {
  hasTabularData,
  hasPmtiles,
  hasPmtilesError,
  pmtilesError,
  hasDatafairPreview,
  hasOpenAPIPreview,
  ogcService,
  ogcWms,
  isResourceUrl,
  tabsOptions,
} = useResourceCapabilities(() => props.resource, () => props.dataset)

// Share the tabular profile fetch between TabularExplorer and DataStructure tabs.
await provideTabularProfile(() => props.resource.id)

// Which data-tab preview to render — same precedence as the template chain below:
// the interactive table wins only when no dedicated preview (json/pdf/xml/datafair/api) applies.
const isTabularPreview = computed(() => {
  const fmt = props.resource.format?.toLowerCase()
  if (fmt === 'json' || fmt === 'pdf' || fmt === 'xml') return false
  if (hasDatafairPreview.value || hasOpenAPIPreview.value) return false
  return hasTabularData.value
})

const isPdfPreview = computed(() => props.resource.format?.toLowerCase() === 'pdf')

const resourceFilesize = computed(() => getResourceFilesize(props.resource))
const resourceExternalUrl = computed(() => getResourceExternalUrl(props.dataset, props.resource))

const copyResourceUrl = async () => {
  try {
    await navigator.clipboard.writeText(props.resource.url)
    toast.success(t('Lien copié !'))
  }
  catch {
    toast.error(t('Impossible de copier dans le presse-papier'))
  }
}

const switchTab = (index: number) => {
  const option = tabsOptions.value[index]
  if (!option) return
  trackEvent('View resource tab', props.resource.id, option.label)
  if (option.key === 'data') {
    trackEvent('Show preview', props.resource.id)
  }
  if (option.key === 'data-structure') {
    trackEvent('Show data structure', props.resource.id)
  }
}
</script>
