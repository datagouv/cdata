<template>
  <div>
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
            {{ t('Seuls les formats représentant au moins 10 ressources sont affichés individuellement.') }}
          </li>
          <li>
            {{ t('Certains formats très proches ont été regroupés pour rendre l’analyse plus lisible.') }}
          </li>
        </ul>
      </Accordion>
    </AccordionGroup>

    <!-- !ps-0 on the dl and the dd: the DSFR indents both like list items
         (`dl, dd { padding-inline-start: var(--ul-start) }`), which would push
         the cards and their figures out of the page's left edge. -->
    <dl
      v-if="!pending && familyStats.length > 0"
      class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 !ps-0"
    >
      <div class="rounded-lg border border-gray-default bg-white px-4 py-5 sm:p-6">
        <dt class="text-sm font-normal text-gray-plain">
          {{ t('Nombre total de ressources analysées') }}
        </dt>
        <dd class="mt-1 text-2xl font-bold text-gray-title tabular-nums !ps-0">
          {{ formatNumber(summaryStats.total) }}
        </dd>
      </div>
      <div class="rounded-lg border border-gray-default bg-white px-4 py-5 sm:p-6">
        <dt class="text-sm font-normal text-gray-plain">
          {{ t('Ressources prévisualisables') }}
        </dt>
        <dd class="mt-1 text-2xl font-bold text-gray-title tabular-nums !ps-0">
          {{ formatPercentage(summaryStats.previewablePercentage) }}
          <span class="ml-2 text-sm font-medium text-gray-plain">
            ({{ formatNumber(summaryStats.previewableCount) }})
          </span>
        </dd>
      </div>
    </dl>

    <div class="mt-8 overflow-x-auto">
      <div
        v-if="pending"
        class="py-8 text-center"
      >
        <AnimatedLoader />
      </div>
      <SimpleBanner
        v-else-if="!config.public.tabularApiPreviewStatsId"
        type="warning"
        class="mt-2"
      >
        {{ t('Statistiques de prévisualisations non disponibles.') }}
      </SimpleBanner>
      <SimpleBanner
        v-else-if="error"
        type="warning"
        class="mt-2"
      >
        {{ t('Les statistiques n\'ont pas pu être chargées.') }}
      </SimpleBanner>
      <div
        v-else-if="familyStats.length === 0"
        class="flex flex-col items-center py-12"
      >
        <img
          src="/illustrations/chart.svg"
          class="h-20"
          alt=""
        >
        <p class="font-bold text-gray-title my-3">
          {{ t('Aucune statistique pour {month}', { month: currentMonthLabel }) }}
        </p>
        <p class="text-sm text-gray-plain">
          {{ t('Les statistiques de ce mois n’ont pas encore été publiées.') }}
        </p>
      </div>
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
              {{ t('% trop volumineux') }}
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
            class="border-t border-gray-default hover:bg-gray-lowest"
          >
            <td class="py-4 pr-3 pl-4 text-sm font-semibold text-gray-title border-r border-gray-default last:border-r-0 sm:pl-3">
              <button
                type="button"
                class="flex w-full items-center gap-2 text-left cursor-pointer"
                :aria-expanded="expandedFamilies.has(family.family)"
                :aria-controls="family.formats.map(row => `format-row-${row.__id}`).join(' ')"
                @click="toggleFamily(family.family)"
              >
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
              </button>
            </td>
            <td class="px-3 py-4 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
              <div>{{ formatNumber(family.count) }}</div>
              <DeltaIndicator
                :value="family.countDelta"
                unit="count"
              />
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
              <DeltaIndicator
                :value="family.previewDelta"
                unit="points"
              />
            </td>
          </tr>

          <tr
            v-for="row in family.formats"
            v-show="expandedFamilies.has(family.family)"
            :id="`format-row-${row.__id}`"
            :key="row.__id"
            class="border-t border-gray-default bg-gray-lowest-2"
          >
            <td class="py-1 pr-3 pl-11 text-sm font-medium whitespace-nowrap text-gray-title border-r border-gray-default last:border-r-0 sm:pl-10">
              <NuxtLink
                class="link"
                :to="{
                  path: '/admin/beta/preview-dashboard/fichiers',
                  query: { format: row['format normalisé'] },
                }"
              >
                {{ row['format normalisé'] }}
              </NuxtLink>
            </td>
            <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
              <div>{{ formatNumber(row.nombre) }}</div>
              <DeltaIndicator
                :value="row.countDelta"
                unit="count"
              />
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
              {{ formatPercentage(row['% trop volumineux']) }}
            </td>
            <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
              {{ formatNumber(row['prévisualisable']) }}
            </td>
            <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
              <PercentageMeter :value="row['% prévisualisable']" />
              <DeltaIndicator
                :value="row.previewDelta"
                unit="points"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  RiArchiveLine,
  RiArrowDownSLine,
  RiBracesLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiImageLine,
  RiLink,
  RiQuestionLine,
  RiTableLine,
} from '@remixicon/vue'
import { AnimatedLoader, SimpleBanner, useFormatDate, useFormatTabular } from '@datagouv/components-next'
import PercentageMeter from '~/components/PreviewDashboard/PercentageMeter.vue'
import DeltaIndicator from '~/components/PreviewDashboard/DeltaIndicator.vue'
import type { PreviewDashboardFormatStat, TabularDataResponse } from '~/types/preview-dashboard'
import { computeFamilyStats, formatMonth, getPreviousMonth } from '~/utils/previewDashboard'
import type { Component } from 'vue'

