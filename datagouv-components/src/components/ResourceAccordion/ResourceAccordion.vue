<template>
  <div
    class="border border-gray-default"
    :class="{ 'fr-pb-4v': open }"
  >
    <header
      :id="resourceHeaderId"
      class="fr-p-4v flex items-center justify-between relative"
    >
      <div>
        <div class="flex items-center fr-mb-1v">
          <h4
            :id="resourceTitleId"
            class="fr-m-0"
          >
            <button
              type="button"
              class="fr-p-0 flex items-baseline text-base leading-none font-normal"
              data-testid="expand-button"
              :aria-expanded="open"
              @click="toggle"
            >
              <ResourceIcon
                :resource
                class="size-3.5 mr-1"
              />
              <span
                :class="{
                  'font-bold': open,
                }"
              ><component
                :is="config.textClamp"
                v-if="config && config.textClamp"
                :max-lines="1"
                :text="resource.title || t('Nameless file')"
              /></span>

              <span class="absolute inset-0 z-1" />
            </button>
          </h4>
          <CopyButton
            :label="$t('Copy link')"
            :copied-label="$t('Link copied!')"
            :text="resourceExternalUrl"
            class="z-2"
          />
        </div>
        <div class="text-gray-medium subheaders-infos">
          <SchemaBadge
            :resource
            class="dash-after"
          />
          <span class="fr-text--xs fr-mb-0 dash-after">{{ t('Updated {date}', { date: formatRelativeIfRecentDate(lastUpdate) }) }}</span>
          <span
            v-if="resource.format"
            class="fr-text--xs fr-mb-0 dash-after"
          >
            <span class="hidden show-on-small">{{ t("Format") }}</span>
            {{ resource.format.trim().toLowerCase() }}
            <span v-if="resource.filesize">({{ filesize(resource.filesize) }})</span>
          </span>
          <span
            class="inline-flex items-center fr-text--xs fr-mb-0"
            :aria-label="t('{n} downloads', resource.metrics.views)"
          >
            <span class="fr-icon-download-line fr-icon--xs fr-mr-1v" />
            <span>{{ summarize(resource.metrics.views) }} <span class="hidden show-on-small">{{ t("downloads") }}</span></span>
          </span>
        </div>
        <p
          v-if="communityResource"
          class="fr-mb-0 fr-mt-1v fr-text--xs text-gray-medium"
        >
          {{ t('From') }}
          <a
            v-if="communityResource.organization"
            class="fr-link fr-text--xs"
            :href="communityResource.organization.page"
          >
            <OrganizationNameWithCertificate :organization="communityResource.organization" />
          </a>
          <template v-else-if="owner">
            {{ owner }}
          </template>
        </p>
      </div>
      <div class="flex items-center fr-ml-4v buttons">
        <p
          v-if="resource.format === 'url'"
          class="fr-col-auto fr-ml-3v fr-m-0 z-2"
        >
          <BrandedButton
            :href="resource.latest"
            :title="t('File link - opens a new window')"
            :aria-describedby="resourceTitleId"
            rel="ugc nofollow noopener"
            new-tab
            size="xs"
          >
            {{ $t('Visit') }}
          </BrandedButton>
        </p>
        <p
          v-else-if="ogcService"
          class="fr-col-auto fr-ml-3v fr-m-0 z-2"
        >
          <BrandedButton
            :id="resource.id + '-copy'"
            :data-clipboard-text="resource.url"
            :aria-describedby="resourceTitleId"
            color="primary"
            size="xs"
            :icon="RiFileCopyLine"
          >
            {{ t('Copy link') }}
          </BrandedButton>
        </p>
        <p
          v-else
          class="fr-col-auto fr-ml-3v fr-m-0"
        >
          <BrandedButton
            :href="resource.latest"
            rel="ugc nofollow noopener"
            :title="downloadButtonTitle"
            download
            class="relative text-transform-uppercase matomo_download z-2"
            :icon="unavailable ? RiFileWarningLine : RiDownloadLine"
            size="xs"
            :aria-describedby="resourceTitleId"
          >
            <span class="sr-only">{{ t('Download file as ') }}</span>{{ format }}
          </BrandedButton>
        </p>
        <p
          v-if="canEdit"
          class="fr-col-auto fr-ml-3v fr-m-0 z-2"
        >
          <EditButton
            :dataset-id="dataset.id"
            :resource-id="resource.id"
            :is-community-resource="isCommunityResource"
          />
        </p>
        <div
          class="fr-icon--sm fr-ml-4v"
          :class="{ 'fr-icon-arrow-up-s-line': open, 'fr-icon-arrow-down-s-line': !open }"
        />
      </div>
    </header>
    <section
      v-if="open"
      :id="resourceContentId"
      :aria-labelledby="resourceTitleId"
    >
      <TabGroup
        size="sm"
        @change="switchTab"
      >
        <div class="fr-pl-4v fr-pr-4v fr-pb-4v">
          <TabList style="max-width: 100%; overflow-y: auto;">
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
          >
            <div v-if="tab.key === 'data'">
              <Preview :resource="resource" />
            </div>
            <div v-if="tab.key === 'map'">
              <Pmtiles :resource="resource" />
            </div>
            <div
              v-if="tab.key === 'description'"
              class="fr-pl-4v fr-pr-4v"
            >
              <div
                class="fr-mt-0 markdown fr-text--sm text-mention-grey"
                v-html="markdown(resource.description || '')"
              />
            </div>
            <div
              v-if="tab.key === 'data-structure'"
              class="fr-pl-4v fr-pr-4v"
            >
              <DataStructure
                v-if="hasPreview"
                :resource="resource"
              />
            </div>
            <div
              v-if="tab.key === 'metadata'"
              class="fr-pl-4v fr-pr-4v"
            >
              <Metadata :resource />
            </div>
            <div
              v-if="tab.key === 'downloads'"
              class="fr-pl-4v fr-pr-4v"
            >
              <dl class="fr-pl-0">
                <dt
                  v-if="resource.format === 'url'"
                  class="font-bold fr-text--sm fr-mb-0"
                >
                  {{ $t('Original URL') }}
                </dt>
                <dt
                  v-else
                  class="font-bold fr-text--sm fr-mb-0"
                >
                  {{ $t('Original format') }}
                </dt>
                <dd class="text-sm ml-0 mt-0 mb-4 text-gray-medium h-8 flex flex-wrap items-center">
                  <span v-if="resource.format === 'url'">
                    <a
                      :href="resource.latest"
                      class="fr-link no-icon-after"
                      rel="ugc nofollow noopener"
                      target="_blank"
                    >
                      <component
                        :is="config.textClamp"
                        v-if="config && config.textClamp"
                        :auto-resize="true"
                        :max-lines="1"
                        :text="resource.url"
                      >
                        <template #after>
                          <span class="fr-ml-1v fr-icon-external-link-line fr-icon--sm" />
                        </template>
                      </component>
                    </a>
                  </span>
                  <span v-else>
                    <span class="text-datagouv fr-icon-download-line fr-icon--sm fr-mr-1v fr-mt-1v" />
                    <a
                      :href="resource.latest"
                      class="fr-link"
                      rel="ugc nofollow noopener"
                    >
                      <span>{{ $t('Format {format}', { format: resource.format }) }}<span v-if="resource.filesize"> - {{ filesize(resource.filesize) }}</span></span>
                    </a>
                  </span>
                  <CopyButton
                    :label="$t('Copy link')"
                    :copied-label="$t('Link copied!')"
                    :text="resource.latest"
                    class="relative"
                  />
                </dd>
                <template v-if="generatedFormats">
                  <dt class="font-bold fr-text--sm fr-mb-0">
                    {{ $t('Auto-generated formats from {platform}', { platform: config.name }) }}
                  </dt>
                  <dd
                    v-for="generatedFormat in generatedFormats"
                    :key="generatedFormat.format"
                    class="text-sm ml-0 mt-0 mb-4 text-gray-medium h-8 flex flex-wrap items-center">
                    <span>
                      <span class="text-datagouv fr-icon-download-line fr-icon--sm fr-mr-1v fr-mt-1v" />
                      <a
                        :href="generatedFormat.url"
                        class="fr-link"
                        rel="ugc nofollow noopener"
                      >
                        <span>{{ $t('Format {format}', { format: generatedFormat.format }) }}<span v-if="generatedFormat.size"> - {{ filesize(generatedFormat.size) }}</span></span>
                      </a>
                    </span>
                    <CopyButton
                      :label="$t('Copy link')"
                      :copied-label="$t('Link copied!')"
                      :text="generatedFormat.url"
                      class="relative"
                    />
                  </dd>
                </template>
              </dl>
            </div>
            <div
              v-if="tab.key === 'swagger'"
              class="fr-pl-4v fr-pr-4v"
            >
              <div>{{ t('Swagger automatically generated by data.gouv.fr. This swagger allows you to query data by API by filtering it by column value.') }}</div>
              <Swagger
                v-if="hasPreview"
                :url="`${config.tabularApiUrl}/api/resources/${props.resource.id}/swagger/`"
              />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { RiDownloadLine, RiFileCopyLine, RiFileWarningLine } from '@remixicon/vue'
