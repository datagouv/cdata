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
              v-model="title"
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
              v-model="desc"
              class="w-full fr-input"
              rows="2"
            />
          </div>
          <div class="mt-4 border-t border-new-gray-light pt-4">
            <h3 class="font-medium text-lg text-new-gray-dark">
              {{ title || $t('Sans titre') }}
            </h3>
            <p
              v-if="desc"
              class="text-new-gray-medium mt-1"
            >
              {{ desc }}
            </p>
          </div>
          <hr class="border-new-gray-light my-4">
          <div class="mt-4">
            <ClientOnly>
              <ChartViewerWrapper
                :chart="toChartApi(form)"
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

      <div class="col-span-5 space-y-6 lg:ml-4 py-4 rounded-lg bg-white border border-new-gray-light">
        <fieldset
          v-if="isAdmin"
          class="px-6 space-y-4"
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
        <fieldset class="px-6">
          <ProducerSelect
            v-model="producer"
            :label="$t('Avec qui souhaitez-vous publier ?')"
            :required="true"
            all
          />
        </fieldset>
        <fieldset
          v-if="producer"
          class="px-6"
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
          <fieldset class="min-w-0 border-t border-new-gray-light py-4 px-6 space-y-4">
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

          <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
            <label
              for="chart-type"
              class="fr-label font-bold flex items-center gap-2"
            >
              <RiBarChartLine />
              {{ $t('Type de graphique') }}
            </label>
            <div>
              <select
                id="chart-type"
                v-model="form.chart_type"
                class="w-full fr-select"
              >
                <option value="line">
                  {{ $t('Ligne') }}
                </option>
                <option value="histogram">
                  {{ $t('Histogramme') }}
                </option>
              </select>
            </div>
          </fieldset>
          <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
            <p class="font-bold mb-2">
              {{ $t('Axe X') }}
            </p>
            <div>
              <label
                for="x-axis-column"
                class="fr-label"
              >{{ $t('Choisir quoi afficher') }}</label>
              <select
                id="x-axis-column"
                v-model="form.x_axis.column_x"
                class="w-full fr-select"
              >
                <optgroup
                  v-for="{ key, value } in columnsArray"
                  :key="key"
                  :label="savedResources[key]?.title ?? key"
                >
                  <option
                    v-for="column in value"
                    :key="column"
                    :value="column"
                  >
                    {{ column }}
                  </option>
                </optgroup>
              </select>
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
            <div>
              <label
                for="x-axis-sort-combined"
                class="fr-label"
              >{{ $t('Trier par') }}</label>
              <select
                id="x-axis-sort-combined"
                v-model="form.x_axis.sort_combined"
                class="w-full fr-select"
              >
                <option
                  v-for="(label, value) in sortOptionLabels"
                  :key="value"
                  :value
                >
                  {{ label }}
                </option>
              </select>
            </div>
          </fieldset>

          <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
            <p class="font-bold mb-2">
              {{ $t('Axe Y') }}
            </p>
            <div
              v-for="(serie, index) in form.series"
              :key="index"
              class="space-y-4"
            >
              <div>
                <label
                  :for="`column-y-${index}`"
                  class="fr-label"
                >{{ $t('Colonne Y')
                }}</label>
                <select
                  :id="`column-y-${index}`"
                  v-model="serie.column_y"
                  class="w-full fr-select"
                >
                  <option value="__count__">
                    {{ $t('Count') }}
                  </option>
                  <template v-if="selectedResource && columns[selectedResource]">
                    <option
                      v-for="column in columns[selectedResource]"
                      :key="column"
                      :value="column"
                    >
                      {{ column }}
                    </option>
                  </template>
                </select>
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
            class="px-6"
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
import type { Resource, PaginatedArray, ChartForm, Chart, Filter, FilterCondition, Owned } from '@datagouv/components-next'
import { useDebouncedRef, useGetProfile, useHasTabularData, toast, BrandedButton, toChartApi, toChartForm, SearchableSelect } from '@datagouv/components-next'
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { RiAddLine, RiBarChartLine } from '@remixicon/vue'
import { useAPI } from '~/utils/api'

import ChartFilterRow from './ChartFilterRow.vue'
import ProducerSelect from '../ProducerSelect.vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import type { DatasetSuggest } from '~/types/types'

const ChartViewerWrapper = defineAsyncComponent(() => import('@datagouv/components-next').then(m => m.ChartViewerWrapper))

const form = defineModel<ChartForm>({
  required: true,
})

const { t } = useTranslation()

const columns = ref<Record<string, Array<string>>>({})
const columnsArray = computed(() => Object.entries(columns.value).map(([key, value]) => ({ key, value })))

const producer = ref<Owned | null>(null)
const dataset = ref<DatasetSuggest | null>(null)
const savedResources = reactive<Record<string, Resource>>({})
const selectedResource = ref<string | null>(null)
const savedChart = ref<Chart | null>(null)
const selectedChartId = ref('')

const debounceMs = 300
const title = ref(form.value.title)
const desc = ref(form.value.description)

const { debounced: titleDebounced } = useDebouncedRef(title, debounceMs)
const { debounced: descDebounced } = useDebouncedRef(desc, debounceMs)

const resources = computed(() => Object.values(savedResources))

