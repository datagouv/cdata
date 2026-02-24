<template>
  <div class="grid lg:grid-cols-12 gap-4">
    <!-- Live preview -->
    <div class="col-span-7 space-y-4">
      <!-- Title -->
      <div>
        <label
          for="chart-title"
          class="block text-sm font-medium mb-1"
        >Titre</label>
        <input
          id="chart-title"
          v-model="form.title"
          type="text"
          class="w-full fr-input"
        >
      </div>

      <!-- Description -->
      <div>
        <label
          for="chart-description"
          class="block text-sm font-medium mb-1"
        >Description</label>
        <textarea
          id="chart-description"
          v-model="form.description"
          class="w-full fr-input"
          rows="2"
        />
      </div>
      <div class="border border-gray-light rounded-lg p-6">
        <h3 class="text-lg font-bold mb-4">
          Aperçu
        </h3>
        <ClientOnly>
          <ChartViewerWrapper
            v-model="chartPreview"
            @columns="columns = $event"
          />
        </ClientOnly>
      </div>
    </div>

    <!-- Form -->
    <div class="col-span-5 space-y-6 lg:pl-4">
      <h3 class="text-lg font-bold">
        Configuration
      </h3>
      <fieldset class="border border-gray-light rounded-lg p-4 space-y-4">
        <legend class="text-sm font-bold px-2">
          Ressources
        </legend>
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
        <!-- Resources select -->
        <div class="fr-fieldset__element">
          <label
            for="resource-select"
            class="block text-sm font-medium mb-1"
          >Choix de la ressource</label>
          <select
            id="resource-select"
            v-model="selectedResource"
            class="w-full fr-select"
            :disabled="!dataset"
          >
            <option
              value=""
              disabled
            >
              {{ dataset ? 'Sélectionnez une ressource' : 'Sélectionnez d\'abord un jeu de données' }}
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
      <!-- X Axis -->
      <fieldset class="border border-gray-light rounded-lg p-4 space-y-4">
        <legend class="text-sm font-bold px-2">
          Axe X
        </legend>
        <div class="fr-fieldset__element">
          <label
            for="x-axis-column"
            class="block text-sm font-medium mb-1"
          >Column</label>
          <select
            id="x-axis-column"
            v-model="form.xAxisColumn"
            class="w-full fr-select"
          >
            <option
              v-for="column in flattenedColumns"
              :key="column"
              :value="column"
            >
              {{ column }}
            </option>
          </select>
        </div>
        <div class="fr-fieldset__element">
          <label
            for="x-axis-type"
            class="block text-sm font-medium mb-1"
          >Type</label>
          <select
            id="x-axis-type"
            v-model="form.xAxisType"
            class="w-full fr-select"
          >
            <option value="discrete">
              Discret (catégories)
            </option>
            <option value="continuous">
              Continu (valeurs)
            </option>
          </select>
        </div>
        <div class="fr-fieldset__element">
          <label
            for="x-axis-sort-by"
            class="block text-sm font-medium mb-1"
          >Trier par</label>
          <select
            id="x-axis-sort-by"
            v-model="form.xAxisSortBy"
            class="w-full fr-select"
          >
            <option value="">
              Aucun
            </option>
            <option value="axis_x">
              Axe X
            </option>
            <option value="axis_y">
              Axe Y
            </option>
          </select>
        </div>
        <div class="fr-fieldset__element">
          <label
            for="x-axis-sort-direction"
            class="block text-sm font-medium mb-1"
          >Direction du tri</label>
          <select
            id="x-axis-sort-direction"
            v-model="form.xAxisSortDirection"
            class="w-full fr-select"
          >
            <option value="asc">
              Ascendant
            </option>
            <option value="desc">
              Descendant
            </option>
          </select>
        </div>
      </fieldset>

      <!-- Y Axis -->
      <fieldset class="border border-gray-light rounded-lg p-4 space-y-4">
        <legend class="text-sm font-bold px-2">
          Axe Y
        </legend>
        <div>
          <label
            for="y-axis-label"
            class="block text-sm font-medium mb-1"
          >Label</label>
          <input
            id="y-axis-label"
            v-model="form.yAxisLabel"
            type="text"
            class="w-full fr-input"
          >
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="y-axis-min"
              class="block text-sm font-medium mb-1"
            >Min</label>
            <input
              id="y-axis-min"
              v-model.number="form.yAxisMin"
              type="number"
              class="w-full fr-input"
            >
          </div>
          <div>
            <label
              for="y-axis-max"
              class="block text-sm font-medium mb-1"
            >Max</label>
            <input
              id="y-axis-max"
              v-model.number="form.yAxisMax"
              type="number"
              class="w-full fr-input"
            >
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="y-axis-unit"
              class="block text-sm font-medium mb-1"
            >Unité</label>
            <input
              id="y-axis-unit"
              v-model="form.yAxisUnit"
              type="text"
              class="w-full fr-input"
              placeholder="ex: €, %, kg"
            >
          </div>
          <div>
            <label
              for="y-axis-unit-position"
              class="block text-sm font-medium mb-1"
            >Position unité</label>
            <select
              id="y-axis-unit-position"
              v-model="form.yAxisUnitPosition"
              class="w-full fr-input"
            >
              <option value="suffix">
                Suffixe
              </option>
              <option value="prefix">
                Préfixe
              </option>
            </select>
          </div>
        </div>
      </fieldset>

      <!-- Series -->
      <fieldset class="border border-gray-light rounded-lg p-4 space-y-4">
        <legend class="text-sm font-bold px-2">
          Séries
        </legend>
        <div
          v-for="(serie, index) in form.series"
          :key="index"
          class="flex items-center gap-4"
        >
          <span class="text-sm text-gray-medium">{{ index + 1 }}.</span>
          <select
            v-model="serie.type"
            class="flex-1 fr-select"
          >
            <option value="line">
              Ligne
            </option>
            <option value="histogram">
              Histogramme
            </option>
          </select>
          <button
            class="text-danger-dark text-sm"
            @click="form.series.splice(index, 1)"
          >
            Supprimer
          </button>
        </div>
        <button
          class="text-sm text-datagouv underline"
          @click="form.series.push(dummySerie)"
        >
          + Ajouter une série
        </button>
      </fieldset>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { XAxisType, XAxisSortBy, SortDirection, UnitPosition, DataSeries, Resource, PaginatedArray, ChartForm } from '@datagouv/components-next'
