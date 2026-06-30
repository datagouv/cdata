<template>
  <p class="mt-2 text-sm text-gray-plain">
    {{ t('Répartition des ressources par famille de format et par format, avec le taux de prévisualisation.') }}
  </p>

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
                {{ t('Prévisualisable') }}
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
              <td class="py-3 pr-3 pl-4 text-sm font-semibold text-gray-title border-r border-gray-default last:border-r-0 sm:pl-3">
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
              <td class="px-3 py-3 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatNumber(family.count) }}
              </td>
              <td class="px-3 py-3 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatNumber(family.withPreview) }}
              </td>
              <td class="px-3 py-3 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatPercentage(family.percentageOfCatalog) }}
              </td>
              <td class="px-3 py-3 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatPercentage(family.percentageError) }}
              </td>
              <td class="px-3 py-3 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                {{ formatPercentage(family.percentageTooBig) }}
              </td>
              <td class="px-3 py-3 text-right text-sm text-gray-title border-r border-gray-default last:border-r-0">
                <PercentageMeter :value="family.percentageWithPreview" />
              </td>
            </tr>
            <tr
              v-for="row in family.formats"
              v-show="expandedFamilies.has(family.family)"
              :key="row.__id"
              class="border-t border-gray-default"
            >
              <td class="py-4 pr-3 pl-11 text-sm font-medium whitespace-nowrap text-gray-title border-r border-gray-default last:border-r-0 sm:pl-10">
                {{ row.Format }}
              </td>
              <td class="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatNumber(row.Nombre) }}
              </td>
              <td class="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatNumber(row['Prévisualisable']) }}
              </td>
              <td class="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatPercentage(row['% catalogue']) }}
              </td>
              <td class="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatPercentage(row['% erreur']) }}
              </td>
              <td class="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                {{ formatPercentage(row['% too big']) }}
              </td>
              <td class="px-3 py-4 text-right text-sm whitespace-nowrap text-gray-plain border-r border-gray-default last:border-r-0">
                <PercentageMeter :value="row['% prévisualisable']" />
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
import type { PreviewDashboardFormatStat, TabularDataResponse } from '~/types/preview-dashboard'
import type { Component } from 'vue'

const props = defineProps<{
  resourceId: string
}>()

const config = useRuntimeConfig()
const { t } = useTranslation()
const { formatNumber } = useFormatTabular()

const dataUrl = computed(() => {
  const base = `${config.public.tabularApiUrl}/api/resources/${props.resourceId}/data/`
  const params = new URLSearchParams({ page: '1', page_size: '101' })
  return `${base}?${params.toString()}`
})

const { data: response, error, pending } = useFetch<TabularDataResponse<PreviewDashboardFormatStat>>(dataUrl)

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
  withPreview: number
  percentageOfCatalog: number
  percentageError: number
  percentageTooBig: number
  percentageWithPreview: number
  month: string
  formats: PreviewDashboardFormatStat[]
}

const expandedFamilies = ref(new Set<string>())

const familyStats = computed<FamilyStats[]>(() => {
  const rows = response.value?.data ?? []
  const totalCount = rows.reduce((sum, row) => sum + row.Nombre, 0)
  const byFamily = new Map<string, PreviewDashboardFormatStat[]>()

  for (const row of rows) {
    const family = row['Famille de format']
    if (!byFamily.has(family)) {
      byFamily.set(family, [])
    }
    byFamily.get(family)!.push(row)
  }

  return Array.from(byFamily.entries())
    .map(([family, formats]) => {
      const count = formats.reduce((sum, row) => sum + row.Nombre, 0)
      const withPreview = formats.reduce((sum, row) => sum + row['Prévisualisable'], 0)
      const percentageOfCatalog = totalCount > 0 ? (count / totalCount) * 100 : 0
      const weightedErrorSum = formats.reduce((sum, row) => sum + ((row['% erreur'] ?? 0) * row.Nombre), 0)
      const percentageError = count > 0 ? weightedErrorSum / count : 0
      const weightedTooBigSum = formats.reduce((sum, row) => sum + ((row['% too big'] ?? 0) * row.Nombre), 0)
      const percentageTooBig = count > 0 ? weightedTooBigSum / count : 0
      const percentageWithPreview = count > 0 ? (withPreview / count) * 100 : 0
      const month = formats[0]?.Mois ?? '-'
      return { family, count, withPreview, percentageOfCatalog, percentageError, percentageTooBig, percentageWithPreview, month, formats }
    })
    .sort((a, b) => b.count - a.count)
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
