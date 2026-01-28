<template>
  <ObjectCard
    :article-class="{
      'border-tabular-api': isTabularApi,
      'border-gray-default': !isTabularApi,
    }"
  >
    <template #badge>
      <ObjectCardBadge
        v-if="dataservice.private"
        :icon="RiLockLine"
      >
        {{ t('Brouillon') }}
      </ObjectCardBadge>
      <ObjectCardBadge
        v-else-if="dataservice.archived_at"
        :icon="RiArchiveLine"
      >
        {{ t('Archivé') }}
      </ObjectCardBadge>
      <ObjectCardBadge
        v-else-if="dataservice.access_type === 'restricted'"
        :icon="RiLockLine"
      >
        {{ t('Accès restreint') }}
      </ObjectCardBadge>
      <ObjectCardBadge
        v-else-if="dataservice.access_type === 'open_with_account'"
        :icon="RiPassValidLine"
      >
        {{ t('Ouvert avec un compte') }}
      </ObjectCardBadge>
    </template>

    <template #media>
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
    </template>

    <h4 class="text-base mb-0 flex items-center gap-1">
      <slot
        name="dataserviceUrl"
        :dataservice="dataservice"
        :dataservice-url="dataserviceUrl"
      >
        <RiSparklingLine
          v-if="isTabularApi"
          aria-hidden="true"
          class="size-4 flex-none"
        />
        <RiTerminalLine
          v-else
          aria-hidden="true"
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
      <RiSubtractLine
        aria-hidden="true"
        class="size-4 flex-none fill-gray-medium"
      />
      <!-- https://github.com/datagouv/cdata/issues/653 -->
      <p class="text-sm whitespace-nowrap mb-0">
        {{ t('Mis à jour {date}', { date: formatRelativeIfRecentDate(dataservice.metadata_modified_at, { dateStyle: 'medium' }) }) }}
      </p>
      <RiSubtractLine
        aria-hidden="true"
        class="size-4 flex-none fill-gray-medium"
      />
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

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { RiArchiveLine, RiEyeLine, RiLockLine, RiPassValidLine, RiSparklingLine, RiStarLine, RiSubtractLine, RiTerminalLine } from '@remixicon/vue'
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
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'

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
  showDescription: true,
})

const dataserviceUrl = computed(() => props.dataserviceUrl || props.dataservice.self_web_url)

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()
const ownerName = computed(() => getOwnerName(props.dataservice))

const config = useComponentsConfig()
const isTabularApi = computed(() => {
  return config.tabularApiDataserviceId === props.dataservice.id
})
</script>

<style scoped>
.border-tabular-api {
  border-color: #373C42 !important;
}
</style>
