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
        type="Dataservice"
        class="size-12"
      />
    </template>

    <ObjectCardHeader
      :icon="isTabularApi ? RiSparklingLine : RiTerminalLine"
      :url="dataserviceUrl || dataservice.self_web_url"
    >
      {{ dataservice.title }}
    </ObjectCardHeader>
    <div
      v-if="dataservice.organization || dataservice.owner"
      class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <ObjectCardOwner
        :organization="dataservice.organization"
        :owner="dataservice.owner"
        :organization-url="organizationUrl"
      />
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
    <ObjectCardShortDescription
      v-if="showDescription"
      :text="dataservice.description"
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
import type { Dataservice } from '../types/dataservices'
import { useTranslation } from '../composables/useTranslation'
import OrganizationLogo from './OrganizationLogo.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'

type Props = {
  dataservice: Dataservice
  dataserviceUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw
  showDescription?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true,
})

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()

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
