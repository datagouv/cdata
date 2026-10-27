<template>
  <ObjectCard
    class="dg-content-card dg-catalog-card"
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

    <div class="dg-card-heading-row">
      <ObjectCardHeader
        :icon="isTabularApi ? RiSparklingLine : RiTerminalLine"
        :url="dataserviceUrl || dataservice.self_web_url"
        :title-tag="titleTag"
      >
        {{ dataservice.title }}
      </ObjectCardHeader>

      <ObjectCardBadge
        v-if="dataservice.private"
        :icon="RiLockLine"
      >
        {{ t('Brouillon') }}
      </ObjectCardBadge>

      <ObjectCardBadge
        v-else-if="dataservice.archived_at"
        :icon="RiArchiveLine"
        tone="neutral"
      >
        {{ t('Archivé') }}
      </ObjectCardBadge>

      <ObjectCardBadge
        v-else-if="dataservice.access_type === 'restricted'"
        tone="warning"
        :icon="RiLockLine"
      >
        {{ t('Accès restreint') }}
      </ObjectCardBadge>

      <ObjectCardBadge
        v-else-if="dataservice.access_type === 'open_with_account'"
        tone="yellow"
        :icon="RiPassValidLine"
      >
        {{ t('Ouvert avec un compte') }}
      </ObjectCardBadge>
    </div>
    <div class="dg-card-details">
      <ObjectCardOwner
        show-details
        :organization="dataservice.organization"
        :owner="dataservice.owner"
        :organization-url="organizationUrl"
      />
      <div class="dg-card-update-row">
        <TranslationT
          tag="div"
          class="dg-card-updated"
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
      </div>
    </div>
    <div
      class="dg-card-metadata-row"
      :class="{ 'dg-card-has-quality': dataservice.quality }"
    >
      <DataserviceQualityInline
        v-if="dataservice.quality"
        :quality="dataservice.quality"
      />

      <div class="dg-card-metrics flex flex-wrap items-center gap-3 text-gray-medium">
        <p
          class="text-sm mb-0 flex items-center gap-0.5"
          :aria-label="t('{n} vues | {n} vue | {n} vues', dataservice.metrics.views)"
        >
          <RiEyeLine
            data-icon-size="compact"
            focusable="false"
            aria-hidden="true"
            class="dg-ds-icon"
          />{{ summarize(dataservice.metrics.views) }}
        </p>
        <p
          class="text-sm mb-0 flex items-center gap-0.5"
          :aria-label="t('{n} abonnés | {n} abonné | {n} abonnés', dataservice.metrics.followers)"
        >
          <RiStarLine
            data-icon-size="compact"
            focusable="false"
            aria-hidden="true"
            class="dg-ds-icon"
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
import '../../assets/cards.css'
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
  border-color: var(--dg-card-text-secondary) !important;
}
</style>
