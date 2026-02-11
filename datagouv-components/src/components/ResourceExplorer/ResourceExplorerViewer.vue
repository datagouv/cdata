<template>
  <div class="border border-gray-default">
    <header class="p-4 flex flex-wrap md:flex-nowrap gap-4 items-center justify-between">
      <div>
        <div class="flex items-center mb-1">
          <h4 class="m-0 flex items-baseline text-base font-bold leading-tight">
            <ResourceIcon
              :resource
              class="size-3.5 mr-1"
            />
            <span class="line-clamp-2">{{ resource.title || t('Fichier sans nom') }}</span>
          </h4>
          <CopyButton
            :label="t('Copier le lien')"
            :copied-label="t('Lien copié !')"
            :text="resourceExternalUrl"
          />
        </div>
        <div class="text-gray-medium text-xs flex items-center gap-1">
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
              <SwaggerClient
                v-else-if="hasOpenAPIPreview"
                :url="resource.extras['apidocUrl'] as string"
              />
              <Preview
                v-else
                :resource="resource"
              />
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
              <dl class="fr-pl-0">
                <dt
                  v-if="resource.format === 'url'"
                  class="font-bold fr-text--sm fr-mb-0"
                >
                  {{ t("URL d'origine") }}
                </dt>
                <dt
                  v-else
                  class="font-bold fr-text--sm fr-mb-0"
                >
                  {{ t('Format original') }}
                </dt>
                <dd class="text-sm pl-0 mb-4 text-gray-medium h-8 flex flex-wrap items-center">
                  <span
                    v-if="resource.format === 'url'"
                    class="inline-flex items-center max-w-full"
                  >
                    <a
                      :href="resource.latest"
                      class="fr-link no-icon-after truncate"
                      rel="ugc nofollow noopener"
                      target="_blank"
                      @click="trackEvent('Jeux de données', 'Télécharger un fichier', 'Bouton : télécharger un fichier')"
                    >
                      {{ resource.url }}
                    </a>
                    <span class="fr-ml-1v fr-icon-external-link-line fr-icon--sm shrink-0" />
                  </span>
                  <span v-else>
                    <span class="text-datagouv fr-icon-download-line fr-icon--sm fr-mr-1v fr-mt-1v" />
                    <a
                      :href="resource.latest"
                      class="fr-link"
                      rel="ugc nofollow noopener"
                      @click="trackEvent('Jeux de données', 'Télécharger un fichier', `Bouton : format ${resource.format}`)"
                    >
                      <span>{{ t('Format {format}', { format: resource.format }) }}<span v-if="resourceFilesize"> - {{ filesize(resourceFilesize) }}</span></span>
                    </a>
                  </span>
                  <CopyButton
                    :label="t('Copier le lien')"
                    :copied-label="t('Lien copié !')"
                    :text="resource.latest"
                    class="relative"
                  />
                </dd>
                <template v-if="generatedFormats.length">
                  <dt class="font-bold fr-text--sm fr-mb-0">
                    {{ t('Formats générés automatiquement par {platform} (dernière mise à jour {date})', { platform: config.name, date: conversionsLastUpdate }) }}
                  </dt>
                  <dd
                    v-for="generatedFormat in generatedFormats"
                    :key="generatedFormat.format"
                    class="text-sm pl-0 mb-4 text-gray-medium h-8 flex flex-wrap items-center"
                  >
                    <span>
                      <span class="text-datagouv fr-icon-download-line fr-icon--sm fr-mr-1v fr-mt-1v" />
                      <a
                        :href="generatedFormat.url"
                        class="fr-link"
                        rel="ugc nofollow noopener"
                        @click="trackEvent('Jeux de données', 'Télécharger un fichier', `Bouton : format ${generatedFormat.format}`)"
                      >
                        <span>{{ t('Format {format}', { format: generatedFormat.format }) }}<span v-if="generatedFormat.size"> - {{ filesize(generatedFormat.size) }}</span></span>
                      </a>
                    </span>
                    <CopyButton
                      :label="t('Copier le lien')"
                      :copied-label="t('Lien copié !')"
                      :text="generatedFormat.url"
                      class="relative"
                    />
                  </dd>
                </template>
              </dl>
            </div>
            <div v-if="tab.key === 'swagger'">
              <div class="fr-mb-4w">
                <p>{{ t("Cette API est générée automatiquement par {platform} à partir du fichier.", { platform: config.name }) }}</p>
                <p>{{ t("- Si le fichier est modifié, l'API sera mise à jour et sa structure pourra changer.") }}</p>
                <p>{{ t("- Si le fichier est supprimé, l'API sera également supprimée.") }}</p>
                <p>{{ t("Pour des usages pérennes, prévoyez que cette API dépend directement du fichier source.") }}</p>
              </div>
              <Swagger
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
import { toast } from 'vue-sonner'
import BrandedButton from '../BrandedButton.vue'
import CopyButton from '../CopyButton.vue'
import MarkdownViewer from '../MarkdownViewer.vue'
import ResourceIcon from '../ResourceAccordion/ResourceIcon.vue'
import Swagger from '../ResourceAccordion/Swagger.client.vue'
import TabGroup from '../Tabs/TabGroup.vue'
import TabList from '../Tabs/TabList.vue'
import Tab from '../Tabs/Tab.vue'
import TabPanels from '../Tabs/TabPanels.vue'
import TabPanel from '../Tabs/TabPanel.vue'
import Preview from '../ResourceAccordion/Preview.vue'
import DataStructure from '../ResourceAccordion/DataStructure.vue'
import Metadata from '../ResourceAccordion/Metadata.vue'
import { filesize, summarize } from '../../functions/helpers'
import { getResourceFormatIcon } from '../../functions/resources'
import { getResourceExternalUrl, getResourceFilesize } from '../../functions/datasets'
import { trackEvent } from '../../functions/matomo'
import { useComponentsConfig } from '../../config'
import { useFormatDate } from '../../functions/dates'
import { useTranslation } from '../../composables/useTranslation'
import { useResourceCapabilities } from '../../composables/useResourceCapabilities'
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
const SwaggerClient = defineAsyncComponent(() =>
  import('../ResourceAccordion/Swagger.client.vue'),
)

const props = defineProps<{
  dataset: Dataset | DatasetV2
  resource: Resource
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
  generatedFormats,
  isResourceUrl,
  tabsOptions,
} = useResourceCapabilities(() => props.resource, () => props.dataset)

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

const conversionsLastUpdate = computed(() =>
  formatRelativeIfRecentDate(props.resource.extras['analysis:parsing:finished_at'] as string | undefined),
)

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
