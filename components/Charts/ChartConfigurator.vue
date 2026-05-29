<template>
  <form
    id="chart-form"
    class="block"
    @submit.prevent="saveChart"
  >
    <div class="grid lg:grid-cols-12 gap-4">
      <div class="col-span-7 space-y-4 py-4 px-6 rounded-lg bg-white border border-new-gray-light">
        <template v-if="selectedResource">
          <div>
            <label
              for="chart-title"
              class="font-bold fr-label"
            >{{ $t('Titre') }}</label>
            <input
              id="chart-title"
              v-model="form.title"
              type="text"
              class="w-full fr-input"
            >
          </div>

          <div>
            <label
              for="chart-description"
              class="font-bold fr-label"
            >{{ $t('Description') }}</label>
            <textarea
              id="chart-description"
              v-model="form.description"
              class="w-full fr-input"
              rows="2"
            />
          </div>
          <div>
            <div class="mt-8 pt-4 border-t border-new-gray-light">
              <h3 class="font-medium text-lg text-new-gray-dark mb-0">
                {{ form.title || $t('Sans titre') }}
              </h3>
              <p
                v-if="form.description"
                class="text-new-gray-medium mt-4 mb-0"
              >
                {{ form.description }}
              </p>
            </div>
            <div>
              <ClientOnly>
                <ChartViewerWrapper
                  :chart="chartForViewer"
                  @columns="columns = $event"
                />
              </ClientOnly>
            </div>
            <div
              v-if="sourceText"
              class="text-sm text-new-gray-medium"
            >
              {{ $t('Source') }}: {{ sourceText }}
            </div>
          </div>
        </template>
        <div
          v-else
          class="flex flex-col items-center justify-center h-full py-24"
        >
          <p class="text-new-gray-dark font-medium mb-0">
            {{ $t('Aucune source sélectionnée') }}
          </p>
          <p class="text-new-gray-medium text-sm mt-1.5 text-center">
            {{ $t('Choisissez un jeu de données depuis le panneau de configuration pour commencer à visualiser.') }}
          </p>
        </div>
      </div>

      <div class="col-span-5 space-y-6 lg:ml-4 py-4 px-6 rounded-lg bg-white border border-new-gray-light">
        <fieldset
          v-if="isAdmin"
          class="min-w-0 space-y-4"
        >
          <label
            for="existing-charts"
            class="mb-2 font-bold"
          >
            {{ $t('Graphiques existants') }}
          </label>
          <div class="flex gap-2">
            <select
              id="existing-charts"
              v-model="selectedChartId"
              class="flex-1 fr-select"
            >
              <option
                value=""
                disabled
              >
                {{ $t('Sélectionnez un graphique') }}
              </option>
              <option
                v-for="column in charts?.data"
                :key="column.id"
                :value="column.id"
              >
                {{ column.title }}
              </option>
            </select>
            <button
              class="fr-btn"
              type="button"
              :disabled="!selectedChartId"
              @click="loadSelectedChart"
            >
              {{ $t('Charger') }}
            </button>
          </div>
        </fieldset>
        <fieldset class="min-w-0">
          <ProducerSelect
            v-model="producer"
            :label="$t('Avec qui souhaitez-vous publier ?')"
            :required="true"
            all
          />
        </fieldset>
        <fieldset
          v-if="producer"
          class="min-w-0"
        >
          <p class="mb-2 font-bold">
            {{ $t('Source de données') }}
          </p>
          <SearchableSelect
            v-model="dataset"
            :label="$t('Jeu de données')"
            :placeholder="$t('Recherchez un jeu de données...')"
            :display-value="(option: DatasetSuggest) => option.title"
            :get-option-id="(option: DatasetSuggest) => option.id"
            :multiple="false"
            :suggest="suggestDataset"
            class="mb-4"
          />
          <div v-if="dataset">
            <label
              for="resource-select"
              class="fr-label"
            >{{ $t('Choix de la ressource') }}</label>
            <select
              id="resource-select"
              v-model="selectedResource"
              class="w-full fr-select"
            >
              <option
                value=""
                disabled
              >
                {{ $t('Sélectionnez une ressource') }}
              </option>
              <option
                v-for="resource in resources"
                :key="resource.id"
                :value="resource.id"
              >
                {{ resource.title }}
              </option>
            </select>
          </div>
        </fieldset>
        <template v-if="selectedResource">
          <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
            <p class="font-bold mb-2">
              {{ $t('Filtres') }}
            </p>
            <div class="space-y-3">
              <ChartFilterRow
                v-for="(filter, index) in filterList"
                :key="index"
                :model-value="filter"
                :index="index"
                :column-options="columnDetails"
                :condition-options="conditionOptions"
                @update:model-value="updateFilter(index, $event)"
                @remove="removeFilter(index)"
              />
            </div>
            <BrandedButton
              size="sm"
              color="tertiary"
              :icon="RiAddLine"
              @click="addFilter"
            >
              {{ $t('Ajouter un filtre') }}
            </BrandedButton>
          </fieldset>

          <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
            <label
              for="chart-type"
              class="fr-label font-bold"
            >
              {{ $t('Type de graphique') }}
            </label>
            <div>
              <Listbox
                id="chart-type"
                v-model="chartTypeProxy"
                class="w-full"
                :options="chartTypeOptions"
                :display-value="(opt) => opt?.label || ''"
                :get-option-id="(opt) => opt?.value"
              >
                <template #button>
                  <div class="w-full flex items-center gap-2">
                    <component
                      :is="chartTypeProxy?.icon"
                      class="size-4"
                    />
                    <span>{{ chartTypeProxy?.label }}</span>
                  </div>
                </template>
                <template #option="{ option }">
                  <component
                    :is="option.icon"
                    class="size-4"
                  />
                  {{ option.label }}
                </template>
              </Listbox>
            </div>
          </fieldset>
          <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
            <p class="font-bold mb-2">
              {{ $t('Axe X') }}
            </p>
            <div>
              <SearchableSelect
                id="x-axis-column"
                v-model="xAxisColumnProxy"
                :label="$t('Choisir quoi afficher')"
                :placeholder="$t('Rechercher une colonne...')"
                :options="xAxisColumnOptions"
                :display-value="(opt: {name: string, colType: ColumnType, resourceId: string}) => opt.name"
                :get-option-id="(opt: {name: string, colType: ColumnType, resourceId: string}) => opt.name"
                :group-by="(opt: {name: string, colType: ColumnType, resourceId: string}) => typeConfig[opt.colType]?.label || opt.colType"
                :multiple="false"
                class="w-full"
              >
                <template #option="{ option }">
                  <component
                    :is="getColumnTypeIcon(option.colType)"
                    class="inline w-4 h-4 mr-2"
                  />
                  {{ option.name }}
                </template>
              </SearchableSelect>
            </div>
            <div>
              <label
                for="x-axis-type"
                class="fr-label"
              >{{ $t('Type') }}</label>
              <select
                id="x-axis-type"
                v-model="form.x_axis.type"
                class="w-full fr-select"
              >
                <option value="discrete">
                  {{ $t('Discret (catégories)') }}
                </option>
                <option value="continuous">
                  {{ $t('Continu (valeurs)') }}
                </option>
              </select>
            </div>
            <div class="min-w-0">
              <label
                for="x-axis-sort-combined"
                class="fr-label"
              >{{ $t('Trier par') }}</label>
              <Listbox
                id="x-axis-sort-combined"
                v-model="sortProxy"
                class="w-full"
                :options="sortOptions"
                :display-value="(opt) => opt ? `${opt.column}${opt.column ? ' - ' : ''}${opt.label}` : $t('Sélectionnez une option')"
                :get-option-id="(opt) => opt.value"
              >
                <template #button>
                  <div class="w-full flex items-center justify-between gap-2 min-w-0">
                    <div
                      class="truncate"
                      :class="{ 'text-new-disabled-text': !sortProxy }"
                    >
                      {{ sortProxy ? `${sortProxy.column}${sortProxy.column ? ' - ' : ''}${sortProxy.label}` : $t('Sélectionnez une option') }}
                    </div>
                    <RiArrowDownSLine class="flex-none size-4 justify-self-end" />
                  </div>
                </template>
                <template #option="{ option }">
                  <div class="w-full flex items-center justify-between gap-2">
                    <span class="truncate">{{ option.column }}{{ option.column ? ' - ' : '' }}{{ option.label }}</span>
                    <component
                      :is="option.icon"
                      v-if="option.icon"
                      class="size-4 text-new-gray-medium"
                    />
                  </div>
                </template>
              </Listbox>
            </div>
          </fieldset>

          <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
            <p class="font-bold mb-2">
              {{ $t('Axe Y') }}
            </p>
            <div
              v-for="(serie, index) in form.series"
              :key="index"
              class="space-y-4"
            >
              <div>
                <SearchableSelect
                  :id="`column-y-${index}`"
                  :model-value="getSerieColumnYValue(serie)"
                  :label="$t('Colonne Y')"
                  :placeholder="$t('Rechercher une colonne...')"
                  :options="yAxisColumnOptions"
                  :display-value="(opt: {name: string, colType: ColumnType}) => opt.name"
                  :get-option-id="(opt: {name: string, colType: ColumnType}) => opt.name"
                  :group-by="(opt: {name: string, colType: ColumnType}) => typeConfig[opt.colType]?.label || opt.colType"
                  :multiple="false"
                  class="w-full"
                  @update:model-value="(val) => serie.column_y = val?.name ?? ''"
                >
                  <template #option="{ option }">
                    <component
                      :is="getColumnTypeIcon(option.colType)"
                      class="inline w-4 h-4 mr-2"
                    />
                    {{ option.name }}
                  </template>
                </SearchableSelect>
              </div>

              <div>
                <label
                  :for="`aggregate-y-${index}`"
                  class="fr-label"
                >{{ $t('Agrégation')
                }}</label>
                <select
                  :id="`aggregate-y-${index}`"
                  v-model="serie.aggregate_y"
                  class="w-full fr-select"
                >
                  <option :value="null">
                    {{ $t('Non') }}
                  </option>
                  <option value="sum">
                    {{ $t('Somme') }}
                  </option>
                  <option value="avg">
                    {{ $t('Moyenne') }}
                  </option>
                  <option value="min">
                    {{ $t('Minimum') }}
                  </option>
                  <option value="max">
                    {{ $t('Maximum') }}
                  </option>
                  <option value="median">
                    {{ $t('Médiane') }}
                  </option>
                </select>
              </div>
            </div>
            <AccordionGroup>
              <Accordion title="Styles">
                <div class="space-y-4">
                  <div>
                    <label
                      for="y-axis-label"
                      class="fr-label"
                    >{{ $t('Label') }}</label>
                    <input
                      id="y-axis-label"
                      v-model="form.y_axis.label"
                      type="text"
                      class="w-full fr-input"
                    >
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        for="y-axis-min"
                        class="fr-label"
                      >{{ $t('Min') }}</label>
                      <input
                        id="y-axis-min"
                        v-model.number="form.y_axis.min"
                        type="number"
                        class="w-full fr-input"
                      >
                    </div>
                    <div>
                      <label
                        for="y-axis-max"
                        class="fr-label"
                      >{{ $t('Max') }}</label>
                      <input
                        id="y-axis-max"
                        v-model.number="form.y_axis.max"
                        type="number"
                        class="w-full fr-input"
                      >
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        for="y-axis-unit"
                        class="fr-label"
                      >{{ $t('Unité') }}</label>
                      <input
                        id="y-axis-unit"
                        v-model="form.y_axis.unit"
                        type="text"
                        class="w-full fr-input"
                        :placeholder="$t('ex: €, %, kg')"
                      >
                    </div>
                    <div>
                      <label
                        for="y-axis-unit-position"
                        class="fr-label"
                      >{{ $t('Position unité')
                      }}</label>
                      <select
                        id="y-axis-unit-position"
                        v-model="form.y_axis.unit_position"
                        class="w-full fr-select"
                      >
                        <option value="suffix">
                          {{ $t('Suffixe') }}
                        </option>
                        <option value="prefix">
                          {{ $t('Préfixe') }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </Accordion>
            </AccordionGroup>
          </fieldset>

          <div
            v-if="isAdmin"
            class="min-w-0 space-y-4"
          >
            <BrandedButton type="submit">
              {{ $t('Sauvegarder le graphique') }}
            </BrandedButton>
          </div>
        </template>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Resource, PaginatedArray, ChartForm, Chart, Filter, AndFilters, GenericFilter, Owned, ColumnType, DataSeriesType, DataSeriesForm, FilterCondition } from '@datagouv/components-next'