import OrganizationNameWithCertificate from '../OrganizationNameWithCertificate.vue'
import { filesize, summarize } from '../../functions/helpers'
import { markdown } from '../../functions/markdown'
import { formatRelativeIfRecentDate } from '../../functions/dates'
import type { CommunityResource, Resource } from '../../types/resources'
import type { Dataset, DatasetV2 } from '../../types/datasets'
import TabGroup from '../Tabs/TabGroup.vue'
import TabList from '../Tabs/TabList.vue'
import Tab from '../Tabs/Tab.vue'
import TabPanels from '../Tabs/TabPanels.vue'
import TabPanel from '../Tabs/TabPanel.vue'
import { trackEvent } from '../../functions/matomo'
import CopyButton from '../CopyButton.vue'
import { useComponentsConfig } from '../../config'
import { getOwnerName } from '../../functions/owned'
import { getResourceFormatIcon, getResourceTitleId } from '../../functions/resources'
import BrandedButton from '../BrandedButton.vue'
import { getResourceExternalUrl } from '../../functions/datasets'
import Metadata from './Metadata.vue'
import SchemaBadge from './SchemaBadge.vue'
import ResourceIcon from './ResourceIcon.vue'
import EditButton from './EditButton.vue'
import DataStructure from './DataStructure.vue'
import Preview from './Preview.vue'
import Pmtiles from './Pmtiles.vue'