const config = useRuntimeConfig()
const { t } = useTranslation()
const { formatDate } = useFormatDate()
const { formatNumber } = useFormatTabular()

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

const imagePreviewSize = computed(() => {
  const mo = Math.round(config.public.maxImagePreviewByteSize / 1_000_000)
  return `${formatNumber(mo)} Mo`
})

const currentMonth = computed(() => formatMonth(new Date()))
const currentMonthLabel = computed(() => formatDate(new Date(), { dateStyle: undefined, year: 'numeric', month: 'long' }))
const previousMonth = computed(() => getPreviousMonth(currentMonth.value))

const PAGE_SIZE = 100

// Every figure on this page is aggregated client-side from the whole month, so
// a response cut off at one page would silently skew all of them: keep paging
// until the API has handed over as many rows as it announced.
async function fetchMonthRows(month: string): Promise<PreviewDashboardFormatStat[]> {
  if (!config.public.tabularApiPreviewStatsId) return []
  const base = `${config.public.tabularApiUrl}/api/resources/${config.public.tabularApiPreviewStatsId}/data/`
  const rows: PreviewDashboardFormatStat[] = []
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE), mois__exact: month })
    const response = await $fetch<TabularDataResponse<PreviewDashboardFormatStat>>(`${base}?${params.toString()}`)
    rows.push(...response.data)
    if (response.data.length === 0 || rows.length >= response.meta.total) return rows
  }
}

const { data: currentRows, error: currentError, pending: currentPending } = useAsyncData(
  `preview-dashboard-stats-${currentMonth.value}`,
  () => fetchMonthRows(currentMonth.value),
)
const { data: previousRows, error: previousError, pending: previousPending } = useAsyncData(
  `preview-dashboard-stats-${previousMonth.value}`,
  () => fetchMonthRows(previousMonth.value),
)

const rows = computed<PreviewDashboardFormatStat[]>(() => [
  ...(currentRows.value ?? []),
  ...(previousRows.value ?? []),
])

const error = computed(() => currentError.value ?? previousError.value)
const pending = computed(() => currentPending.value || previousPending.value)

watch(error, (err) => {
  if (err) {
    console.error('[preview-dashboard] fetch error:', err)
  }
})

const expandedFamilies = ref(new Set<string>())

const familyStats = computed(() => computeFamilyStats(
  rows.value,
  currentMonth.value,
  previousMonth.value,
))

const summaryStats = computed(() => {
  const total = familyStats.value.reduce((sum, family) => sum + family.count, 0)
  const previewableCount = familyStats.value.reduce((sum, family) => sum + family.withPreview, 0)
  return {
    total,
    previewableCount,
    previewablePercentage: total > 0 ? (previewableCount / total) * 100 : 0,
  }
})

function toggleFamily(family: string) {
  if (expandedFamilies.value.has(family)) {
    expandedFamilies.value.delete(family)
  }
  else {
    expandedFamilies.value.add(family)
  }
}

function getFamilyIcon(family: string): Component {
  switch (family.trim().toLowerCase()) {
    case 'données structurées':
      return RiBracesLine
    case 'tabulaire':
      return RiTableLine
    case 'api':
      return RiCodeSSlashLine
    case 'document':
      return RiFileTextLine
    case 'archive':
      return RiArchiveLine
    case 'image':
      return RiImageLine
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