import { resolveColumnType, buildTypeConfig, useGetProfile, useHasTabularData, toast, BrandedButton, toChartApi, toChartForm, SearchableSelect, Listbox, useTranslation } from '@datagouv/components-next'
import type { Component } from 'vue'
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { RiAddLine, RiArrowDownLine, RiArrowDownSLine, RiArrowUpLine, RiBarChartLine, RiLineChartLine, RiText } from '@remixicon/vue'
import { useAPI } from '~/utils/api'
import { isMeAdmin } from '~/utils/auth'
import ChartFilterRow from './ChartFilterRow.vue'
import ProducerSelect from '../ProducerSelect.vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import type { DatasetSuggest } from '~/types/types'

type CombinedSort = '' | 'axis_x-asc' | 'axis_x-desc' | 'axis_y-asc' | 'axis_y-desc'

type SortOption = {
  value: CombinedSort
  column: string
  direction: 'asc' | 'desc' | ''
  label: string
  icon: Component | null
}

const { $api } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const { t } = useTranslation()
const hasTabularData = useHasTabularData()
const getProfile = useGetProfile()
const isAdmin = isMeAdmin()
const { data: charts, refresh } = await useAPI<PaginatedArray<Chart>>('/api/1/visualizations/', { lazy: true })

const $chartsApi = $fetch.create({
  baseURL: runtimeConfig.public.chartsApiBase as string,
  onRequest({ options }) {
    options.headers.set('Content-Type', 'application/json')
    options.headers.set('Accept', 'application/json')
  },
})

