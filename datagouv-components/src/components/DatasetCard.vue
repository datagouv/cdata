<template>
  <div class="p-4 border bg-white border-gray-default relative hover:bg-gray-some">
    <div :id />
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
        <div class="flex justify-center items-center p-2 border border-gray-lower bg-[#fff]">
          <Placeholder
            v-if="dataset.organization"
            type="dataset"
            :src="dataset.organization.logo_thumbnail"
            alt=""
            :size="48"
          />
          <Avatar
            v-else-if="dataset.owner"
            :user="dataset.owner"
            :size="48"
          />
          <Placeholder
            v-else
            type="dataset"
            :size="48"
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
              class="text-gray-title text-base bg-none flex truncate"
            >
              <span class="block flex-initial truncate">{{ dataset.title }}</span>
              <small
                v-if="dataset.acronym"
                class="flex-none ml-2"
              >{{ dataset.acronym }}</small>
              <span class="absolute inset-0" />
            </AppLink>
          </slot>
        </h4>
        <div
          v-if="dataset.organization || dataset.owner"
          class="text-sm m-0 flex items-center truncate"
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
          <RiSubtractLine class="size-4 flex-none fill-gray-medium" />
          <div class="text-gray-medium whitespace-nowrap">
            {{ $t('Mis à jour {date}', { date: formatRelativeIfRecentDate(dataset.last_update, { dateStyle: 'medium' }) }) }}
          </div>
        </div>
        <div class="mx-0 -mb-1 flex flex-wrap items-center text-sm text-gray-medium">
          <div class="fr-hidden flex-sm dash-after-sm text-gray-medium -ml-2.5">
            <DatasetQualityInline
              :quality="dataset.quality"
              :teleport-id="id"
            />
          </div>
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
          v-if="showDescription && config && config.textClamp && description"
          class="fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere"
          :auto-resize="true"
          :text="description"
          :max-lines="2"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { RouteLocationRaw } from 'vue-router'
import { computed, ref, useId, watchEffect } from 'vue'
import { RiDownloadLine, RiEyeLine, RiLineChartLine, RiStarLine, RiSubtractLine } from '@remixicon/vue'
import type { Dataset, DatasetV2 } from '../types/datasets'
import { summarize } from '../functions/helpers'
import { useFormatDate } from '../functions/dates'
import { getOwnerName } from '../functions/owned'
import { removeMarkdown } from '../functions/markdown'
import { useComponentsConfig } from '../config'
import DatasetQualityInline from './DatasetQualityInline.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import AppLink from './AppLink.vue'

  type Props = {
    dataset: Dataset | DatasetV2

    /**
     * The datasetUrl is a route location object to allow Vue Router to navigate to the details of a dataset.
     * It is used as a separate prop to allow other sites using the package to define their own dataset pages.
     */
    datasetUrl: RouteLocationRaw

    /**
     * The organizationUrl is an optional route location object to allow Vue Router to navigate to the details of the organization linked to tha dataset.
     * It is used as a separate prop to allow other sites using the package to define their own organization pages.
     */
    organizationUrl?: RouteLocationRaw
    showDescription?: boolean
  }

const props = withDefaults(defineProps<Props>(), {
  style: () => ({}),
  showDescription: true,
})

const { t } = useI18n()
const { formatRelativeIfRecentDate } = useFormatDate()
const id = useId()
const ownerName = computed(() => getOwnerName(props.dataset))
const config = useComponentsConfig()

const description = ref('')
watchEffect(async () => {
  if (!props.showDescription) return
  description.value = await removeMarkdown(props.dataset.description)
})
</script>