const OGC_SERVICES_FORMATS = ['ogc:wfs', 'ogc:wms', 'wfs', 'wms']
const GENERATED_FORMATS = ['parquet', 'pmtiles']

const props = withDefaults(defineProps<{
  dataset: Dataset | DatasetV2
  expandedOnMount?: boolean
  isCommunityResource?: boolean
  resource: Resource | CommunityResource
  canEdit?: boolean
}>(), {
  expandedOnMount: false,
  isCommunityResource: false,
  canEdit: false,
})

const config = useComponentsConfig()

const Swagger = defineAsyncComponent(() => import('./Swagger.vue'))

const { t } = useI18n()

const hasPreview = computed(() => {
  return config.tabularApiUrl
    && props.resource.extras['analysis:parsing:finished_at']
    && !props.resource.extras['analysis:parsing:error']
    && (config.tabularAllowRemote || props.resource.filetype === 'file')
    && !props.resource.extras['analysis:parsing:pmtiles_url'] // TODO: have a dedicated extra for tabular parsing
})

const hasPmtiles = computed(() => {
  return props.resource.extras['analysis:parsing:pmtiles_url']
})

const format = computed(() => getResourceFormatIcon(props.resource.format) ? props.resource.format : t('File'))

const ogcService = computed(() => OGC_SERVICES_FORMATS.includes(props.resource.format))