const typeConfig = buildTypeConfig(t)
const ChartViewerWrapper = defineAsyncComponent(() => import('@datagouv/components-next').then(m => m.ChartViewerWrapper))

const form = defineModel<ChartForm>({
  required: true,
})

const resourceProfiles = ref<Record<string, { profile: { categorical: string[] }, columns: Record<string, { python_type: string, format?: string }> }>>({})
const columns = ref<Record<string, Array<{ name: string, type: ColumnType }>>>({})
const producer = ref<Owned | null>(null)
const dataset = ref<DatasetSuggest | null>(null)
const savedResources = reactive<Record<string, Resource>>({})
const selectedResource = ref<string | null>(null)
const savedChart = ref<Chart | null>(null)
const selectedChartId = ref('')

const chartForViewer = ref(toChartApi(form.value))

const chartTypeOptions = [
  { value: 'line', label: t('Ligne'), icon: RiLineChartLine },
  { value: 'histogram', label: t('Histogramme'), icon: RiBarChartLine },
]

const conditionOptions = ['exact', 'differs', 'is_null', 'is_not_null', 'greater', 'less', 'strictly_greater', 'strictly_less'] satisfies Array<FilterCondition>

const resources = computed(() => Object.values(savedResources))

const sourceText = computed<string>(() => {
  if (!dataset.value) return ''
  const orgName = producer.value?.organization?.name || ''
  return `${dataset.value.title}${orgName ? ` - ${orgName}` : ''} - datagouv.fr`
})

