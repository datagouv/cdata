<template>
  <ObjectCard
    :url="dataserviceUrl || dataservice.self_web_url"
    :icon="isTabularApi ? RiSparklingLine : RiTerminalLine"
    :title-tag
    :highlighted="isTabularApi"
  >
    <template #media>
      <OrganizationLogo
        v-if="dataservice.organization"
        :organization="dataservice.organization"
        size-class="size-12 p-1"
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
    <template #title>
      {{ dataservice.title }}
    </template>
    <template
      v-if="dataservice.private || dataservice.archived_at || dataservice.access_type === 'restricted' || dataservice.access_type === 'open_with_account'"
      #badge
    >
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
        tone="warning"
      >
        {{ t('Accès restreint') }}
      </ObjectCardBadge>
      <ObjectCardBadge
        v-else-if="dataservice.access_type === 'open_with_account'"
        :icon="RiPassValidLine"
        tone="yellow"
      >
        {{ t('Ouvert avec un compte') }}
      </ObjectCardBadge>
    </template>

    <ObjectCardOwner
      show-details
      :organization="dataservice.organization"
      :owner="dataservice.owner"
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
            :date="dataservice.metadata_modified_at"
            format="relative"
            :options="{ dateStyle: 'medium' }"
          />
        </template>
      </TranslationT>
      <DataserviceQualityInline
        v-if="dataservice.quality"
        :quality="dataservice.quality"
        class="max-[480px]:hidden"
      />
      <ObjectCardMetrics class="max-[480px]:hidden">
        <ObjectCardMetric
          :icon="RiEyeLine"
          :value="dataservice.metrics.views"
          :label="t('{n} vues | {n} vue | {n} vues', dataservice.metrics.views)"
        />
        <ObjectCardMetric
          :icon="RiStarLine"
          :value="dataservice.metrics.followers"
          :label="t('{n} abonnés | {n} abonné | {n} abonnés', dataservice.metrics.followers)"
        />
      </ObjectCardMetrics>
    </ObjectCardMeta>
    <ObjectCardShortDescription
      v-if="showDescription"
      :text="dataservice.description"
      class="max-md:hidden"
    />
    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import {
  RiArchiveLine,
  RiEyeLine,
  RiLockLine,
  RiPassValidLine,
  RiSparklingLine,
  RiStarLine,
  RiTerminalLine,
} from '@remixicon/vue'
import { useComponentsConfig } from '../config'
import type { Dataservice } from '../types/dataservices'
import type { TitleTag } from '../types/ui'
import { useTranslation } from '../composables/useTranslation'
import OrganizationLogo from './OrganizationLogo.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardMeta from './ObjectCardMeta.vue'
import ObjectCardMetric from './ObjectCardMetric.vue'
import ObjectCardMetrics from './ObjectCardMetrics.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import DataserviceQualityInline from './DataserviceQualityInline.vue'
import FormattedDate from './FormattedDate.vue'
import TranslationT from './TranslationT.vue'

type Props = {
  dataservice: Dataservice
  dataserviceUrl?: RouteLocationRaw
  // undefined falls back to the organization's data.gouv.fr page; pass null to render plain, non-linked text
  organizationUrl?: RouteLocationRaw | null
  showDescription?: boolean
  titleTag?: TitleTag
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true,
})

const { t } = useTranslation()

const config = useComponentsConfig()
const isTabularApi = computed(() => {
  return config.tabularApiDataserviceId === props.dataservice.id
})
</script>
