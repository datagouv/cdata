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

  <dl
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
  </dl>

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
                {{ formatPercentage(row['% too big']) }}
              </td>
              <td class="px-3 py-1 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatNumber(row['Prévisualisable']) }}
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import {
  RiArchiveLine,
  RiArrowDownSLine,
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
import DeltaIndicator from './DeltaIndicator.vue'
import type { PreviewDashboardFormatStat, TabularDataResponse } from '~/types/preview-dashboard'
import { computeFamilyStats, computeSummaryStats, formatMonth, getPreviousMonth } from '~/utils/previewDashboard'
import type { Component } from 'vue'

const props = defineProps<{
  resourceId: string
}>()

const route = useRoute()
const config = useRuntimeConfig()
const { t } = useTranslation()
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

const rows = computed<PreviewDashboardFormatStat[]>(() => [
  ...(currentResponse.value?.data ?? []),
  ...(previousResponse.value?.data ?? []),
])

const error = computed(() => currentError.value ?? previousError.value)
const pending = computed(() => currentPending.value || previousPending.value)

watch(error, (err) => {
  if (err) {
    console.error('[PreviewFormatStatsTable] fetch error:', err)
  }
})

const expandedFamilies = ref(new Set<string>())

const familyStats = computed(() => computeFamilyStats(
  rows.value,
  currentMonth.value,
  previousMonth.value,
))

const summaryStats = computed(() => computeSummaryStats(rows.value, currentMonth.value))

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
