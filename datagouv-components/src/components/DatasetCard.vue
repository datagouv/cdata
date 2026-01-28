<template>
  <ObjectCard>
    <template #badge>
      <ObjectCardBadge
        v-if="dataset.private"
        :icon="RiLockLine"
      >
        {{ t('Brouillon') }}
      </ObjectCardBadge>
      <ObjectCardBadge
        v-else-if="dataset.archived"
        :icon="RiArchiveLine"
      >
        {{ t('Archivé') }}
      </ObjectCardBadge>
    </template>

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
    <ObjectCardHeader
      :icon="RiDatabase2Line"
      :url="datasetUrl || dataset.page"
      :target="datasetUrlInNewTab ? '_blank' : undefined"
    >
      {{ dataset.title }}
      <template
        v-if="dataset.acronym"
        #extra
      >
        <small class="flex-1 ml-2">{{ dataset.acronym }}</small>
      </template>
    </ObjectCardHeader>
    <div
      v-if="dataset.organization || dataset.owner"
      class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <div
        v-if="dataset.organization"
        class="-mr-0.5 flex-initial truncate"
      >
        <AppLink
          class="link text-sm overflow-hidden flex items-center relative z-[2] truncate"
          :to="organizationUrl || dataset.organization.page"
        >
          <OrganizationNameWithCertificate
            :organization="dataset.organization"
            size="sm"
          />
        </AppLink>
      </div>
      <div
        v-else
        class="mr-1 truncate"
      >
        {{ ownerName }}
      </div>
      <RiSubtractLine class="hidden md:block size-4 flex-none fill-gray-medium" />
      <div class="w-full md:w-auto text-gray-medium whitespace-nowrap">
        {{ t('Mis à jour {date}', { date: formatRelativeIfRecentDate(dataset.last_update, { dateStyle: 'medium' }) }) }}
      </div>
    </div>
    <div class="mx-0 -mb-1 flex flex-wrap items-center text-sm text-gray-medium">
      <div class="fr-hidden flex-sm text-gray-medium -ml-2.5">
        <DatasetQualityInline :quality="dataset.quality" />
      </div>
      <RiSubtractLine
        aria-hidden="true"
        class="hidden sm:block size-3"
      />
      <div class="flex flex-wrap items-center gap-1">
        <p
          class="text-sm mb-0 flex items-center gap-0.5"
          :aria-label="t('{n} vues | {n} vue | {n} vues', dataset.metrics.views)"
        >
          <RiEyeLine
            aria-hidden="true"
            class="size-3.5"
          />{{ summarize(dataset.metrics.views) }}
        </p>
        <p
          class="text-sm mb-0 flex items-center gap-0.5"
          :aria-label="t('{n} téléchargements des ressources | {n} téléchargement des ressources | {n} téléchargements des ressources', dataset.metrics.resources_downloads)"
        >
          <RiDownloadLine
            aria-hidden="true"
            class="size-3.5"
          />{{ summarize(dataset.metrics.resources_downloads) }}
        </p>
        <p
          class="text-sm mb-0 flex items-center gap-0.5"
          :aria-label="t('{n} réutilisations | {n} réutilisation | {n} réutilisations', dataset.metrics.reuses)"
        >
          <RiLineChartLine
            aria-hidden="true"
            class="size-3.5"
          />{{ summarize(dataset.metrics.reuses) }}
        </p>
        <p
          class="text-sm mb-0 flex items-center gap-0.5"
          :aria-label="t('{n} abonnés | {n} abonné | {n} abonnés', dataset.metrics.followers)"
        >
          <RiStarLine
            aria-hidden="true"
            class="size-3.5"
          />{{ summarize(dataset.metrics.followers) }}
        </p>
      </div>
    </div>
    <ObjectCardShortDescription
      v-if="showDescriptionShort"
      :text="getDescriptionShort(props.dataset)"
    />
  </ObjectCard>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { computed } from 'vue'
import { RiArchiveLine, RiDatabase2Line, RiDownloadLine, RiEyeLine, RiLineChartLine, RiLockLine, RiStarLine, RiSubtractLine } from '@remixicon/vue'
import type { Dataset, DatasetV2 } from '../types/datasets'
import { summarize } from '../functions/helpers'
import { useFormatDate } from '../functions/dates'
import { getOwnerName } from '../functions/owned'
import { getDescriptionShort } from '../functions/description'
import { useTranslation } from '../composables/useTranslation'
import DatasetQualityInline from './DatasetQualityInline.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import AppLink from './AppLink.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'

type Props = {
  dataset: Dataset | DatasetV2
  datasetUrl?: RouteLocationRaw
  datasetUrlInNewTab?: boolean
  organizationUrl?: RouteLocationRaw
  showDescriptionShort?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDescriptionShort: true,
})

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()
const ownerName = computed(() => getOwnerName(props.dataset))
</script>
