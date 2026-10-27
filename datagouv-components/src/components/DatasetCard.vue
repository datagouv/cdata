<template>
  <ObjectCard class="catalog-card">
    <template #media>
      <OrganizationLogo
        v-if="dataset.organization"
        :organization="dataset.organization"
        size-class="size-12"
      />
      <Avatar v-else-if="dataset.owner" :user="dataset.owner" :size="48" />
      <Placeholder v-else type="Dataset" class="size-12" />
    </template>
    <div class="card-heading-row">
      <ObjectCardHeader
        :icon="RiDatabase2Line"
        :url="datasetUrl || dataset.page"
        :target="datasetUrlInNewTab ? '_blank' : undefined"
        :title-tag="titleTag"
      >
        {{ dataset.title }}
        <template v-if="dataset.acronym" #extra
          ><small class="flex-1 ml-2">{{ dataset.acronym }}</small></template
        >
      </ObjectCardHeader>
      <ObjectCardBadge v-if="dataset.private" :icon="RiLockLine">
        {{ t('Brouillon') }}
      </ObjectCardBadge>
      <ObjectCardBadge v-else-if="dataset.archived" :icon="RiArchiveLine">
        {{ t('Archivé') }}
      </ObjectCardBadge>
    </div>
    <ObjectCardOwner
      v-if="dataset.organization || dataset.owner"
      :organization="dataset.organization"
      :owner="dataset.owner"
      :organization-url="organizationUrl"
    />
    <TranslationT tag="div" class="card-date" keypath="Mis à jour {date}">
      <template #date
        ><FormattedDate
          :date="dataset.last_update"
          format="relative"
          :options="{ dateStyle: 'medium' }"
      /></template>
    </TranslationT>
    <div class="card-metadata-row">
      <DatasetQualityInline :quality="dataset.quality" />
      <div class="card-metrics">
        <p :aria-label="t('{n} vues | {n} vue | {n} vues', dataset.metrics.views)">
          <RiEyeLine aria-hidden="true" />{{ summarize(dataset.metrics.views) }}
        </p>
        <p
          :aria-label="
            t(
              '{n} téléchargements des ressources | {n} téléchargement des ressources | {n} téléchargements des ressources',
              dataset.metrics.resources_downloads,
            )
          "
        >
          <RiDownloadLine aria-hidden="true" />{{ summarize(dataset.metrics.resources_downloads) }}
        </p>
        <p
          :aria-label="
            t('{n} réutilisations | {n} réutilisation | {n} réutilisations', dataset.metrics.reuses)
          "
        >
          <RiLineChartLine aria-hidden="true" />{{ summarize(dataset.metrics.reuses) }}
        </p>
        <p :aria-label="t('{n} abonnés | {n} abonné | {n} abonnés', dataset.metrics.followers)">
          <RiStarLine aria-hidden="true" />{{ summarize(dataset.metrics.followers) }}
        </p>
      </div>
    </div>
    <slot>
      <ObjectCardShortDescription
        v-if="showDescriptionShort"
        :text="getDescriptionShort(props.dataset)"
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
import { summarize } from '../functions/helpers'
import { getDescriptionShort } from '../functions/description'
import { useTranslation } from '../composables/useTranslation'
import DatasetQualityInline from './DatasetQualityInline.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
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

const props = withDefaults(defineProps<Props>(), {
  showDescriptionShort: true,
})

const { t } = useTranslation()
</script>

<style scoped>
.card-heading-row {
  display: flex;
  align-items: center;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
}
.card-heading-row > :first-child {
  flex: 1 1 auto;
}
.card-date {
  color: #555;
  font-size: 0.875rem;
  line-height: 1.5rem;
  font-variant-numeric: tabular-nums;
}
.card-metadata-row {
  display: flex;
  align-items: center;
  max-width: 100%;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  color: #555;
}
.card-metrics {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  padding-inline-start: 0.75rem;
  border-inline-start: 1px solid #e5e5e5;
  font-variant-numeric: tabular-nums;
}
.card-metrics p {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.125rem;
}
.card-metrics svg {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
}
</style>
