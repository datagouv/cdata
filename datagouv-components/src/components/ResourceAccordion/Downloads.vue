<template>
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
    <template v-if="wfsFormats.length">
      <dt class="font-bold fr-text--sm fr-mb-0">
        <div class="flex gap-1 items-center">
          {{ t('Formats exportés depuis le service WFS') }}
          <span v-if="defaultWfsProjection"> ({{ t('projection {crs}', { crs: defaultWfsProjection }) }})</span>
          <Tooltip>
            <RiInformationLine
              class="flex-none size-4"
              :aria-label="t(`Le lien de téléchargement interroge directement le flux WFS distant. Le nombre de features téléchargées peut être limité.`)"
              aria-hidden="true"
            />
            <template #tooltip>
              <p class="text-sm font-normal mb-0">
                {{ t(`Le lien de téléchargement interroge directement le flux WFS distant.`) }}
              </p>
              <p class="text-sm font-normal mb-0">
                {{ t(`Le nombre de features téléchargées peut être limité.`) }}
              </p>
            </template>
          </Tooltip>
        </div>
      </dt>
      <dd
        v-for="wfsFormat in wfsFormats"
        :key="wfsFormat.format"
        class="text-sm pl-0 mb-4 text-gray-medium h-8 flex flex-wrap items-center"
      >
        <span>
          <span class="text-datagouv fr-icon-download-line fr-icon--sm fr-mr-1v fr-mt-1v" />
          <a
            :href="wfsFormat.url"
            class="fr-link"
            rel="ugc nofollow noopener"
            @click="trackEvent('Jeux de données', 'Télécharger un fichier', `Bouton : format ${wfsFormat.format}`)"
          >
            <span>{{ t('Format {format}', { format: wfsFormat.format }) }}</span>
          </a>
        </span>
        <CopyButton
          :label="t('Copier le lien')"
          :copied-label="t('Lien copié !')"
          :text="wfsFormat.url"
          class="relative"
        />
      </dd>
    </template>
  </dl>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiInformationLine } from '@remixicon/vue'
import CopyButton from '../CopyButton.vue'
import Tooltip from '../Tooltip.vue'
import { filesize } from '../../functions/helpers'
import { getResourceFilesize } from '../../functions/resources'
import { trackEvent } from '../../functions/matomo'
import { useComponentsConfig } from '../../config'
import { useFormatDate } from '../../functions/dates'
import { useTranslation } from '../../composables/useTranslation'
import { useResourceCapabilities } from '../../composables/useResourceCapabilities'
import type { Resource } from '../../types/resources'
import type { Dataset, DatasetV2 } from '../../types/datasets'

const props = defineProps<{
  resource: Resource
  dataset: Dataset | DatasetV2
}>()

const { t } = useTranslation()
const config = useComponentsConfig()
const { formatRelativeIfRecentDate } = useFormatDate()

const { generatedFormats, wfsFormats, defaultWfsProjection } = useResourceCapabilities(
  () => props.resource,
  () => props.dataset,
)

const resourceFilesize = computed(() => getResourceFilesize(props.resource))

const conversionsLastUpdate = computed(() =>
  formatRelativeIfRecentDate(props.resource.extras['analysis:parsing:finished_at'] as string | undefined),
)
</script>
