<template>
  <p class="mt-2 text-sm text-gray-plain">
    {{ t('Répartition des ressources par famille de format et par format, avec le taux de prévisualisation.') }}
  </p>

  <AccordionGroup class="mt-4">
    <Accordion :title="t('Méthodologie et limites')">
      <ul class="list-disc space-y-1 pl-5 text-sm text-gray-plain">
        <li>
          {{ t('JSON : prévisualisation limitée à environ {size} de contenu texte.', { size: jsonPreviewSize }) }}
        </li>
        <li>
          {{ t('PDF : prévisualisation limitée aux fichiers de {size} maximum.', { size: pdfPreviewSize }) }}
        </li>
        <li>
          {{ t('XML : prévisualisation limitée à environ {size} de contenu texte.', { size: xmlPreviewSize }) }}
        </li>
        <li>
          {{ t('Images : prévisualisation limitée aux fichiers de {size} maximum.', { size: imagePreviewSize }) }}
        </li>
        <li>
          {{ t('Seuls les formats représentant au moins 100 ressources sont affichés individuellement.') }}
        </li>
        <li>
          {{ t('Certains formats très proches ont été regroupés pour rendre l’analyse plus lisible.') }}
        </li>
      </ul>
    </Accordion>
  </AccordionGroup>

  <div
    v-if="!pending && summaryStats"
    class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
  >
    <div class="rounded-lg border border-gray-default bg-white px-4 py-5 sm:p-6">
      <dt class="text-sm font-normal text-gray-plain">
        {{ t('Nombre total de ressources analysées') }}
      </dt>
      <dd class="mt-1">
        <div class="text-2xl font-bold text-gray-title">
          {{ formatNumber(summaryStats.total) }}
        </div>
      </dd>
    </div>
    <div class="rounded-lg border border-gray-default bg-white px-4 py-5 sm:p-6">
      <dt class="text-sm font-normal text-gray-plain">
        {{ t('Ressources prévisualisables') }}
      </dt>
      <dd class="mt-1">
        <div class="text-2xl font-bold text-gray-title">
          {{ formatPercentage(summaryStats.previewablePercentage) }}
          <span class="ml-2 text-sm font-medium text-gray-plain">
            ({{ formatNumber(summaryStats.previewableCount) }})
          </span>
        </div>
      </dd>
    </div>
  </div>

  <div class="mt-8 flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div
          v-if="pending"
          class="py-8 text-center"
        >
          <AnimatedLoader />
        </div>
        <SimpleBanner
          v-else-if="error"
          type="warning"
          class="mt-2"
        >
          {{ t('Les statistiques n\'ont pas pu être chargées.') }}
        </SimpleBanner>
        <table
          v-else
          class="relative min-w-full"
        >
          <thead class="bg-white">
            <tr>
              <th
                scope="col"
                class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-title border-b border-r border-gray-default last:border-r-0 sm:pl-3"
              >
                {{ t('Famille / Format') }}
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-right text-sm font-semibold text-gray-title border-b border-r border-gray-default last:border-r-0"
              >
                {{ t('Nombre') }}
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-right text-sm font-semibold text-gray-title border-b border-r border-gray-default last:border-r-0"
              >
                {{ t('% catalogue') }}
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-right text-sm font-semibold text-gray-title border-b border-r border-gray-default last:border-r-0"
              >
                {{ t('% prévisualisation manquante') }}
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-right text-sm font-semibold text-gray-title border-b border-r border-gray-default last:border-r-0"
              >
                {{ t('% erreur') }}
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-right text-sm font-semibold text-gray-title border-b border-r border-gray-default last:border-r-0"
              >
                {{ t('% too big') }}
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-right text-sm font-semibold text-gray-title border-b border-r border-gray-default last:border-r-0"
              >
                {{ t('Prévisualisable') }}
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-right text-sm font-semibold text-gray-title border-b border-gray-default last:border-r-0"
              >
                {{ t('% prévisualisable') }}
              </th>
            </tr>
          </thead>
          <tbody
            v-for="family in familyStats"
            :key="family.family"
            class="bg-white"
          >
            <tr
              class="border-t border-gray-default cursor-pointer hover:bg-gray-lowest"
              @click="toggleFamily(family.family)"
            >
              <td class="py-4 pr-3 pl-4 text-sm font-semibold text-gray-title border-r border-gray-default last:border-r-0 sm:pl-3">
                <div class="flex items-center gap-2">
                  <RiArrowDownSLine
                    class="size-4 shrink-0 text-gray-low transition-transform"
                    :class="{ 'rotate-180': expandedFamilies.has(family.family) }"
                    aria-hidden="true"
                  />
                  <component
                    :is="getFamilyIcon(family.family)"
                    class="size-4 shrink-0 text-gray-low"
                    aria-hidden="true"
                  />
                  {{ family.family }}
                </div>
              </td>
              <td class="px-3 py-4 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                <div>{{ formatNumber(family.count) }}</div>
                <component :is="renderDelta(family.countDelta, 'count')" />
              </td>
              <td class="px-3 py-4 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatPercentage(family.percentageOfCatalog) }}
              </td>
              <td class="px-3 py-4 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatPercentage(family.percentageMissingPreview) }}
              </td>
              <td class="px-3 py-4 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatPercentage(family.percentageError) }}
              </td>
              <td class="px-3 py-4 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatPercentage(family.percentageTooBig) }}
              </td>
              <td class="px-3 py-4 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatNumber(family.withPreview) }}
              </td>
              <td class="px-3 py-4 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                <PercentageMeter :value="family.percentageWithPreview" />
                <component :is="renderDelta(family.previewDelta, 'points')" />
              </td>
            </tr>

            <tr
              v-for="row in family.formats"
              v-show="expandedFamilies.has(family.family)"
              :key="row.__id"
              class="border-t border-gray-default bg-gray-lowest-2"
            >
              <td class="py-1 pr-3 pl-11 text-sm font-medium whitespace-nowrap text-gray-title border-r border-gray-default last:border-r-0 sm:pl-10">
                <NuxtLink
                  class="link"
                  :to="{
                    query: {
                      ...route.query,
                      tab: 'fichiers',
                      format: row.Format,
                    },
                  }"
                >
                  {{ row.Format }}
                </NuxtLink>
              </td>
              <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                <div>{{ formatNumber(row.Nombre) }}</div>
                <component :is="renderDelta(row.countDelta, 'count')" />
              </td>
              <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatPercentage(row['% catalogue']) }}
              </td>
              <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatPercentage(row['% prévisualisation manquante']) }}
              </td>
              <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatPercentage(row['% erreur']) }}
              </td>
              <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatPercentage(row['% too big']) }}
              </td>
              <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatNumber(row['Prévisualisable']) }}
              </td>
              <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                <PercentageMeter :value="row['% prévisualisable']" />
                <component :is="renderDelta(row.previewDelta, 'points')" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useRoute } from '#imports'
