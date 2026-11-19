<template>
  <ObjectCard
    :url="chartUrl || chart.page"
    :icon="chartIcon"
    media-size="xl"
  >
    <template #media>
      <CardMedia
        :src="chart.image"
        :alt="chart.title"
        kind="chart"
      />
    </template>
    <template #title>
      {{ chart.title }}
    </template>
    <template
      v-if="chart.deleted_at || chart.private"
      #badge
    >
      <ObjectCardBadge
        v-if="chart.deleted_at"
        :icon="RiDeleteBinLine"
        tone="danger"
      >
        {{ t('Supprimé') }}
      </ObjectCardBadge>
      <ObjectCardBadge
        v-else
        :icon="RiLockLine"
      >
        {{ t('Brouillon') }}
      </ObjectCardBadge>
    </template>

    <ObjectCardOwner
      v-if="chart.organization || chart.owner"
      show-details
      :organization="chart.organization"
      :owner="chart.owner"
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
            :date="chart.last_modified"
            format="relative"
            :options="{ dateStyle: 'medium' }"
          />
        </template>
      </TranslationT>
    </ObjectCardMeta>
    <ObjectCardMeta class="mt-1 max-[480px]:hidden">
      <ObjectCardMetric
        :icon="RiEyeLine"
        :value="chart.metrics.views"
        :label="t('{n} vues | {n} vue | {n} vues', chart.metrics.views)"
      />
    </ObjectCardMeta>
    <ObjectCardShortDescription
      :text="chart.description"
      class="max-md:hidden"
    />
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
import { useTranslation } from '../composables/useTranslation'
import CardMedia from './CardMedia.vue'
import FormattedDate from './FormattedDate.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardBadge from './ObjectCardBadge.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import ObjectCardMeta from './ObjectCardMeta.vue'
import ObjectCardMetric from './ObjectCardMetric.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
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
