<template>
  <ObjectCard
    :url="datasetUrl || dataset.page"
    :target="datasetUrlInNewTab ? '_blank' : undefined"
    :icon="RiDatabase2Line"
    :title-tag
  >
    <template #media>
      <OrganizationLogo
        v-if="dataset.organization"
        :organization="dataset.organization"
        size-class="size-12 p-1"
      />
      <Avatar
        v-else-if="dataset.owner"
        :user="dataset.owner"
        :size="48"
      />
      <Placeholder
        v-else
        type="Dataset"
        class="size-12"
      />
    </template>
    <template #title>
      {{ dataset.title }}<small
        v-if="dataset.acronym"
        class="ml-2"
      >{{ dataset.acronym }}</small>
    </template>
    <template
      v-if="dataset.private || dataset.archived"
      #badge
    >
      <ObjectCardBadge
        v-if="dataset.private"
        :icon="RiLockLine"
      >
        {{ t('Brouillon') }}
      </ObjectCardBadge>
      <ObjectCardBadge
        v-else
        :icon="RiArchiveLine"
      >
        {{ t('Archivé') }}
      </ObjectCardBadge>
    </template>

    <ObjectCardOwner
      v-if="dataset.organization || dataset.owner"
      show-details
      :organization="dataset.organization"
      :owner="dataset.owner"
      :organization-url="organizationUrl"
    />
    <ObjectCardMeta>
      <TranslationT
        tag="span"
        class="tabular-nums"
        keypath="Mis à jour {date}"
      >
        <template #date>
          <FormattedDate
            :date="dataset.last_update"
            format="relative"
            :options="{ dateStyle: 'medium' }"
          />
        </template>
      </TranslationT>
      <DatasetQualityInline
        :quality="dataset.quality"
        class="max-[480px]:hidden"
      />
      <ObjectCardMetrics class="max-[480px]:hidden">
        <ObjectCardMetric
          :icon="RiEyeLine"
          :value="dataset.metrics.views"
          :label="t('{n} vues | {n} vue | {n} vues', dataset.metrics.views)"
        />
        <ObjectCardMetric
          :icon="RiDownloadLine"
          :value="dataset.metrics.resources_downloads"
          :label="t('{n} téléchargements des ressources | {n} téléchargement des ressources | {n} téléchargements des ressources', dataset.metrics.resources_downloads)"
        />
        <ObjectCardMetric
          :icon="RiLineChartLine"
          :value="dataset.metrics.reuses"
          :label="t('{n} réutilisations | {n} réutilisation | {n} réutilisations', dataset.metrics.reuses)"
        />
        <ObjectCardMetric
          :icon="RiStarLine"
          :value="dataset.metrics.followers"
          :label="t('{n} abonnés | {n} abonné | {n} abonnés', dataset.metrics.followers)"
        />
      </ObjectCardMetrics>
    </ObjectCardMeta>
    <slot>
      <ObjectCardShortDescription
        v-if="showDescriptionShort"
        :text="getDescriptionShort(dataset)"
        class="max-md:hidden"
      />
    </slot>
  </ObjectCard>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import {
  RiArchiveLine,
  RiDatabase2Line,
  RiDownloadLine,
  RiEyeLine,
  RiLineChartLine,
  RiLockLine,
  RiStarLine,
} from '@remixicon/vue'
import type { Dataset, DatasetV2 } from '../types/datasets'
import type { TitleTag } from '../types/ui'
import { getDescriptionShort } from '../functions/description'
import { useTranslation } from '../composables/useTranslation'
import DatasetQualityInline from './DatasetQualityInline.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardMeta from './ObjectCardMeta.vue'
import ObjectCardMetric from './ObjectCardMetric.vue'
import ObjectCardMetrics from './ObjectCardMetrics.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import FormattedDate from './FormattedDate.vue'
import TranslationT from './TranslationT.vue'

type Props = {
  dataset: Dataset | DatasetV2
  datasetUrl?: RouteLocationRaw
  datasetUrlInNewTab?: boolean
  // undefined falls back to the organization's data.gouv.fr page; pass null to render plain, non-linked text
  organizationUrl?: RouteLocationRaw | null
  showDescriptionShort?: boolean
  titleTag?: TitleTag
}

withDefaults(defineProps<Props>(), {
  showDescriptionShort: true,
})

const { t } = useTranslation()
</script>
