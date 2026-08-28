<template>
  <ObjectCard media-size="xl">
    <template #badge>
      <ObjectCardBadge
        v-if="chart.private"
        :icon="RiLockLine"
      >
        {{ t('Brouillon') }}
      </ObjectCardBadge>
    </template>

    <template #media>
      <img
        v-if="chart.image"
        :src="chart.image"
        class="w-full h-full object-cover"
        :alt="chart.title"
      >
      <Placeholder
        v-else
        type="Chart"
        class="w-full h-full"
      />
    </template>

    <ObjectCardHeader
      :icon="chartIcon"
      :url="chartUrl || chart.page"
    >
      {{ chart.title }}
    </ObjectCardHeader>

    <div
      v-if="chart.organization || chart.owner"
      class="text-sm flex flex-wrap gap-y-1 items-center truncate"
    >
      <ObjectCardOwner
        :organization="chart.organization"
        :owner="chart.owner"
        :organization-url="organizationUrl"
      />
      <RiSubtractLine
        aria-hidden="true"
        class="size-4 flex-none fill-gray-medium"
      />
      <p class="text-sm whitespace-nowrap mb-0 text-gray-medium">
        {{ t('Mis à jour {date}', { date: formatRelativeIfRecentDate(chart.last_modified, { dateStyle: 'medium' }) }) }}
      </p>
    </div>

    <div class="mx-0 -mb-1 flex flex-wrap items-center text-sm text-gray-medium mt-1">
      <p
        class="text-sm mb-0 flex items-center gap-0.5"
        :aria-label="t('{n} vues | {n} vue | {n} vues', chart.metrics.views)"
      >
        <RiEyeLine
          aria-hidden="true"
          class="size-3.5"
        />{{ summarize(chart.metrics.views) }}
      </p>
    </div>

    <ObjectCardShortDescription :text="chart.description" />

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiBarChartBoxLine, RiEyeLine, RiLineChartLine, RiLockLine, RiSubtractLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Chart } from '../types/visualizations'
import { useFormatDate } from '../functions/dates'
import { summarize } from '../functions/helpers'
import { useTranslation } from '../composables/useTranslation'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'

const props = defineProps<{
  chart: Chart
  chartUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw
}>()

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()

const chartIcon = computed(() => {
  return props.chart.series[0]?.type === 'line' ? RiLineChartLine : RiBarChartBoxLine
})
</script>