import {
  RiArchiveLine,
  RiArrowDownLine,
  RiArrowDownSLine,
  RiArrowUpLine,
  RiBracesLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiImageLine,
  RiLink,
  RiMap2Line,
  RiQuestionLine,
  RiTableLine,
} from '@remixicon/vue'
import { AnimatedLoader, SimpleBanner, useFormatTabular } from '@datagouv/components-next'
import PercentageMeter from './PercentageMeter.vue'
import type { PreviewDashboardFormatStat, TabularDataResponse } from '~/types/preview-dashboard'
import type { Component } from 'vue'

function formatDelta(value: number, unit: 'count' | 'points'): string {
  const sign = value > 0 ? '+' : ''
  const formatted = unit === 'points' ? `${Math.abs(value).toFixed(1)}%` : `${Math.abs(Math.round(value))}`
  return `${sign}${formatted}`
}

function renderDelta(value: number | undefined, unit: 'count' | 'points') {
  if (value == null) return null
  const isPositive = value > 0
  const colorClass = isPositive ? 'text-green-700' : 'text-red-700'
  const Icon = isPositive ? RiArrowUpLine : RiArrowDownLine
  return h('span', { class: `inline-flex items-center gap-1 text-xs font-medium ${colorClass}` }, [
    h(Icon, { 'class': 'size-3', 'aria-hidden': 'true' }),
    formatDelta(value, unit),
  ])
}