const sourceText = computed(() => {
  if (!dataset.value) return ''
  const orgName = producer.value?.organization?.name || ''
  return `${dataset.value.title}${orgName ? ` - ${orgName}` : ''} - datagouv.fr`
})

const conditionOptions: Array<FilterCondition> = ['exact', 'differs', 'is_null', 'is_not_null', 'greater', 'less', 'strictly_greater', 'strictly_less']

const sortOptionLabels = computed(() => {
  const xAxisColumn = form.value.x_axis.column_x
  const yAxisColumn = form.value.series[0]?.column_y
  return {
    '': t('Aucun'),
    'axis_x-asc': xAxisColumn ? `${xAxisColumn} - ↑ ${t('Ascendant')}` : `↑ ${t('Axe X - Ascendant')}`,
    'axis_x-desc': xAxisColumn ? `${xAxisColumn} - ↓ ${t('Descendant')}` : `↓ ${t('Axe X - Descendant')}`,
    'axis_y-asc': yAxisColumn ? `${yAxisColumn} - ↑ ${t('Ascendant')}` : `↑ ${t('Axe Y - Ascendant')}`,
    'axis_y-desc': yAxisColumn ? `${yAxisColumn} - ↓ ${t('Descendant')}` : `↓ ${t('Axe Y - Descendant')}`,
  }
})

const columnDetails = computed(() => {
  const options = [{ key: '', value: t('Colonne'), disabled: true }]
  const resourceColumns = columns.value[selectedResource.value]

  if (resourceColumns) {
    options.push(...resourceColumns.map(c => ({ key: c, value: c, disabled: false })))
  }

  return options
})

const { $api } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const hasTabularData = useHasTabularData()
const getProfile = useGetProfile()
const isAdmin = isMeAdmin()

// Create a new API client for chart-related API calls
const $chartsApi = $fetch.create({
  baseURL: runtimeConfig.public.chartsApiBase as string,
  onRequest({ options }) {
    options.headers.set('Content-Type', 'application/json')
    options.headers.set('Accept', 'application/json')
    options.credentials = 'include'
  },
})

const { data: charts, refresh } = await useAPI<PaginatedArray<Chart>>('/api/1/visualizations/', { lazy: true })

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
  // When producer changes, reset dataset and resource selection
  dataset.value = null
  selectedResource.value = null
})

watch(selectedResource, async (r) => {
  if (r) {
    await loadMissingResourcesForChart(new Set([r]))
    if (columns.value[r]) {
      return
    }
    const profile = await getProfile(r)
    columns.value[r] = profile.profile.header
  }
}, { immediate: true })

watch([titleDebounced, descDebounced], ([title, desc]) => {
  form.value.title = title
  form.value.description = desc
})

watch(columns, (columnsPerResource) => {
  const firstColumns = Object.values(columnsPerResource)
  if (firstColumns.length === 0) return
  const firstColumn = firstColumns[0].filter(c => c !== '__id')[0]
  if (!form.value.x_axis.column_x && firstColumn) {
    form.value.x_axis.column_x = firstColumn
  }
})

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

  // Scope to producer's org if user is not admin and producer is selected
  if (!isAdmin && producer.value?.organization) {
    query.organization = producer.value.organization.id
  }

  return await $api<Array<DatasetSuggest>>('/api/1/datasets/suggest/', {
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
      title.value = data.title
      desc.value = data.description

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

// Flatten filter structure: return all individual filters in a flat array
const filterList = computed<Array<Filter>>(() => {
  if (!form.value.filter) return []

  const filter = form.value.filter
  if (filter._cls === 'Filter') {
    return [filter]
  }
  else if (filter._cls === 'AndFilters') {
    // Flatten nested filters
    const result: Array<Filter> = []
    for (const f of filter.filters) {
      if (f._cls === 'Filter') {
        result.push(f)
      }
      // For simplicity, we don't handle nested AndFilters recursively
      // This would require a more complex recursive flattening
    }
    return result
  }
  return []
})

function removeFilter(index: number) {
  if (!form.value.filter) return

  if (form.value.filter._cls === 'Filter') {
    // Single filter - removing it means clearing the filter
    form.value.filter = null
  }
  else if ('filters' in form.value.filter) {
    form.value.filter.filters.splice(index, 1)
    if (form.value.filter.filters.length === 0) {
      form.value.filter = null
    }
  }
}

function updateFilter(index: number, newFilter: Filter) {
  if (!form.value.filter) return

  if (form.value.filter._cls === 'Filter') {
    // Single filter - replace it
    form.value.filter = newFilter
  }
  else if ('filters' in form.value.filter) {
    form.value.filter.filters[index] = newFilter
  }
}

function addFilter() {
  const newFilter: Filter = { _cls: 'Filter', column: '', condition: 'exact' as const, value: '' }

  if (!form.value.filter) {
    form.value.filter = newFilter
  }
  else if (form.value.filter._cls === 'Filter') {
    // Convert single filter to AndFilters with both
    form.value.filter = {
      _cls: 'AndFilters',
      filters: [form.value.filter, newFilter],
    }
  }
  else if ('filters' in form.value.filter) {
    form.value.filter.filters.push(newFilter)
  }
}
</script>