const chartTypeProxy = computed<{ value: string, label: string, icon: Component } | null>({
  get: () => chartTypeOptions.find(o => o.value === form.value.chart_type) ?? null,
  set: (val: { value: string, label: string, icon: Component } | null) => {
    if (val) {
      form.value.chart_type = val.value as DataSeriesType
    }
  },
})

const xAxisColumnProxy = computed<{ name: string, colType: ColumnType, resourceId: string } | null>({
  get: () => {
    const colName = form.value.x_axis.column_x
    if (!colName) return null
    return xAxisColumnOptions.value.find(opt => opt.name === colName) ?? null
  },
  set: (val: { name: string, colType: ColumnType, resourceId: string } | null) => {
    form.value.x_axis.column_x = val?.name ?? ''
  },
})

const xAxisColumnOptions = computed<Array<{ name: string, colType: ColumnType, resourceId: string }>>(() => {
  const result: Array<{ name: string, colType: ColumnType, resourceId: string }> = []
  for (const [resourceId, cols] of Object.entries(columns.value)) {
    for (const col of cols) {
      result.push({ name: col.name, colType: col.type, resourceId })
    }
  }
  return result
})

const yAxisColumnOptions = computed<Array<{ name: string, colType: ColumnType }>>(() => {
  const result: Array<{ name: string, colType: ColumnType }> = []
  if (selectedResource.value && columns.value[selectedResource.value]) {
    for (const col of columns.value[selectedResource.value]) {
      if (col.type !== 'date') {
        result.push({ name: col.name, colType: col.type })
      }
    }
  }
  return result
})

