<template>
  <div
    :class="{
      'text-gray-medium': !changesThisYear && !summary,
    }"
  >
    <h3 class="fr-text--sm fr-m-0">
      {{ title }}
    </h3>
    <div class="fr-grid-row fr-grid-row--middle">
      <ContentLoader
        v-if="summary === null"
        :width="92"
        :height="32"
        :speed="2"
        primary-color="#f3f3f3"
        secondary-color="#ecebeb"
      >
        <rect
          x="0"
          y="0"
          rx="3"
          ry="3"
          width="92"
          height="32"
        />
      </ContentLoader>
      <p
        v-else
        class="h1 line-height-1 fr-m-0"
      >
        {{ summarize(summary, 2) }}
      </p>
      <ContentLoader
        v-if="data === null"
        :width="120"
        :height="30"
        :speed="2"
        primary-color="#f3f3f3"
        secondary-color="#ecebeb"
        class="fr-ml-1w"
      >
        <rect
          x="0"
          y="0"
          rx="3"
          ry="3"
          width="120"
          height="30"
        />
      </ContentLoader>
      <div
        v-else-if="changesThisYear"
        class="fr-ml-1w"
      >
        <SmallChart
          :type
          :data
          :last-with-low-emphasis="true"
        />
      </div>
    </div>
    <p
      v-if="lastValue && lastMonth"
      class="fr-mt-1w fr-text--regular text-transform-none fr-badge fr-badge--no-icon fr-badge--success"
    >
      <strong class="fr-mr-1v">
        + {{ summarize(lastValue, 2) }}
      </strong>
      {{ t(" in ") }}
      {{ formatDate(lastMonth, { dateStyle: undefined, year: 'numeric', month: 'short', day: undefined }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ContentLoader } from 'vue-content-loader'
import { useFormatDate } from '../functions/dates'
import { summarize } from '../functions/helpers'
import SmallChart from './SmallChart.vue'

const props = defineProps<{
  title: string
  data: Record<string, number> | null
  type: 'line' | 'bar'
  summary?: number | null
}>()

const { t } = useI18n()
const { formatDate } = useFormatDate()

const months = computed(() => props.data ? Object.keys(props.data) : [])
const values = computed(() => props.data ? Object.values(props.data) : [])
const lastMonth = computed(() => months.value.length ? months.value.reduce((max, c) => c > max ? c : max) : null)
const lastMonthIndex = computed(() => lastMonth.value ? months.value.indexOf(lastMonth.value) : null)
const lastValue = computed(() => lastMonthIndex.value !== null ? values.value[lastMonthIndex.value] : null)

const changesThisYear = computed(() => Math.max(...values.value) > 0)
const summary = computed(() => {
  if (props.summary !== undefined) return props.summary
  if (!props.data) return null

  return Object.values(props.data).reduce((a, b) => a + b, 0)
})
</script>
