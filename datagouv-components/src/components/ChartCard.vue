<template>
  <ObjectCard
    class="dg-content-card dg-catalog-card"
    media-size="xl"
  >
    <template #media>
      <CardMedia
        :src="chart.image"
        :alt="chart.title"
        kind="chart"
      />
    </template>

    <div class="dg-card-heading-row">
      <ObjectCardHeader
        :icon="chartIcon"
        :url="chartUrl || chart.page"
      >
        {{ chart.title }}
      </ObjectCardHeader>

      <ObjectCardBadge
        v-if="chart.deleted_at"
        :icon="RiDeleteBinLine"
        tone="danger"
      >
        {{ t('Supprimé') }}
      </ObjectCardBadge>

      <ObjectCardBadge
        v-else-if="chart.private"
        :icon="RiLockLine"
      >
        {{ t('Brouillon') }}
      </ObjectCardBadge>
    </div>

    <div
      v-if="chart.organization || chart.owner"
      class="text-sm flex flex-wrap gap-x-2 gap-y-1 items-center"
    >
      <ObjectCardOwner
        show-details
        :organization="chart.organization"
        :owner="chart.owner"
        :organization-url="organizationUrl"
      />
    </div>
    <div class="dg-card-update-row">
      <TranslationT
        tag="p"
        class="dg-card-updated"
        keypath="Mis à jour {date}"
      >
        <template #date>
          <FormattedDate
            :date="chart.last_modified"
            format="relative"
            :options="{ dateStyle: 'medium' }"
          />
        </template>
      </TranslationT>
    </div>

    <div class="dg-card-metrics flex flex-wrap items-center text-sm text-gray-medium mt-1">
      <p
        class="text-sm mb-0 flex items-center gap-0.5"
        :aria-label="t('{n} vues | {n} vue | {n} vues', chart.metrics.views)"
      >
        <RiEyeLine
          data-icon-size="compact"
          focusable="false"
          aria-hidden="true"
          class="dg-ds-icon"
        />{{ summarize(chart.metrics.views) }}
      </p>
    </div>

    <ObjectCardShortDescription :text="chart.description" />
    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
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