const generatedFormats = computed(() => {
  return GENERATED_FORMATS
    .filter(format => `analysis:parsing:${format}_url` in props.resource.extras)
    .map(format => ({
      url: props.resource.extras[`analysis:parsing:${format}_url`],
      size: props.resource.extras[`analysis:parsing:${format}_size`],
      format: format,
    }))
})

const open = ref(props.expandedOnMount)
const toggle = () => {
  open.value = !open.value

  if (open.value) {
    trackEvent(['Open resource', props.resource.id])
  }
  else {
    trackEvent(['Close resource', props.resource.id])
  }
}

const tabsOptions = computed(() => {
  const options = []

  if (hasPreview.value) {
    options.push({ key: 'data', label: t('Data') })
  }

  if (hasPmtiles.value) {
    options.push({ key: 'map', label: t('Map') })
  }

  if (props.resource.description) {
    options.push({ key: 'description', label: t('Description') })
  }

  if (hasPreview.value) {
    options.push({ key: 'data-structure', label: t('Data structure') })
  }

  options.push({ key: 'metadata', label: t('Metadata') })
  options.push({ key: 'downloads', label: t('Downloads') })

  if (hasPreview.value) {
    options.push({ key: 'swagger', label: t('Swagger') })
  }

  return options
})
const switchTab = (index: number) => {
  const option = tabsOptions.value[index]
  trackEvent(['View resource tab', props.resource.id, option.label])

  if (option.key === 'data') {
    trackEvent(['Show preview', props.resource.id])
  }
  if (option.key === 'data-structure') {
    trackEvent(['Show data structure', props.resource.id])
  }
}

const communityResource = computed<CommunityResource | null>(() => {
  if (!props.isCommunityResource) return null
  return props.resource as CommunityResource
})
const owner = computed(() => communityResource.value ? getOwnerName(communityResource.value) : null)

const lastUpdate = props.resource.last_modified
const availabilityChecked = props.resource.extras && 'check:available' in props.resource.extras

const unavailable = availabilityChecked && props.resource.extras['check:available'] === false
const downloadButtonTitle = unavailable ? t(`Le robot de {certifier} n'a pas pu accéder à ce fichier - Télécharger le fichier en {format}`, { certifier: config.name, format: format.value }) : t(`Télécharger le fichier en {format}`, { format: format.value })

const resourceExternalUrl = computed(() => getResourceExternalUrl(props.dataset, props.resource))

const resourceContentId = 'resource-' + props.resource.id
const resourceHeaderId = 'resource-' + props.resource.id + '-header'
const resourceTitleId = getResourceTitleId(props.resource)
</script>

<style scoped>
.fr-link--no-after::after {
  display: none !important;
}

header:hover {
  background-color: #f6f6f6;
}

/**
If we do not put z-index, the header is fully clickable except for the DSFR icons (bad because one of the icons is the chevron up/down). It may be due to the usage of ::before to add the icon in the markup or the `mask-image`. We need to put a `z-2` on all elements that we want to be clickable over the header.
*/
.z-1 {
  z-index: 1;
}
.z-2 {
  z-index: 2;
}

.z-3 {
  z-index: 3;
}

article {
  container-type: inline-size;
}

@container (max-width: 600px) {
  article header.flex {
    flex-direction: column;
    align-items: start;
    justify-content: start;
  }
  article header .buttons {
    margin-top: 1.25rem;
    margin-left: auto !important;
  }
/*
  If we want to put subheaders info in column on mobile…
  article header .subheaders-infos {
    display: flex;
    flex-direction: column
  }
  article header .subheaders-infos .hidden.show-on-small {
    display: inline !important;
  }
  article header .dash-after::after {
    content: ''
  } */

  /* article .fr-pl-4v fr-pr-4v {
    padding: 0.75rem !important;
  } */
}
</style>
