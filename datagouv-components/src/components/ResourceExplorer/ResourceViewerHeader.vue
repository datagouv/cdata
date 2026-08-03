<template>
  <header class="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-gray-default bg-gray-some px-3">
    <div class="flex min-w-0 items-center gap-1.5 overflow-hidden text-[13px] text-gray-medium">
      <ResourceIcon
        :resource
        class="size-4 shrink-0"
      />
      <span
        class="min-w-0 truncate font-medium text-gray-title"
        :title="resource.title || t('Fichier sans nom')"
      >{{ resource.title || t('Fichier sans nom') }}</span>
      <ResourceSelector
        v-if="resources && resources.length > 1 && resourceTo"
        :resources
        :selected-id="resource.id"
        :resource-to
        :replace
        class="shrink-0 md:hidden"
      />
      <!-- Metadata gives way long before the title does (hence the shrink factor), so
           the resource name stays readable — but the title still truncates instead of
           being clipped by the row, which used to push the copy button out of view.
           Inline flow (not flex) so text-overflow renders the ellipsis; spacing is
           carried by the separators' margins. -->
      <div class="min-w-0 truncate [flex-shrink:9999]">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiDownloadLine, RiFileCopyLine, RiFullscreenLine } from '@remixicon/vue'
import { toast } from 'vue-sonner'
import BrandedButton from '../BrandedButton.vue'
import CopyButton from '../CopyButton.vue'
import ResourceIcon from '../ResourceAccordion/ResourceIcon.vue'
import SchemaBadge from '../ResourceAccordion/SchemaBadge.vue'
import ResourceSelector from './ResourceSelector.vue'
import ResourceDownloadMenu from './ResourceDownloadMenu.vue'
import { filesize, summarize } from '../../functions/helpers'
import { getResourceExternalUrl, getResourceFilesize } from '../../functions/resources'
import { trackEvent } from '../../functions/matomo'
import { useFormatDate } from '../../functions/dates'
import { useTranslation } from '../../composables/useTranslation'
import { useResourceCapabilities } from '../../composables/useResourceCapabilities'
import type { RouteLocationRaw } from 'vue-router'
import type { Resource } from '../../types/resources'
import type { Dataset, DatasetV2 } from '../../types/datasets'

// Shared by the viewer and its loading skeleton: everything here comes from the
// resource itself, so the skeleton renders the real header instead of pulsing
// placeholders over data it already holds.
const props = defineProps<{
  dataset: Dataset | DatasetV2
  resource: Resource
  resources?: Resource[]
  resourceTo?: (resource: Resource) => RouteLocationRaw
  exploreTo?: (resource: Resource) => string
  replace?: boolean
  // Fullscreen mode hides the inline actions — they live in the dataset context bar above.
  fullscreen?: boolean
}>()

const { t } = useTranslation()
const { formatRelativeIfRecentDate, formatDate } = useFormatDate()
const { isResourceUrl, ogcService } = useResourceCapabilities(() => props.resource, () => props.dataset)

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
</script>