const sortOptions = computed<SortOption[]>(() => {
  const xAxisColumn = form.value.x_axis.column_x
  const yAxisColumn = form.value.series[0]?.column_y
  return [
    { value: '', column: '', direction: '', label: t('Aucun'), icon: null },
    { value: 'axis_x-asc', column: xAxisColumn || t('Axe X'), direction: 'asc', label: t('Ascendant'), icon: RiArrowUpLine },
    { value: 'axis_x-desc', column: xAxisColumn || t('Axe X'), direction: 'desc', label: t('Descendant'), icon: RiArrowDownLine },
    { value: 'axis_y-asc', column: yAxisColumn || t('Axe Y'), direction: 'asc', label: t('Ascendant'), icon: RiArrowUpLine },
    { value: 'axis_y-desc', column: yAxisColumn || t('Axe Y'), direction: 'desc', label: t('Descendant'), icon: RiArrowDownLine },
  ]
})

const sortProxy = computed<SortOption | null>({
  get: () => sortOptions.value.find(o => o.value === form.value.x_axis.sort_combined) ?? null,
  set: (val: SortOption | null) => {
    if (val) {
      form.value.x_axis.sort_combined = val.value
    }
  },
})

const columnDetails = computed<Array<{ key: string, value: string, disabled: boolean }>>(() => {
  const options: Array<{ key: string, value: string, disabled: boolean }> = [{ key: '', value: t('Colonne'), disabled: true }]
  const resourceColumns = columns.value[selectedResource.value ?? '']

  if (resourceColumns) {
    options.push(...resourceColumns.map(c => ({ key: c.name, value: c.name, disabled: false })))
  }

  return options
})

function isFilter(f: GenericFilter | null): f is Filter {
  return f?._cls === 'Filter'
}

function isAndFilters(f: GenericFilter | null): f is AndFilters {
  return f?._cls === 'AndFilters'
}

const filterList = computed<Array<Filter>>(() => {
  if (!form.value.filter) return []

  const filter = form.value.filter
  if (isFilter(filter)) {
    return [filter]
  }
  else if (isAndFilters(filter)) {
    const result: Array<Filter> = []
    for (const f of filter.filters) {
      if (isFilter(f)) {
        result.push(f)
      }
    }
    return result
  }
  return []
})

function getColumnTypeIcon(colType: ColumnType): Component {
  return typeConfig[colType]?.icon ?? RiText
}

function getSerieColumnYValue(serie: DataSeriesForm): { name: string, colType: ColumnType } | null {
  const colName = serie.column_y
  if (!colName) return null
  return yAxisColumnOptions.value.find(opt => opt.name === colName) ?? null
}

async function loadMissingResourcesForChart(resourceIds: Set<string>) {
  for (const id of resourceIds) {
    if (savedResources[id]) continue

    try {
      const resource = await $chartsApi<{ resource: Resource, dataset_id: string }>(`/api/2/datasets/resources/${id}/`)
      savedResources[id] = resource.resource
    }
    catch (error) {
      console.error(`Failed to fetch resource ${id}:`, error)
    }
  }
}

async function suggestDataset(q: string): Promise<Array<DatasetSuggest>> {
  const query: Record<string, string> = { q, size: '5' }

  if (!isAdmin && producer.value?.organization?.id) {
    query.organization = producer.value.organization.id
  }

  return await $chartsApi<Array<DatasetSuggest>>('/api/1/datasets/suggest/', {
    query,
  })
}

