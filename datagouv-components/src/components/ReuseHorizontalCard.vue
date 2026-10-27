<template>
  <ObjectCard media-size="lg">
    <template #media>
      <CardMedia :src="reuse.image" :alt="reuse.title" kind="reuse" />
    </template>
    <div class="card-heading-row">
      <ObjectCardHeader :icon="RiLineChartLine" :url="reuseUrl || reuse.page">{{
        reuse.title
      }}</ObjectCardHeader>
      <ObjectCardBadge v-if="reuse.private" :icon="RiLockLine">{{
        t('Brouillon')
      }}</ObjectCardBadge>
      <ObjectCardBadge v-else-if="reuse.archived" :icon="RiArchiveLine">{{
        t('Archivé')
      }}</ObjectCardBadge>
    </div>

    <div
      v-if="reuse.organization || reuse.owner"
      class="text-sm flex flex-wrap gap-y-1 items-center"
    >
      <ObjectCardOwner
        :organization="reuse.organization"
        :owner="reuse.owner"
        :organization-url="organizationUrl"
      />
    </div>

    <TranslationT tag="div" class="card-date" keypath="Publié {date}">
      <template #date
        ><FormattedDate
          :date="reuse.created_at"
          format="relative"
          :options="{ dateStyle: 'medium' }"
      /></template>
    </TranslationT>
    <ReuseDetails :reuse />
    <ObjectCardShortDescription :text="reuse.description" />

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiArchiveLine, RiLineChartLine, RiLockLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Reuse, ReuseV2 } from '../types/reuses'
import { useTranslation } from '../composables/useTranslation'
import ReuseDetails from './ReuseDetails.vue'
import CardMedia from './CardMedia.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import FormattedDate from './FormattedDate.vue'
import TranslationT from './TranslationT.vue'

defineProps<{
  reuse: Reuse | ReuseV2
  reuseUrl?: RouteLocationRaw
  // undefined falls back to the organization's data.gouv.fr page; pass null to render plain, non-linked text
  organizationUrl?: RouteLocationRaw | null
}>()

const { t } = useTranslation()
</script>

<style scoped>
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
</style>
