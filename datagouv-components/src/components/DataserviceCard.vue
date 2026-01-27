<template>
  <article
    class="p-4 bg-white hover:bg-gray-some border fr-enlarge-link relative"
    :class="{
      'border-tabular-api': isTabularApi,
      'border-gray-default': !isTabularApi,
      'mt-2': showBadge,
    }"
  >
    <div
      v-if="showBadge"
      class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v fr-ml-n1v"
    >
      <p
        v-if="dataservice.access_type === 'restricted'"
        class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
      >
        <RiLockLine class="size-4 mr-1" />
        {{ t('Accès restreint') }}
      </p>
      <p
        v-else-if="dataservice.access_type === 'open_with_account'"
        class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
      >
        <RiPassValidLine class="size-4 mr-1" />
        {{ t('Ouvert avec un compte') }}
      </p>
      <p
        v-if="dataservice.private"
        class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
      >
        <RiLockLine class="size-4 mr-1" />
        {{ t('Brouillon') }}
      </p>
      <p
        v-if="dataservice.archived_at"
        class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
      >
        <RiLockLine class="size-4 mr-1" />
        {{ t('Archivé') }}
      </p>
    </div>
    <div class="flex flex-wrap md:flex-nowrap gap-4 items-start">
      <div class="flex-none">
        <div class="flex justify-center items-center p-2 border border-gray-lower bg-[#fff] rounded-md overflow-hidden">
          <OrganizationLogo
            v-if="dataservice.organization"
            :organization="dataservice.organization"
            size-class="size-12"
          />
          <Avatar
            v-else-if="dataservice.owner"
            :user="dataservice.owner"
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
        <h4 class="text-base mb-0 flex items-center gap-1">
          <slot
            name="dataserviceUrl"
            :dataservice="dataservice"
            :dataservice-url="dataserviceUrl"
          >
            <RiSparklingLine
              v-if="isTabularApi"
              class="size-4 flex-none"
            />
            <RiTerminalLine
              v-else
              class="size-4 flex-none"
            />
            <AppLink
              class="truncate"
              :to="dataserviceUrl"
            >
              {{ dataservice.title }}
            </AppLink>
          </slot>
        </h4>
        <div
          v-if="dataservice.organization || dataservice.owner"
          class="text-gray-medium overflow-hidden flex items-center gap-1 m-0"
        >
          <p
            v-if="dataservice.organization"
            class="text-sm block overflow-hidden mb-0 relative z-[2]"
          >
            <AppLink
              v-if="organizationUrl"
              class="link text-sm overflow-hidden"
              :to="organizationUrl"
            >
              <OrganizationNameWithCertificate :organization="dataservice.organization" />
            </AppLink>
            <OrganizationNameWithCertificate
              v-else
              :organization="dataservice.organization"
            />
          </p>
          <p
            v-else
            class="text-sm mb-0 truncate"
          >
            {{ ownerName }}
          </p>
          <RiSubtractLine class="size-4 flex-none fill-gray-medium" />
          <!-- This comment is only here to fix this issue https://github.com/datagouv/cdata/issues/653, it could be empty… -->
          <p class="text-sm whitespace-nowrap mb-0">
            {{ t('Mis à jour {date}', { date: formatRelativeIfRecentDate(dataservice.metadata_modified_at, { dateStyle: 'medium' }) }) }}
          </p>
          <RiSubtractLine class="size-4 flex-none fill-gray-medium" />
          <div class="flex items-center gap-1">
            <p
              class="text-sm mb-0 flex items-center gap-0.5"
              :aria-label="t('{n} vues | {n} vue | {n} vues', dataservice.metrics.views)"
            >
              <RiEyeLine
                aria-hidden="true"
                class="size-3.5"
              />{{ summarize(dataservice.metrics.views) }}
            </p>
            <p
              class="text-sm mb-0 flex items-center gap-0.5"
              :aria-label="t('{n} abonnés | {n} abonné | {n} abonnés', dataservice.metrics.followers)"
            >
              <RiStarLine
                aria-hidden="true"
                class="size-3.5"
              />{{ summarize(dataservice.metrics.followers) }}
            </p>
          </div>
        </div>
        <component
          :is="config.textClamp"
          v-if="config.textClamp && dataservice.description && showDescription"
          class="text-sm mt-2 mb-0"
          :auto-resize="true"
          :text="removeMarkdownSync(dataservice.description)"
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
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { RiEyeLine, RiLockLine, RiPassValidLine, RiSparklingLine, RiStarLine, RiSubtractLine, RiTerminalLine } from '@remixicon/vue'
import { useComponentsConfig } from '../config'
import { useFormatDate } from '../functions/dates'
import { summarize } from '../functions/helpers'
import { removeMarkdownSync } from '../functions/markdown'
import { getOwnerName } from '../functions/owned'
import type { Dataservice } from '../types/dataservices'
import { useTranslation } from '../composables/useTranslation'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import AppLink from './AppLink.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'

type TagIntoBadge = {
  name: string
  value: string
  color: string
}

type Props = {
  dataservice: Dataservice

  /**
     * The dataserviceUrl is a route location object to allow Vue Router to navigate to the details of a dataservice.
     * It is used as a separate prop to allow other sites using the package to define their own dataservice pages.
     */
  dataserviceUrl?: RouteLocationRaw

  /**
     * The organizationUrl is an optional route location object to allow Vue Router to navigate to the details of the organization linked to tha dataservice.
     * It is used as a separate prop to allow other sites using the package to define their own organization pages.
     */
  organizationUrl?: RouteLocationRaw
  showDescription?: boolean
  tagIntoBadge?: TagIntoBadge[]
}

const props = withDefaults(defineProps<Props>(), {
  style: () => ({}),
  showDescription: true,
})

const dataserviceUrl = computed(() => props.dataserviceUrl || props.dataservice.self_web_url)

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()
const ownerName = computed(() => getOwnerName(props.dataservice))
const showBadge = computed(() => props.dataservice.access_type === 'restricted' || props.dataservice.access_type === 'open_with_account' || props.dataservice.private || props.dataservice.archived_at)

const config = useComponentsConfig()
const isTabularApi = computed(() => {
  return config.tabularApiDataserviceId === props.dataservice.id
})

const matchingBadges = computed(() => {
  if (!props.tagIntoBadge || !props.dataservice.tags) return []
  const dataserviceTags = new Set(props.dataservice.tags)
  return props.tagIntoBadge.filter(badge => dataserviceTags.has(badge.value))
})
</script>

  <style scoped>
  .border-tabular-api {
    border-color: #373C42 !important;
  }
  </style>
