<template>
  <div>
    <div class="relative">
      <LoadingBlock
        :status="blockStatus"
        :data="series"
      >
        <template #default="{ data }">
          <!-- Reloads keep the chart on screen; only a slow one veils it. -->
          <div
            :class="veiled ? 'opacity-50' : ''"
            class="transition-opacity motion-reduce:transition-none"
            :aria-busy="veiled || undefined"
            :data-testid="veiled ? 'chart-reloading' : undefined"
          >
            <ChartViewer
              ref="chartViewerRef"
              :chart="displayedChart"
              :series="data"
            />
          </div>
        </template>
        <template #loader>
          <ChartLoader />
        </template>
        <template #error>
          <div class="flex flex-col items-center gap-3 px-4 py-8 text-center text-gray-500">
            <p
              role="alert"
              class="m-0"
            >
              {{ errorMessage ?? t('Une erreur est survenue lors du chargement des données du graphique.') }}
            </p>
            <BrandedButton
              v-if="canRetry"
              color="tertiary"
              size="xs"
              :icon="RiRefreshLine"
              data-testid="chart-retry"
              @click="retry"
            >
              {{ t('Réessayer') }}
            </BrandedButton>
          </div>
        </template>
      </LoadingBlock>
      <!-- Out of LoadingBlock: a live region only announces what is added once it exists.
      A truncated chart gets a white veil over its whole area, so it is not read as the whole data. -->
      <div
        role="status"
        data-testid="chart-notes"
        class="pointer-events-none absolute inset-0 flex items-center justify-center p-6"
        :class="truncated ? 'bg-white/85' : ''"
      >
        <p
          v-if="truncated"
          class="m-0 flex max-w-md items-start gap-2 text-sm font-medium text-new-gray-dark"
          data-testid="chart-truncation-warning"
        >
          <RiAlertLine
            class="size-4 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>{{ truncationWarning(displayedChart.x_axis.column_x, displayedChart.x_axis.sort_x_by, t) }}</span>
        </p>
      </div>
    </div>
    <div
      role="status"
      data-testid="chart-series-notes"
    >
      <p
        v-if="blockStatus === 'success' && someSeriesFailed"
        class="flex items-start gap-1.5 px-4 pb-3 mt-1 mb-0 text-xs text-gray-medium"
        data-testid="chart-series-error"
      >
        <RiErrorWarningLine
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        <span>{{ seriesFailureNote }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import { RiAlertLine, RiErrorWarningLine, RiRefreshLine } from '@remixicon/vue'
import BrandedButton from '../BrandedButton.vue'
import ChartLoader from './ChartLoader.vue'
import ChartViewer from './ChartViewer.vue'
import LoadingBlock from '../../components/LoadingBlock.vue'
import { useComponentsConfig } from '../../config'
import { fetchTabularData, hasMoreGroups, TabularApiError, tabularErrorMessage, useGetProfile, type FetchTabularDataOptions } from '../../functions/tabularApi'
import type { Chart, ChartForApi, ColumnsDefinition } from '../../types/visualizations'
import { useTranslation } from '../../composables/useTranslation'
import { watchDebounced } from '@vueuse/shared'
import { buildColumnsFromProfile } from '../../functions/charts'
import { CHART_PAGE_SIZE, chartDataKey, chartRequestSortDirection, groupsBeyondPage, truncationWarning } from '../../functions/chartData'

const props = defineProps<{
  chart: Chart | ChartForApi
}>()

const { t } = useTranslation()
const chartViewerRef = ref<InstanceType<typeof ChartViewer> | null>(null)

function capture(): string | null {
  return chartViewerRef.value?.capture() ?? null
}

defineExpose({ capture })
const config = useComponentsConfig()
const getProfile = useGetProfile()

const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const error = ref<Error | null>(null)
const errorMessage = computed(() => tabularErrorMessage(error.value, t))
// Retrying a query tabular-api refused would only get the same refusal.
const canRetry = computed(() => !(error.value instanceof TabularApiError) || error.value.retryable)

// The full loader only covers the first load: reloads are short (debounced
// form edits), so hiding the chart each time would flicker. A reload slower
// than RELOAD_VEIL_DELAY dims the current chart instead.
const RELOAD_VEIL_DELAY = 300
const hasRendered = ref(false)
// The profile resolves first: only fetched data ends the first load.
let hasData = false
const veiled = ref(false)
let veilTimer: ReturnType<typeof setTimeout> | undefined
const blockStatus = computed(() => {
  if (status.value === 'error') return 'error'
  return hasRendered.value ? 'success' : 'pending'
})
watch(status, (value) => {
  clearTimeout(veilTimer)
  veiled.value = false
  if (value === 'success' && hasData) hasRendered.value = true
  if (value === 'pending' && hasRendered.value) {
    veilTimer = setTimeout(() => {
      veiled.value = true
    }, RELOAD_VEIL_DELAY)
  }
})
onBeforeUnmount(() => clearTimeout(veilTimer))

const pendingOperations = ref(0)
const moreGroups = ref(false)
const someSeriesFailed = ref(false)
const seriesFailureMessage = ref<string | null>(null)
const seriesFailureNote = computed(() => [t('Une série n’a pas pu être chargée.'), seriesFailureMessage.value].filter(Boolean).join(' '))

function resetNotes() {
  moreGroups.value = false
  someSeriesFailed.value = false
  seriesFailureMessage.value = null
}

// The viewer gets a new chart only with its data: a new Y column or aggregate
// would otherwise be looked up in the previous rows and draw empty axes.
const loadedChart = shallowRef<Chart | ChartForApi>(props.chart)
const displayedChart = computed(() => chartDataKey(props.chart) === chartDataKey(loadedChart.value) ? props.chart : loadedChart.value)

// With an X order the limit keeps the first values of the fetched extract,
// which are right; a Y order ranks only that extract, so it still warns.
const truncated = computed(() => {
  if (blockStatus.value !== 'success') return false
  const { limit, sort_x_by } = displayedChart.value.x_axis
  if (sort_x_by !== 'axis_y' && limit != null && limit <= CHART_PAGE_SIZE) return false
  return moreGroups.value
})

// `data` is keyed by series index (several series can read the same
// resource), `columns` by resource id.
const series = reactive<{
  data: Record<string, Array<Record<string, unknown>>>
  columns: ColumnsDefinition
}>({
  data: {},
  columns: {},
})

const resourceIds = computed(() => {
  return [...new Set(props.chart.series
    .filter(s => s.resource_id)
    .map(s => s.resource_id))]
})

async function fetchSeriesProfile() {
  pendingOperations.value++
  status.value = 'pending'
  error.value = null

  try {
    if (props.chart.series.length === 0) {
      status.value = 'success'
      series.data = {}
      series.columns = {}
      return
    }

    const fetchPromises = resourceIds.value
      .map(async (id) => {
        return {
          id,
          profile: await getProfile(id),
        }
      })

    const results = (await Promise.allSettled(fetchPromises))
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
    series.columns = Object.fromEntries(results.map(result => [
      result.id,
      buildColumnsFromProfile(result.profile),
    ]))
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to fetch series profile')
    status.value = 'error'
    console.error(err)
    series.columns = {}
    series.data = {}
  }
  finally {
    pendingOperations.value--
  }
}

let latestRequest = 0

type SeriesQuery = FetchTabularDataOptions & { pageSize: number }
type LoadedSeries = { rows: Array<Record<string, unknown>>, total: number | undefined, next: string | null, options: SeriesQuery }

async function hasGroupsBeyondPage({ rows, total, next, options }: LoadedSeries): Promise<boolean> {
  const known = groupsBeyondPage({ rowCount: rows.length, aggregated: !!options.aggregation, total, next })
  if (known !== 'probe') return known
  // The probe only adds the note: a failure leaves it out.
  return hasMoreGroups(config, options).catch(() => false)
}

async function fetchSeriesData() {
  const request = ++latestRequest
  const isStale = () => request !== latestRequest
  const requestedChart = props.chart
  pendingOperations.value++
  status.value = 'pending'
  error.value = null
  let loaded: Array<LoadedSeries> = []

  try {
    if (props.chart.series.length === 0 || !props.chart.x_axis.column_x) {
      hasData = true
      loadedChart.value = requestedChart
      status.value = 'success'
      series.data = {}
      resetNotes()
      return
    }

    const sortDirection = chartRequestSortDirection(props.chart)
    const fetchPromises = props.chart.series
      .map((serie, index) => ({ serie, index }))
      .filter(({ serie }) => {
        const xColumn = serie.column_x_name_override ?? props.chart.x_axis.column_x
        return xColumn && serie.resource_id && serie.column_y
      })
      .map(async ({ serie, index }) => {
        const xColumn = serie.column_x_name_override ?? props.chart.x_axis.column_x
        const options: SeriesQuery = {
          columns: serie.aggregate_y ? undefined : [xColumn, serie.column_y],
          resourceId: serie.resource_id,
          page: 1,
          pageSize: CHART_PAGE_SIZE,
          sort: { column: xColumn, direction: sortDirection },
          groupBy: xColumn,
          aggregation: serie.column_y && serie.aggregate_y
            ? {
                column: serie.column_y,
                type: serie.aggregate_y,
              }
            : undefined,
          filters: serie.filters ?? undefined,
        }
        const response = await fetchTabularData(config, options)
        return {
          key: String(index),
          rows: response.data,
          total: response.meta.total,
          next: response.links.next,
          options,
        }
      })

    const settled = await Promise.allSettled(fetchPromises)
    if (isStale()) return
    const results = settled.filter(r => r.status === 'fulfilled').map(r => r.value)
    const failures = settled.filter(r => r.status === 'rejected')
    if (results.length === 0 && failures.length > 0) throw failures[0]!.reason
    hasData = true
    loadedChart.value = requestedChart
    series.data = Object.fromEntries(results.map(result => [
      result.key,
      result.rows,
    ]))
    someSeriesFailed.value = failures.length > 0
    seriesFailureMessage.value = failures.length > 0 ? tabularErrorMessage(failures[0]!.reason, t) : null
    loaded = results
  }
  catch (err) {
    if (isStale()) return
    error.value = err instanceof Error ? err : new Error('Failed to fetch series data')
    status.value = 'error'
    series.data = {}
    resetNotes()
  }
  finally {
    pendingOperations.value--
  }

  // The truncation warning is only a note: the chart is shown without waiting for it.
  // The previous one stays until the new answer, so it does not blink.
  if (loaded.length === 0) return
  const more = await Promise.all(loaded.map(hasGroupsBeyondPage))
  if (isStale()) return
  moreGroups.value = more.some(Boolean)
}

function retry() {
  fetchSeriesProfile()
  fetchSeriesData()
}

// A string key: the computed array is new on every chart change, and the
// profile only depends on the resources.
watch(() => resourceIds.value.join(','), fetchSeriesProfile, { immediate: true })

watchDebounced([
  () => chartDataKey(props.chart),
], async () => {
  await fetchSeriesData()
}, { debounce: config.searchDebounce ?? 300, immediate: true })

watch(pendingOperations, (count) => {
  if (count === 0) {
    if (error.value === null && status.value === 'pending') {
      status.value = 'success'
    }
  }
})
</script>
