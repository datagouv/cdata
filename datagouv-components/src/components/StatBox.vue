<template>
  <div v-if="size === 'sm'">
    <h3 class="text-sm font-bold m-0">
      {{ title }}
    </h3>
    <div class="flex flex-wrap items-center">
      <ContentLoader
        v-if="summary === null"
        :width="39"
        :height="24"
        :speed="2"
        primary-color="#f3f3f3"
        secondary-color="#ecebeb"
      >
        <rect
          x="0"
          y="0"
          rx="3"
          ry="3"
          width="39"
          height="24"
        />
      </ContentLoader>
      <p
        v-else
        class="font-extrabold leading-none m-0"
      >
        {{ summarize(summary, 2) }}
      </p>
      <ContentLoader
        v-if="data === null"
        :width="77"
        :height="19"
        :speed="2"
        primary-color="#f3f3f3"
        secondary-color="#ecebeb"
        class="ml-2"
      >
        <rect
          x="0"
          y="0"
          rx="3"
          ry="3"
          width="77"
          height="19"
        />
      </ContentLoader>
      <div
        v-else-if="data && changesThisYear"
        class="ml-2"
      >
        <SmallChart
          :type
          :data
          :last-with-low-emphasis="true"
          :show-axis-label="false"
          :height="19"
          :width="77"
        />
      </div>
    </div>
    <template v-if="lastValue && lastMonth">
      <p
        v-if="since"
        class="mt-1 mb-0 text-xs"
      >
        {{ t("depuis ") }}
        {{ formatDate(since, { dateStyle: undefined, year: 'numeric', month: 'short', day: undefined }) }}
      </p>
      <p class="mt-1 mb-0 text-xs text-success-darkest">
        <strong>
          + {{ summarize(lastValue, 2) }}
        </strong>
        {{ t(" en ") }}
        {{ formatDate(lastMonth, { dateStyle: undefined, year: 'numeric', month: 'short', day: undefined }) }}
      </p>
    </template>
  </div>
  <div
    v-else
    :class="{
      'text-gray-medium': !changesThisYear && !summary,
    }"
  >
    <h3 class="text-sm m-0">
      {{ title }}
    </h3>
    <div class="flex flex-wrap items-center">
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
        class="font-extrabold text-[2rem] leading-none m-0"
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
        class="ml-2"
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
        v-else-if="data && changesThisYear"
        class="ml-2"
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
      class="mt-2 font-normal text-transform-none fr-badge fr-badge--no-icon fr-badge--success"
    >
      <strong class="mr-1">
        + {{ summarize(lastValue, 2) }}
      </strong>
      {{ t(" en ") }}
      {{ formatDate(lastMonth, { dateStyle: undefined, year: 'numeric', month: 'short', day: undefined }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ContentLoader } from 'vue-content-loader'
import { useFormatDate } from '../functions/dates'
import { summarize } from '../functions/helpers'
import { useTranslation } from '../composables/useTranslation'
import SmallChart from './SmallChart.vue'

const props = defineProps<{
  title: string
  data?: Record<string, number> | null
  type: 'line' | 'bar'
  size?: 'sm'
  summary?: number | null
  since?: string | null
}>()

const { t } = useTranslation()
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
