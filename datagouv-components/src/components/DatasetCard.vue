<template>
  <ObjectCard class="dg-content-card dg-catalog-card dg-dataset-card">
    <template #media>
      <OrganizationLogo
        v-if="dataset.organization"
        :organization="dataset.organization"
        size-class="size-12"
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
    <div class="dg-card-heading-row">
      <ObjectCardHeader
        :icon="RiDatabase2Line"
        :url="datasetUrl || dataset.page"
        :target="datasetUrlInNewTab ? '_blank' : undefined"
        :title-tag="titleTag"
      >
        {{ dataset.title }}
        <template
          v-if="dataset.acronym"
          #extra
        >
          <small class="flex-1 ml-2">{{ dataset.acronym }}</small>
        </template>
      </ObjectCardHeader>

      <ObjectCardBadge
        v-if="dataset.private"
        :icon="RiLockLine"
      >
        {{ t('Brouillon') }}
      </ObjectCardBadge>

      <ObjectCardBadge
        v-else-if="dataset.archived"
        :icon="RiArchiveLine"
        tone="neutral"
      >
        {{ t('Archivé') }}
      </ObjectCardBadge>
    </div>
    <div class="dg-dataset-details">
      <ObjectCardOwner
        v-if="dataset.organization || dataset.owner"
        show-details
        :organization="dataset.organization"
        :owner="dataset.owner"
        :organization-url="organizationUrl"
      />
      <div class="dg-dataset-update-row">
        <TranslationT
          tag="div"
          class="dg-dataset-updated"
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
      </div>
      <div class="dg-dataset-metadata-row">
        <DatasetQualityInline :quality="dataset.quality" />
        <div class="dg-card-metrics flex flex-wrap items-center text-sm text-gray-medium">
          <div class="dg-card-metrics flex flex-wrap items-center gap-3">
            <p
              class="text-sm mb-0 flex items-center gap-0.5"
              :aria-label="t('{n} vues | {n} vue | {n} vues', dataset.metrics.views)"
            >
              <RiEyeLine
                data-icon-size="compact"
                focusable="false"
                aria-hidden="true"
                class="dg-ds-icon"
              />{{ summarize(dataset.metrics.views) }}
            </p>
            <p
              class="text-sm mb-0 flex items-center gap-0.5"
              :aria-label="
                t(
                  '{n} téléchargements des ressources | {n} téléchargement des ressources | {n} téléchargements des ressources',
                  dataset.metrics.resources_downloads,
                )
              "
            >
              <RiDownloadLine
                data-icon-size="compact"
                focusable="false"
                aria-hidden="true"
                class="dg-ds-icon"
              />{{ summarize(dataset.metrics.resources_downloads) }}
            </p>
            <p
              class="text-sm mb-0 flex items-center gap-0.5"
              :aria-label="
                t(
                  '{n} réutilisations | {n} réutilisation | {n} réutilisations',
                  dataset.metrics.reuses,
                )
              "
            >
              <RiLineChartLine
                data-icon-size="compact"
                focusable="false"
                aria-hidden="true"
                class="dg-ds-icon"
              />{{ summarize(dataset.metrics.reuses) }}
            </p>
            <p
              class="text-sm mb-0 flex items-center gap-0.5"
              :aria-label="t('{n} abonnés | {n} abonné | {n} abonnés', dataset.metrics.followers)"
            >
              <RiStarLine
                data-icon-size="compact"
                focusable="false"
                aria-hidden="true"
                class="dg-ds-icon"
              />{{ summarize(dataset.metrics.followers) }}
            </p>
          </div>
        </div>
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
import '../../assets/cards.css'
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
