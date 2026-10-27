<template>
  <ObjectCard
    :article-class="{
      'border-tabular-api': isTabularApi,
      'border-gray-default': !isTabularApi,
    }"
  >
    <template #media>
      <OrganizationLogo
        v-if="dataservice.organization"
        :organization="dataservice.organization"
        size-class="size-12"
      />
      <Avatar v-else-if="dataservice.owner" :user="dataservice.owner" :size="48" />
      <Placeholder v-else type="Dataservice" class="size-12" />
    </template>

    <div class="card-heading-row">
      <ObjectCardHeader
        :icon="isTabularApi ? RiSparklingLine : RiTerminalLine"
        :url="dataserviceUrl || dataservice.self_web_url"
        :title-tag="titleTag"
      >
        {{ dataservice.title }}
      </ObjectCardHeader>
      <ObjectCardBadge v-if="dataservice.private" :icon="RiLockLine">{{
        t('Brouillon')
      }}</ObjectCardBadge>
      <ObjectCardBadge v-else-if="dataservice.archived_at" :icon="RiArchiveLine">{{
        t('Archivé')
      }}</ObjectCardBadge>
      <ObjectCardBadge
        v-else-if="dataservice.access_type === 'restricted'"
        :icon="RiLockLine"
        tone="warning"
        >{{ t('Accès restreint') }}</ObjectCardBadge
      >
      <ObjectCardBadge
        v-else-if="dataservice.access_type === 'open_with_account'"
        :icon="RiPassValidLine"
        tone="yellow"
        >{{ t('Ouvert avec un compte') }}</ObjectCardBadge
      >
    </div>
    <ObjectCardOwner
      v-if="dataservice.organization || dataservice.owner"
      :organization="dataservice.organization"
      :owner="dataservice.owner"
      :organization-url="organizationUrl"
    />
    <TranslationT tag="div" class="card-date" keypath="Mis à jour {date}">
      <template #date
        ><FormattedDate
          :date="dataservice.metadata_modified_at"
          format="relative"
          :options="{ dateStyle: 'medium' }"
      /></template>
    </TranslationT>
    <div class="card-metadata-row" :class="{ 'card-metadata-row--quality': dataservice.quality }">
      <DataserviceQualityInline v-if="dataservice.quality" :quality="dataservice.quality" />
      <div class="card-metrics">
        <p :aria-label="t('{n} vues | {n} vue | {n} vues', dataservice.metrics.views)">
          <RiEyeLine aria-hidden="true" />{{ summarize(dataservice.metrics.views) }}
        </p>
        <p :aria-label="t('{n} abonnés | {n} abonné | {n} abonnés', dataservice.metrics.followers)">
          <RiStarLine aria-hidden="true" />{{ summarize(dataservice.metrics.followers) }}
        </p>
      </div>
    </div>
    <ObjectCardShortDescription v-if="showDescription" :text="dataservice.description" />

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
import { summarize } from '../functions/helpers'
import type { Dataservice } from '../types/dataservices'
import type { TitleTag } from '../types/ui'
import { useTranslation } from '../composables/useTranslation'
import OrganizationLogo from './OrganizationLogo.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
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

<style scoped>
.border-tabular-api {
  border-color: #373c42 !important;
}
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
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  color: #555;
}
.card-metrics {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-variant-numeric: tabular-nums;
}
.card-metadata-row--quality .card-metrics {
  padding-inline-start: 0.75rem;
  border-inline-start: 1px solid #e5e5e5;
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