const props = defineProps<{
  resourceId: string
}>()

const route = useRoute()
const config = useRuntimeConfig()
const { t } = useTranslation()
const { formatNumber } = useFormatTabular()

function formatMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  const date = new Date(year, monthNum - 1, 1)
  date.setMonth(date.getMonth() - 1)
  return formatMonth(date)
}

const jsonPreviewSize = computed(() => {
  const mo = Math.round(config.public.maxJsonPreviewCharSize / 1_000_000)
  return `${formatNumber(mo)} Mo`
})

const pdfPreviewSize = computed(() => {
  const mo = Math.round(config.public.maxPdfPreviewByteSize / 1_000_000)
  return `${formatNumber(mo)} Mo`
})

const xmlPreviewSize = computed(() => {
  const ko = Math.round(config.public.maxXmlPreviewCharSize / 1_000)
  return `${formatNumber(ko)} Ko`
})

const imagePreviewSize = computed(() => `${formatNumber(10)} Mo`)

const currentMonth = computed(() => formatMonth(new Date()))
const previousMonth = computed(() => getPreviousMonth(currentMonth.value))

const currentMonthUrl = computed(() => {
  const base = `${config.public.tabularApiUrl}/api/resources/${props.resourceId}/data/`
  const params = new URLSearchParams({ page: '1', page_size: '100', Mois__exact: currentMonth.value })
  return `${base}?${params.toString()}`
})

const previousMonthUrl = computed(() => {
  const base = `${config.public.tabularApiUrl}/api/resources/${props.resourceId}/data/`
  const params = new URLSearchParams({ page: '1', page_size: '100', Mois__exact: previousMonth.value })
  return `${base}?${params.toString()}`
})

const { data: currentResponse, error: currentError, pending: currentPending } = useFetch<TabularDataResponse<PreviewDashboardFormatStat>>(currentMonthUrl)
const { data: previousResponse, error: previousError, pending: previousPending } = useFetch<TabularDataResponse<PreviewDashboardFormatStat>>(previousMonthUrl)

const response = computed(() => ({
  data: [
    ...(currentResponse.value?.data ?? []),
    ...(previousResponse.value?.data ?? []),
  ],
  meta: {
    total: (currentResponse.value?.meta.total ?? 0) + (previousResponse.value?.meta.total ?? 0),
  },
}))

const error = computed(() => currentError.value ?? previousError.value)
const pending = computed(() => currentPending.value || previousPending.value)

watch(error, (err) => {
  if (err) {
    console.error('[PreviewFormatStatsTable] fetch error:', err)
  }
})

watch(response, (resp) => {
  if (resp) {
    console.log('[PreviewFormatStatsTable] response:', resp)
  }
})

interface FamilyStats {
  family: string
  count: number
  countDelta?: number
  withPreview: number
  previewDelta?: number
  percentageOfCatalog: number
  percentageMissingPreview: number
  percentageError: number
  percentageTooBig: number
  percentageWithPreview: number
  month: string
  formats: Array<PreviewDashboardFormatStat & { countDelta?: number, previewDelta?: number }>
}

const expandedFamilies = ref(new Set<string>())