async function loadChart(id: string) {
  try {
    const data = await $api<Chart>(`/api/1/visualizations/${id}/`)
    if (data) {
      savedChart.value = data

      const chartResources = new Set<string>()
      for (const serie of data.series) {
        if (serie.resource_id) {
          chartResources.add(serie.resource_id)
        }
      }

      form.value = toChartForm(data)

      await loadMissingResourcesForChart(chartResources)

      toast.success(t('Graphique chargé !'))
    }
  }
  catch (error) {
    console.error('Failed to load chart:', error)
    toast.error(t('Erreur lors du chargement du graphique'))
  }
}

function loadSelectedChart() {
  if (selectedChartId.value) {
    loadChart(selectedChartId.value)
  }
}

async function saveChart() {
  try {
    const chartForApi = toChartApi(form.value)
    const update = savedChart.value?.id
    if (update) {
      savedChart.value = await $api<Chart>(`/api/1/visualizations/${savedChart.value!.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(chartForApi),
      })
    }
    else {
      savedChart.value = await $api<Chart>('/api/1/visualizations/', {
        method: 'POST',
        body: JSON.stringify(chartForApi),
      })
    }

    toast.success(update ? t('Graphique mis à jour !') : t('Graphique sauvegardé !'))
    await refresh()
    selectedChartId.value = savedChart.value.id
  }
  catch (error) {
    console.error('Failed to save chart:', error)
  }
}

function removeFilter(index: number) {
  if (!form.value.filter) return

  if (isFilter(form.value.filter)) {
    form.value.filter = null
  }
  else if (isAndFilters(form.value.filter)) {
    form.value.filter.filters.splice(index, 1)
    if (form.value.filter.filters.length === 0) {
      form.value.filter = null
    }
  }
}

function updateFilter(index: number, newFilter: Filter) {
  if (!form.value.filter) return

  if (isFilter(form.value.filter)) {
    form.value.filter = newFilter
  }
  else if (isAndFilters(form.value.filter)) {
    form.value.filter.filters[index] = newFilter
  }
}

function addFilter() {
  const newFilter: Filter = { _cls: 'Filter', column: '', condition: 'exact' as const, value: '' }

  if (!form.value.filter) {
    form.value.filter = newFilter
  }
  else if (isFilter(form.value.filter)) {
    form.value.filter = {
      _cls: 'AndFilters',
      filters: [form.value.filter, newFilter],
    }
  }
  else if (isAndFilters(form.value.filter)) {
    form.value.filter.filters.push(newFilter)
  }
}

watch(
  () => ({
    series: form.value.series,
    x_axis: form.value.x_axis,
    y_axis: form.value.y_axis,
    filter: form.value.filter,
    extras: form.value.extras,
  }),
  () => {
    chartForViewer.value = toChartApi(form.value)
  },
  { deep: true, immediate: true },
)

watch(dataset, async (newDataset) => {
  if (!newDataset) {
    selectedResource.value = null
    return
  }
  try {
    const fetchedResources = await $chartsApi<PaginatedArray<Resource>>(`/api/2/datasets/${newDataset.id}/resources/`)
    for (const r of fetchedResources.data.filter(resource => hasTabularData(resource))) {
      savedResources[r.id] = r
    }
  }
  catch (error) {
    console.error('Failed to fetch resources:', error)
  }
}, { immediate: true })

watch(producer, () => {
  dataset.value = null
  selectedResource.value = null
})

watch(selectedResource, async (r) => {
  if (r) {
    await loadMissingResourcesForChart(new Set([r]))
    if (columns.value[r]?.length > 0) {
      return
    }
    const profile = await getProfile(r)
    resourceProfiles.value[r] = {
      profile: { categorical: profile.profile.categorical },
      columns: profile.profile.columns,
    }
    columns.value[r] = profile.profile.header.map((name) => {
      const colInfo = profile.profile.columns[name]
      const isCategorical = profile.profile.categorical.includes(name)
      const colType = resolveColumnType(colInfo ?? { python_type: 'unknown', format: undefined }, isCategorical)
      return { name, type: colType }
    })
  }
}, { immediate: true })

watch(columns, (columnsPerResource) => {
  const firstColumns = Object.values(columnsPerResource)
  if (firstColumns.length === 0) return
  const firstColumn = firstColumns[0].filter(c => c.name !== '__id')[0]
  if (!form.value.x_axis.column_x && firstColumn) {
    form.value.x_axis.column_x = firstColumn.name
  }
})
</script>
