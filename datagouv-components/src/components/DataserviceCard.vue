<template>
  <article
    class="my-4 p-4 bg-white border border-gray-default fr-enlarge-link"
    :class="{
      'border-tabular-api': isTabularApi,
      'mt-6': showBadge,
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
        <span
          class="fr-icon-lock-line fr-icon--sm"
          aria-hidden="true"
        />
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
        <span
          class="fr-icon-lock-line fr-icon--sm"
          aria-hidden="true"
        />
        {{ t('Brouillon') }}
      </p>
      <p
        v-if="dataservice.archived_at"
        class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium mr-2"
      >
        <span
          class="fr-icon-lock-line fr-icon--sm"
          aria-hidden="true"
        />
        {{ t('Archivé') }}
      </p>
    </div>
    <h4 class="fr-text--md fr-mb-0">
      <slot
        name="dataserviceUrl"
        :dataservice="dataservice"
        :dataservice-url="dataserviceUrl"
      >
        <svg
          v-if="isTabularApi"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          class="fr-mr-1v"
          style="width:1rem"
        ><path d="M17.0007 1.20825 18.3195 3.68108 20.7923 4.99992 18.3195 6.31876 17.0007 8.79159 15.6818 6.31876 13.209 4.99992 15.6818 3.68108 17.0007 1.20825ZM10.6673 9.33325 15.6673 11.9999 10.6673 14.6666 8.00065 19.6666 5.33398 14.6666.333984 11.9999 5.33398 9.33325 8.00065 4.33325 10.6673 9.33325ZM11.4173 11.9999 9.18905 10.8115 8.00065 8.58325 6.81224 10.8115 4.58398 11.9999 6.81224 13.1883 8.00065 15.4166 9.18905 13.1883 11.4173 11.9999ZM19.6673 16.3333 18.0007 13.2083 16.334 16.3333 13.209 17.9999 16.334 19.6666 18.0007 22.7916 19.6673 19.6666 22.7923 17.9999 19.6673 16.3333Z" /></svg>
        <span
          v-else
          class="fr-icon-terminal-line fr-icon--sm fr-mr-1v"
          aria-hidden="true"
        />
        <AppLink
          class="inline-flex"
          :to="dataserviceUrl"
        >
          <component
            :is="config.textClamp"
            v-if="config.textClamp"
            :auto-resize="true"
            :text="dataservice.title"
            :max-lines="1"
          />
        </AppLink>
      </slot>
    </h4>
    <p
      v-if="dataservice.organization || dataservice.owner"
      class="text-sm text-gray-medium overflow-hidden flex items-center gap-1 mt-1 mb-0"
    >
      <span
        v-if="dataservice.organization"
        class="block not-enlarged overflow-hidden"
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
      </span>
      <component
        :is="config.textClamp"
        v-else-if="config.textClamp"
        class="not-enlarged mr-1"
        :auto-resize="true"
        :text="ownerName"
        :max-lines="1"
      />
      <RiSubtractLine class="size-4 flex-none fill-gray-medium" />
      <span class="block whitespace-nowrap">{{ t('Mis à jour {date}', { date: formatRelativeIfRecentDate(dataservice.metadata_modified_at, { dateStyle: 'medium' }) }) }}</span>
    </p>
    <div class="flex flex-wrap items-center gap-1 mt-1 text-gray-medium">
      <p class="text-sm mb-0">
        {{ t('Disponibilité :') }}
        <span class="text-gray-plain">
          <template v-if="dataservice.availability">
            {{ t('{n}%', dataservice.availability) }}
          </template>
          <template v-else>
            {{ t('inconnue') }}
          </template>
        </span>
      </p>
      <RiSubtractLine class="size-4 flex-none fill-gray-medium" />
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
    <component
      :is="config.textClamp"
      v-if="config.textClamp && description && showDescription"
      class="fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere"
      :auto-resize="true"
      :text="description"
      :max-lines="2"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RouteLocationRaw } from 'vue-router'
import { RiEyeLine, RiPassValidLine, RiStarLine, RiSubtractLine } from '@remixicon/vue'
import { useComponentsConfig } from '../config'
import { useFormatDate } from '../functions/dates'
import { summarize } from '../functions/helpers'
import { removeMarkdown } from '../functions/markdown'
import { getOwnerName } from '../functions/owned'
import type { Dataservice } from '../types/dataservices'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import AppLink from './AppLink.vue'

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
  }

const props = withDefaults(defineProps<Props>(), {
  style: () => ({}),
  showDescription: true,
})

const dataserviceUrl = computed(() => props.dataserviceUrl || props.dataservice.self_web_url)

const { t } = useI18n()
const { formatRelativeIfRecentDate } = useFormatDate()
const ownerName = computed(() => getOwnerName(props.dataservice))
const showBadge = computed(() => props.dataservice.access_type === 'restricted' || props.dataservice.access_type === 'open_with_account' || props.dataservice.private || props.dataservice.archived_at)

const config = useComponentsConfig()
const isTabularApi = computed(() => {
  return config.tabularApiDataserviceId === props.dataservice.id
})

const description = ref('')
watchEffect(async () => {
  description.value = await removeMarkdown(props.dataservice.description)
})
</script>

  <style scoped>
  .border-tabular-api {
    border-color: #373C42 !important;
  }
  </style>
