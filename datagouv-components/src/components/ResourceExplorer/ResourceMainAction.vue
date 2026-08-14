<template>
  <!-- A resource that is only a link is visited, not downloaded. -->
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

  <!-- An OGC endpoint with nothing to export: its URL is the only useful thing to
       hand over, to paste into a GIS. -->
  <BrandedButton
    v-else-if="!groups.length"
    :icon="RiFileCopyLine"
    color="primary"
    size="xs"
    @click="copyServiceUrl"
  >
    {{ t('Copier le lien') }}
  </BrandedButton>

  <!-- A single downloadable format needs no menu: a plain download button links
       straight to it, matching the previous behaviour. -->
  <BrandedButton
    v-else-if="singleDownload"
    :href="singleDownload.url"
    :icon="RiDownloadLine"
    rel="ugc nofollow noopener"
    download
    external
    class="matomo_download"
    size="xs"
    color="primary"
    @click="trackDownload(singleDownload.format)"
  >
    {{ t('Télécharger') }}
  </BrandedButton>

  <Popover
    v-else
    ref="anchor"
    class="relative"
  >
    <PopoverButton
      :as="BrandedButton"
      :icon="RiDownloadLine"
      size="xs"
      color="primary"
      aria-haspopup="menu"
    >
      {{ t('Télécharger') }}
    </PopoverButton>

    <ClientOnly>
      <Teleport to="#tooltips">
        <PopoverPanel
          v-slot="{ close }"
          ref="panel"
          class="absolute z-[800] w-72 overflow-hidden rounded border border-gray-default bg-white shadow-lg"
          :style="floatingStyles"
        >
          <div
            v-for="group in groups"
            :key="group.title"
          >
            <div class="border-b border-gray-default bg-gray-some px-2 py-1.5 text-[12px] font-bold uppercase leading-tight text-gray-title">
              {{ group.title }}
            </div>
            <div
              v-for="item in group.items"
              :key="item.url"
              class="group/dl flex items-center border-b border-gray-default last:border-b-0 hover:bg-gray-some"
            >
              <a
                :href="item.url"
                class="matomo_download flex min-w-0 flex-1 items-center gap-2 py-2 pl-2 pr-1 text-[14px] leading-tight text-gray-title !bg-none !no-underline"
                rel="ugc nofollow noopener"
                download
                @click="trackDownload(item.format); close()"
              >
                <span class="min-w-0 flex-1 truncate">{{ t('Format {format}', { format: item.format }) }}</span>
                <span
                  v-if="item.size"
                  class="shrink-0 rounded bg-gray-lower px-1 text-[13px] tabular-nums text-gray-medium"
                >{{ filesize(item.size) }}</span>
              </a>
              <CopyButton
                :label="t('Copier le lien')"
                :copied-label="t('Lien copié !')"
                :text="item.url"
                icon-only
                class="mr-1.5 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/dl:opacity-100"
              />
            </div>
          </div>

          <!-- The exports above are files; the service itself is consumed live by a GIS,
               so its URL stays reachable next to them. -->
          <div v-if="ogcService">
            <div class="border-y border-gray-default bg-gray-some px-2 py-1.5 text-[12px] font-bold uppercase leading-tight text-gray-title">
              {{ t('Service') }}
            </div>
            <button
              type="button"
              class="flex w-full items-center gap-2 px-2 py-2 text-left text-[14px] leading-tight text-gray-title hover:bg-gray-some"
              @click="copyServiceUrl(); close()"
            >
              <RiFileCopyLine
                class="size-4 shrink-0 text-gray-medium"
                aria-hidden="true"
              />
              {{ t('Copier le lien du service') }}
            </button>
          </div>
        </PopoverPanel>
      </Teleport>
    </ClientOnly>
  </Popover>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { autoUpdate, flip, shift, useFloating } from '@floating-ui/vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { RiDownloadLine, RiFileCopyLine } from '@remixicon/vue'
import { toast } from 'vue-sonner'
import BrandedButton from '../BrandedButton.vue'
import CopyButton from '../CopyButton.vue'
import ClientOnly from '../ClientOnly.vue'
import { filesize } from '../../functions/helpers'
import { getResourceFilesize } from '../../functions/resources'
import { trackEvent } from '../../functions/matomo'
import { useTranslation } from '../../composables/useTranslation'
import { useResourceCapabilities } from '../../composables/useResourceCapabilities'
import type { Resource } from '../../types/resources'
import type { Dataset, DatasetV2 } from '../../types/datasets'

type DownloadItem = { url: string, format: string, size?: number }
type DownloadGroup = { title: string, items: DownloadItem[] }

// The one action a resource offers, whatever its kind: the two explorer headers mount
// this so the triage lives in a single place instead of drifting between them.
const props = defineProps<{
  resource: Resource
  dataset: Dataset | DatasetV2
}>()

const { t } = useTranslation()

const {
  generatedFormats,
  wfsFormats,
  defaultWfsProjection,
  isResourceUrl,
  ogcService,
} = useResourceCapabilities(() => props.resource, () => props.dataset)

const groups = computed<DownloadGroup[]>(() => {
  const result: DownloadGroup[] = []

  // An OGC endpoint is not a file: `latest` points at its GetCapabilities, which is
  // nothing a visitor wants to download. Only its exports below are.
  if (!ogcService.value) {
    result.push({
      title: t('Format original'),
      items: [{
        url: props.resource.latest,
        format: props.resource.format,
        size: getResourceFilesize(props.resource) ?? undefined,
      }],
    })
  }

  if (generatedFormats.value.length) {
    result.push({
      title: t('Formats générés automatiquement'),
      items: generatedFormats.value.map(format => ({
        url: format.url,
        format: format.format,
        size: format.size,
      })),
    })
  }

  if (wfsFormats.value.length) {
    const projection = defaultWfsProjection.value
    result.push({
      title: projection
        ? t('Formats exportés depuis le service WFS (projection {crs})', { crs: projection })
        : t('Formats exportés depuis le service WFS'),
      items: wfsFormats.value.map(format => ({
        url: format.url,
        format: format.format,
      })),
    })
  }

  return result
})

// A single downloadable format needs no menu: expose it directly for the plain button.
// Never for an OGC service, whose menu also carries the link to the service itself.
const singleDownload = computed<DownloadItem | null>(() => {
  if (ogcService.value) return null
  if (groups.value.length !== 1) return null
  const items = groups.value[0]!.items
  return items.length === 1 ? items[0]! : null
})

const trackDownload = (format: string) => {
  trackEvent('Jeux de données', 'Télécharger un fichier', `Bouton : format ${format}`)
}

const copyServiceUrl = async () => {
  try {
    await navigator.clipboard.writeText(props.resource.url)
    toast.success(t('Lien copié !'))
  }
  catch {
    toast.error(t('Impossible de copier dans le presse-papier'))
  }
}

// The panel is teleported, so it is positioned against its trigger with floating-ui.
const anchor = useTemplateRef<InstanceType<typeof Popover>>('anchor')
const panel = useTemplateRef<InstanceType<typeof PopoverPanel>>('panel')
const anchorEl = computed(() => anchor.value?.$el as HTMLElement | undefined)
const panelEl = computed(() => panel.value?.$el as HTMLElement | undefined)
const { floatingStyles } = useFloating(anchorEl, panelEl, {
  placement: 'bottom-end',
  middleware: [flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
})
</script>
