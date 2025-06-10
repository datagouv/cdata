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
      <div
        v-if="summary === null"
        class="animate-pulse-placeholder w-[92px] h-[32px] bg-gray-default rounded"
      />
      <p
        v-else
        class="h1 line-height-1 fr-m-0"
      >
        {{ summarize(summary, 2) }}
      </p>
      <div
        v-if="data === null"
        class="animate-pulse-placeholder w-[120px] h-[30px] bg-gray-default rounded"
      />
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
