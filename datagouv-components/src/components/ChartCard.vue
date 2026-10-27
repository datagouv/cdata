<template>
  <ObjectCard media-size="xl">
    <template #media>
      <CardMedia :src="chart.image" :alt="chart.title" kind="chart" />
    </template>
    <div class="card-heading-row">
      <ObjectCardHeader :icon="chartIcon" :url="chartUrl || chart.page">{{
        chart.title
      }}</ObjectCardHeader>
      <ObjectCardBadge v-if="chart.deleted_at" :icon="RiDeleteBinLine" tone="danger">{{
        t('Supprimé')
      }}</ObjectCardBadge>
      <ObjectCardBadge v-else-if="chart.private" :icon="RiLockLine">{{
        t('Brouillon')
      }}</ObjectCardBadge>
    </div>

    <div
      v-if="chart.organization || chart.owner"
      class="text-sm flex flex-wrap gap-y-1 items-center"
    >
      <ObjectCardOwner
        :organization="chart.organization"
        :owner="chart.owner"
        :organization-url="organizationUrl"
      />
    </div>
    <TranslationT tag="div" class="card-date" keypath="Mis à jour {date}">
      <template #date
        ><FormattedDate
          :date="chart.last_modified"
          format="relative"
          :options="{ dateStyle: 'medium' }"
      /></template>
    </TranslationT>
    <p class="card-metric" :aria-label="t('{n} vues | {n} vue | {n} vues', chart.metrics.views)">
      <RiEyeLine aria-hidden="true" />{{ summarize(chart.metrics.views) }}
    </p>

    <ObjectCardShortDescription :text="chart.description" />

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  RiBarChartBoxLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiLineChartLine,
  RiLockLine,
} from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Chart } from '../types/visualizations'
import { summarize } from '../functions/helpers'
import { useTranslation } from '../composables/useTranslation'
import CardMedia from './CardMedia.vue'
import FormattedDate from './FormattedDate.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import TranslationT from './TranslationT.vue'

const props = defineProps<{
  chart: Chart
  chartUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw
}>()

const { t } = useTranslation()

const chartIcon = computed(() => {
  return props.chart.series[0]?.type === 'line' ? RiLineChartLine : RiBarChartBoxLine
})
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
.card-metric {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  margin: 0;
  color: #555;
  font-size: 0.75rem;
  line-height: 1.125rem;
  font-variant-numeric: tabular-nums;
}
.card-metric svg {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
