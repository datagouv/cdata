<template>
  <div class="p-4 border bg-white border-gray-default relative hover:bg-gray-some">
    <div
      v-if="dataset.private || dataset.archived"
      class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v fr-ml-n1v"
    >
      <p
        v-if="dataset.private"
        class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
      >
        <span
          class="fr-icon-lock-line fr-icon--sm"
          aria-hidden="true"
        />
        {{ t('Brouillon') }}
      </p>
      <p
        v-if="dataset.archived"
        class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
      >
        <span
          class="fr-icon-archive-line fr-icon--sm"
          aria-hidden="true"
        />
        {{ t('Archivé') }}
      </p>
    </div>
    <div class="flex flex-wrap md:flex-nowrap gap-4 items-start">
      <div class="flex-none">
        <div class="flex justify-center items-center p-2 border border-gray-lower bg-[#fff] rounded-md overflow-hidden">
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
        </div>
      </div>
      <div class="flex-1 overflow-hidden">
        <h4 class="w-full text-base mb-0 flex">
          <slot
            name="datasetUrl"
            :dataset="dataset"
            :dataset-url="datasetUrl"
          >
            <AppLink
              :to="datasetUrl"
              class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
              :target="datasetUrlInNewTab ? '_blank' : undefined"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="flex-none"
              >
                <path
                  d="M3.33333 8.33333C3.33333 8.542 3.64067 8.90533 4.35333 9.262C5.276 9.72333 6.58467 10 8 10C9.41533 10 10.724 9.72333 11.6467 9.262C12.3593 8.90533 12.6667 8.542 12.6667 8.33333V6.886C11.5667 7.566 9.88467 8 8 8C6.11533 8 4.43333 7.56533 3.33333 6.886V8.33333ZM12.6667 10.2193C11.5667 10.8993 9.88467 11.3333 8 11.3333C6.11533 11.3333 4.43333 10.8987 3.33333 10.2193V11.6667C3.33333 11.8753 3.64067 12.2387 4.35333 12.5953C5.276 13.0567 6.58467 13.3333 8 13.3333C9.41533 13.3333 10.724 13.0567 11.6467 12.5953C12.3593 12.2387 12.6667 11.8753 12.6667 11.6667V10.2193ZM2 11.6667V5C2 3.34333 4.68667 2 8 2C11.3133 2 14 3.34333 14 5V11.6667C14 13.3233 11.3133 14.6667 8 14.6667C4.68667 14.6667 2 13.3233 2 11.6667ZM8 6.66667C9.41533 6.66667 10.724 6.39 11.6467 5.92867C12.3593 5.572 12.6667 5.20867 12.6667 5C12.6667 4.79133 12.3593 4.428 11.6467 4.07133C10.724 3.61 9.41533 3.33333 8 3.33333C6.58467 3.33333 5.276 3.61 4.35333 4.07133C3.64067 4.428 3.33333 4.79133 3.33333 5C3.33333 5.20867 3.64067 5.572 4.35333 5.92867C5.276 6.39 6.58467 6.66667 8 6.66667Z"
                  fill="#3A3A3A"
                />
              </svg>
              <span
                class="block truncate"
                :class="dataset.acronym ? 'flex-initial' : 'flex-1'"
              >{{ dataset.title }}</span>
              <small
                v-if="dataset.acronym"
                class="flex-1 ml-2"
              >{{ dataset.acronym }}</small>
              <span class="absolute inset-0" />
            </AppLink>
          </slot>
        </h4>
        <div
          v-if="dataset.organization || dataset.owner"
          class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
        >
          <template v-if="dataset.organization">
            <div class="-mr-0.5 flex-initial truncate">
              <AppLink
                v-if="organizationUrl"
                class="link text-sm overflow-hidden flex items-center relative z-[2] truncate"
                :to="organizationUrl"
              >
                <OrganizationNameWithCertificate :organization="dataset.organization" />
              </AppLink>
              <OrganizationNameWithCertificate
                v-else
                :organization="dataset.organization"
              />
            </div>
          </template>
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
        <component
          :is="config.textClamp"
          v-if="showDescriptionShort && config && config.textClamp"
          class="fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere hidden sm:block"
          :auto-resize="true"
          :text="getDescriptionShort(props.dataset)"
          :max-lines="2"
        />
        <div
          v-if="matchingBadges.length > 0"
          class="flex flex-wrap gap-2 mt-2"
        >
          <span
            v-for="badge in matchingBadges"
            :key="badge.value"
            class="px-2 py-1 rounded text-white text-xs font-bold"
            :style="{ backgroundColor: badge.color }"
          >
            {{ badge.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { computed } from 'vue'
import { RiDownloadLine, RiEyeLine, RiLineChartLine, RiStarLine, RiSubtractLine } from '@remixicon/vue'
import type { Dataset, DatasetV2 } from '../types/datasets'
import { summarize } from '../functions/helpers'
import { useFormatDate } from '../functions/dates'
import { getOwnerName } from '../functions/owned'
import { getDescriptionShort } from '../functions/description'
import { useComponentsConfig } from '../config'
import { useTranslation } from '../composables/useTranslation'
import DatasetQualityInline from './DatasetQualityInline.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import AppLink from './AppLink.vue'
import OrganizationLogo from './OrganizationLogo.vue'

type TagIntoBadge = {
  name: string
  value: string
  color: string
}

type Props = {
  dataset: Dataset | DatasetV2

  /**
     * The datasetUrl is a route location object to allow Vue Router to navigate to the details of a dataset.
     * It is used as a separate prop to allow other sites using the package to define their own dataset pages.
     */
  datasetUrl: RouteLocationRaw
  datasetUrlInNewTab?: boolean

  /**
     * The organizationUrl is an optional route location object to allow Vue Router to navigate to the details of the organization linked to tha dataset.
     * It is used as a separate prop to allow other sites using the package to define their own organization pages.
     */
  organizationUrl?: RouteLocationRaw
  showDescriptionShort?: boolean
  tagIntoBadge?: TagIntoBadge[]
}

const props = withDefaults(defineProps<Props>(), {
  style: () => ({}),
  showDescriptionShort: true,
})

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()
const ownerName = computed(() => getOwnerName(props.dataset))
const config = useComponentsConfig()

const matchingBadges = computed(() => {
  if (!props.tagIntoBadge || !props.dataset.tags) return []
  const datasetTags = new Set(props.dataset.tags)
  return props.tagIntoBadge.filter(badge => datasetTags.has(badge.value))
})
</script>