const familyStats = computed<FamilyStats[]>(() => {
  const rows = response.value?.data ?? []
  const currentMonthValue = currentMonth.value || '-'
  const previousMonthValue = previousMonth.value || undefined
  const totalCount = rows
    .filter(row => row.Mois === currentMonthValue)
    .reduce((sum, row) => sum + row.Nombre, 0)

  const byFamily = new Map<string, PreviewDashboardFormatStat[]>()
  for (const row of rows) {
    if (row.Mois !== currentMonthValue) continue
    const family = row['Famille de format']
    if (!byFamily.has(family)) {
      byFamily.set(family, [])
    }
    byFamily.get(family)!.push(row)
  }

  const previousFamilyMap = new Map<string, PreviewDashboardFormatStat>()
  const previousFormatMap = new Map<string, PreviewDashboardFormatStat>()
  if (previousMonthValue) {
    for (const row of rows) {
      if (row.Mois !== previousMonthValue) continue
      const family = row['Famille de format']
      if (!previousFamilyMap.has(family)) {
        previousFamilyMap.set(family, { ...row })
      }
      else {
        const existing = previousFamilyMap.get(family)!
        existing.Nombre += row.Nombre
        existing['Prévisualisable'] += row['Prévisualisable']
      }
      previousFormatMap.set(`${family}|${row.Format}`, row)
    }
  }

  return Array.from(byFamily.entries())
    .map(([family, formats]) => {
      const count = formats.reduce((sum, row) => sum + row.Nombre, 0)
      const withPreview = formats.reduce((sum, row) => sum + row['Prévisualisable'], 0)
      const percentageOfCatalog = totalCount > 0 ? (count / totalCount) * 100 : 0
      const weightedMissingPreviewSum = formats.reduce((sum, row) => sum + ((row['% prévisualisation manquante'] ?? 0) * row.Nombre), 0)
      const percentageMissingPreview = count > 0 ? weightedMissingPreviewSum / count : 0
      const weightedErrorSum = formats.reduce((sum, row) => sum + ((row['% erreur'] ?? 0) * row.Nombre), 0)
      const percentageError = count > 0 ? weightedErrorSum / count : 0
      const weightedTooBigSum = formats.reduce((sum, row) => sum + ((row['% too big'] ?? 0) * row.Nombre), 0)
      const percentageTooBig = count > 0 ? weightedTooBigSum / count : 0
      const percentageWithPreview = count > 0 ? (withPreview / count) * 100 : 0
      const month = formats[0]?.Mois ?? '-'

      const previousFamily = previousFamilyMap.get(family)
      const previousCount = previousFamily?.Nombre
      const previousWithPreview = previousFamily?.['Prévisualisable']
      const countDelta = previousCount != null ? count - previousCount : undefined
      const previewDelta = previousCount != null && previousCount > 0
        ? ((withPreview / count) - (previousWithPreview! / previousCount)) * 100
        : undefined

      const formatsWithDelta = formats.map((row) => {
        const previousRow = previousFormatMap.get(`${family}|${row.Format}`)
        const rowCountDelta = previousRow != null ? row.Nombre - previousRow.Nombre : undefined
        const rowPreviewDelta = previousRow != null
          ? row['% prévisualisable'] - previousRow['% prévisualisable']
          : undefined
        return { ...row, countDelta: rowCountDelta, previewDelta: rowPreviewDelta }
      })

      return {
        family,
        count,
        countDelta,
        withPreview,
        previewDelta,
        percentageOfCatalog,
        percentageMissingPreview,
        percentageError,
        percentageTooBig,
        percentageWithPreview,
        month,
        formats: formatsWithDelta,
      }
    })
    .sort((a, b) => b.count - a.count)
})

const summaryStats = computed(() => {
  const rows = response.value?.data ?? []
  if (rows.length === 0) return null
  const total = rows.reduce((sum, row) => sum + row.Nombre, 0)
  const previewableCount = rows.reduce((sum, row) => sum + row['Prévisualisable'], 0)
  const previewablePercentage = total > 0 ? (previewableCount / total) * 100 : 0
  return { total, previewableCount, previewablePercentage }
})

function toggleFamily(family: string) {
  const next = new Set(expandedFamilies.value)
  if (next.has(family)) {
    next.delete(family)
  }
  else {
    next.add(family)
  }
  expandedFamilies.value = next
}

function getFamilyIcon(family: string): Component {
  switch (family.trim().toLowerCase()) {
    case 'données structurées':
      return RiBracesLine
    case 'tableur':
      return RiTableLine
    case 'api':
      return RiCodeSSlashLine
    case 'document':
      return RiFileTextLine
    case 'archive':
      return RiArchiveLine
    case 'géospatial':
      return RiMap2Line
    case 'image':
    case 'images':
      return RiImageLine
    case 'lien':
    case 'liens':
      return RiLink
    default:
      return RiQuestionLine
  }
}

function formatPercentage(value: number | undefined | null): string {
  const num = Number(value ?? 0)
  return `${num.toFixed(1)}%`
}
</script>
