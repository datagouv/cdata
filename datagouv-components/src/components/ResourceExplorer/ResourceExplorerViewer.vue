<template>
  <div class="border border-gray-default">
    <header class="p-4 flex flex-wrap md:flex-nowrap gap-4 items-center justify-between">
      <div>
        <div class="flex items-center gap-1 mb-1">
          <h3 class="m-0 flex items-baseline text-base font-bold leading-tight">
            <ResourceIcon
              :resource
              class="size-3.5 mr-1 shrink-0 translate-y-px"
            />
            <span class="line-clamp-2">{{ resource.title || t('Fichier sans nom') }}</span>
          </h3>
          <ResourceSelector
            v-if="resources && resources.length > 1"
            :resources
            :selected-id="resource.id"
            @select="emit('select', $event)"
          />
          <CopyButton
            :label="t('Copier le lien')"
            :copied-label="t('Lien copié !')"
            :text="resourceExternalUrl"
            class="hidden md:inline-flex"
          />
        </div>
        <div class="text-gray-medium text-xs flex items-center gap-1 flex-wrap">
          <SchemaBadge :resource />
          <RiSubtractLine
            v-if="resource.schema?.name || resource.schema?.url"
            aria-hidden="true"
            class="size-3 fill-gray-medium"
          />
          <span>{{ t('mis à jour {date}', { date: formatRelativeIfRecentDate(resource.last_modified) }) }}</span>
          <RiSubtractLine
            aria-hidden="true"
            class="size-3 fill-gray-medium"
          />
          <template v-if="resource.format">
            <span>
              {{ resource.format.trim().toLowerCase() }}
              <span v-if="resourceFilesize">({{ filesize(resourceFilesize) }})</span>
            </span>
            <RiSubtractLine
              aria-hidden="true"
              class="size-3 fill-gray-medium"
            />
          </template>
          <span class="inline-flex items-center">
            <RiDownloadLine class="size-3 mr-0.5" />
            {{ summarize(resource.metrics.views) }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
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
        <BrandedButton
          v-else
          :href="resource.latest"
          rel="ugc nofollow noopener"
          :title="downloadButtonTitle"
          download
          class="matomo_download"
          :icon="unavailable ? RiFileWarningLine : RiDownloadLine"
          size="xs"
          color="primary"
          external
          @click="trackEvent('Jeux de données', 'Télécharger un fichier', 'Bouton : télécharger un fichier')"
        >
          {{ t('Télécharger') }}
        </BrandedButton>
      </div>
    </header>

    <section class="pb-4">
      <TabGroup
        size="sm"
        @change="switchTab"
      >
        <div class="pl-4 pr-4 pb-4">
          <TabList class="max-w-full overflow-x-auto">
            <Tab
              v-for="tab in tabsOptions"
              :key="tab.key"
            >
              {{ tab.label }}
            </Tab>
          </TabList>
        </div>
        <TabPanels>
          <TabPanel
            v-for="tab in tabsOptions"
            :key="tab.key"
            class="px-4"
          >
            <div v-if="tab.key === 'map'">
              <Pmtiles
                v-if="hasPmtiles"
                :resource="resource"
                :dataset="dataset"
              />
              <MapContainer
                v-if="ogcWms"
                :resource="resource"
              />
            </div>
            <div v-if="tab.key === 'data'">
              <JsonPreview
                v-if="resource.format && resource.format.toLowerCase() === 'json'"
                :resource="resource"
              />
              <PdfPreview
                v-else-if="resource.format && resource.format.toLowerCase() === 'pdf'"
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
              <TabularExplorer
                v-else-if="hasTabularData"
                :resource-id="resource.id"
              />
              <PreviewUnavailable v-else>
                <!-- "File too large to download" is the only analysis:error value from hydra for now -->
                <template v-if="resource.extras['analysis:error'] === 'File too large to download'">
                  {{ t("Ce fichier est trop volumineux pour être analysé et prévisualisé. Téléchargez-le depuis l'onglet Téléchargements.") }}
                </template>
                <template v-else-if="resource.extras['analysis:parsing:error']">
                  {{ t("L'analyse de ce fichier a rencontré une erreur, l'aperçu n'est pas disponible. Téléchargez-le depuis l'onglet Téléchargements.") }}
                  <br>
                  <span class="text-gray-medium text-xs">{{ resource.extras['analysis:parsing:error'] }}</span>
                </template>
                <template v-else>
                  {{ t("Ce fichier ne peut pas être prévisualisé. Téléchargez-le depuis l'onglet Téléchargements.") }}
                </template>
              </PreviewUnavailable>
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
            <div v-if="tab.key === 'downloads'">
              <Downloads
                :resource="resource"
                :dataset="dataset"
              />
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
import { RiDownloadLine, RiFileCopyLine, RiFileWarningLine, RiSubtractLine } from '@remixicon/vue'
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
import DataStructure from '../ResourceAccordion/DataStructure.vue'
import Downloads from '../ResourceAccordion/Downloads.vue'
import Metadata from '../ResourceAccordion/Metadata.vue'
import SchemaBadge from '../ResourceAccordion/SchemaBadge.vue'
import ResourceSelector from './ResourceSelector.vue'
import { filesize, summarize } from '../../functions/helpers'
import { getResourceFormatIcon, getResourceExternalUrl, getResourceFilesize } from '../../functions/resources'
import { trackEvent } from '../../functions/matomo'
import { useComponentsConfig } from '../../config'
import { useFormatDate } from '../../functions/dates'
import { useTranslation } from '../../composables/useTranslation'
import { useResourceCapabilities } from '../../composables/useResourceCapabilities'
import { provideTabularProfile } from '../../composables/useTabularProfile'
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

const props = defineProps<{
  dataset: Dataset | DatasetV2
  resource: Resource
  resources?: Resource[]
}>()

const emit = defineEmits<{
  select: [resource: Resource]
}>()

const { t } = useTranslation()
const config = useComponentsConfig()
const { formatRelativeIfRecentDate } = useFormatDate()

const {
  hasTabularData,
  hasPmtiles,
  hasDatafairPreview,
  hasOpenAPIPreview,
  ogcService,
  ogcWms,
  isResourceUrl,
  tabsOptions,
} = useResourceCapabilities(() => props.resource, () => props.dataset)

// Share the tabular profile fetch between TabularExplorer and DataStructure tabs.
await provideTabularProfile(() => props.resource.id)

const resourceFilesize = computed(() => getResourceFilesize(props.resource))
const resourceExternalUrl = computed(() => getResourceExternalUrl(props.dataset, props.resource))

const format = computed(() => getResourceFormatIcon(props.resource.format) ? props.resource.format : 'Fichier')
const availabilityChecked = computed(() => props.resource.extras && 'check:available' in props.resource.extras)
const unavailable = computed(() => availabilityChecked.value && props.resource.extras['check:available'] === false)
const downloadButtonTitle = computed(() => {
  if (unavailable.value) {
    return t('Le robot de {platform} n\'a pas pu accéder à ce fichier - Télécharger le fichier en {format}', { platform: config.name, format: format.value })
  }
  return t('Télécharger le fichier en {format}', { format: format.value })
})

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