import { SearchableSelect, useHasTabularData } from '@datagouv/components-next'

import { computed, defineAsyncComponent, reactive, watch, ref } from 'vue'
import type { DatasetSuggest } from '~/types/types'

const { hasTabularData } = useHasTabularData()
const ChartViewerWrapper = defineAsyncComponent(() => import('../datagouv-components/src/components/Chart/ChartViewerWrapper.vue'))
const columns = ref<Record<string, Array<string>>>({})
const flattenedColumns = computed(() => Object.values(columns.value).flat())

const dataset = ref<DatasetSuggest>()
const resources = ref<Array<Resource>>([])
const selectedResource = ref('')

const { $api } = useNuxtApp()

const suggestDataset = async (q: string): Promise<Array<DatasetSuggest>> => {
  return await $api<Array<DatasetSuggest>>('/api/1/datasets/suggest/', {
    query: {
      q,
      size: 5,
    },
  })
}

watch(dataset, async (newDataset) => {
  if (newDataset) {
    try {
      const fetchedResources = await $api<PaginatedArray<Resource>>(`/api/2/datasets/${newDataset.id}/resources/`)
      resources.value = fetchedResources.data.filter(resource => hasTabularData(resource))
    }
    catch (error) {
      console.error('Failed to fetch resources:', error)
      resources.value = []
    }
  }
  else {
    resources.value = []
  }
}, { immediate: false })

const dummySerie: DataSeries = {
  type: 'histogram',
  column_y: 'Nombre de logements',
  aggregate_y: 'sum',
  resource_id: '14dba482-41e3-4c54-b82a-d8c11d1d80eb',
}

const form = reactive<{
  title: string
  description: string
  xAxisColumn: string
  xAxisType: XAxisType
  xAxisSortBy: XAxisSortBy | ''
  xAxisSortDirection: SortDirection
  yAxisLabel: string
  yAxisMin: number | undefined
  yAxisMax: number | undefined
  yAxisUnit: string
  yAxisUnitPosition: UnitPosition
  series: Array<DataSeries>
}>({
  title: 'Mon graphique',
  description: '',
  xAxisColumn: 'nom_region',
  xAxisType: 'discrete',
  xAxisSortBy: '',
  xAxisSortDirection: 'asc',
  yAxisLabel: '',
  yAxisMin: undefined,
  yAxisMax: undefined,
  yAxisUnit: '',
  yAxisUnitPosition: 'suffix',
  series: [dummySerie],
})

const user = useMaybeMe()

const chartPreview = computed<ChartForm>(() => ({
  organization: null,
  owner: user.value ? user.value.id : 'dummyForDS',
  title: form.title,
  description: form.description,
  private: false,
  x_axis: {
    column_x: form.xAxisColumn,
    type: form.xAxisType,
    ...(form.xAxisSortBy ? { sort_x_by: form.xAxisSortBy, sort_x_direction: form.xAxisSortDirection } : {}),
  },
  y_axis: {
    label: form.yAxisLabel || undefined,
    min: form.yAxisMin,
    max: form.yAxisMax,
    unit: form.yAxisUnit || undefined,
    unit_position: form.yAxisUnitPosition,
  },
  series: form.series,
  extras: {},
} satisfies ChartForm))
</script>
