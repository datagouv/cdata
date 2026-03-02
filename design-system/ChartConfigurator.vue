<template>
  <div class="grid lg:grid-cols-12 gap-4">
    <!-- Live preview -->
    <div class="col-span-7 space-y-4 py-4 px-6 rounded-lg bg-white border border-new-gray-light">
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
      <div class="mt-4">
        <ClientOnly>
          <ChartViewerWrapper
            v-model="chartPreview"
            @columns="columns = $event"
          />
        </ClientOnly>
      </div>
    </div>

    <!-- Form -->
    <div class="col-span-5 space-y-6 lg:ml-4 py-4 rounded-lg bg-white border border-new-gray-light">
      <fieldset class="px-6 space-y-4">
        <p class="mb-2 font-bold">
          Ressources
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
        <!-- Resources select -->
        <label
          for="resource-select"
          class="mb-1"
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
      </fieldset>
      <!-- X Axis -->
      <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
        <p class="font-bold mb-2">
          Axe X
        </p>
        <div>
          <label
            for="x-axis-column"
            class="mb-1"
          >Column</label>
          <select
            id="x-axis-column"
            v-model="form.xAxisColumn"
            class="w-full fr-select"
          >
            <optgroup
              v-for="{ key, value } in flattenedColumns"
              :key="key"
              :label="key"
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
            class="mb-1"
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
        <div>
          <label
            for="x-axis-sort-by"
            class="mb-1"
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
        <div>
          <label
            for="x-axis-sort-direction"
            class="mb-1"
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
      <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
        <p class="font-bold mb-2">
          Axe Y
        </p>
        <div>
          <label
            for="y-axis-label"
            class="mb-1"
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
              class="w-full fr-select"
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
      <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
        <p class="font-bold mb-2">
          Séries
        </p>
        <div
          v-for="(serie, index) in form.series"
          :key="index"
          class="border rounded-lg p-4 mb-2 space-y-4"
        >
          <div class="flex items-center gap-2 mb-2">
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
              title="Supprimer la série"
              class="text-new-error rounded-full p-2 border border-new-error"
              @click="form.series.splice(index, 1)"
            >
              <RiDeleteBinLine class="size-4" />
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Ressource</label>
            <select
              v-model="serie.resource_id"
              class="w-full fr-select"
            >
              <option
                v-for="resource in resources"
                :key="resource.id"
                :value="resource.id"
              >
                {{ resource.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Colonne Y</label>
            <select
              v-model="serie.column_y"
              class="w-full fr-select"
            >
              <option
                v-for="column in columns[serie.resource_id]"
                :key="column"
                :value="column"
              >
                {{ column }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Agrégation</label>
            <select
              v-model="serie.aggregate_y"
              class="w-full fr-select"
            >
              <option value="">
                Non
              </option>
              <option value="sum">
                Somme
              </option>
              <option value="avg">
                Moyenne
              </option>
            </select>
          </div>
        </div>
        <button
          class="text-sm text-datagouv underline"
          @click="form.series.push(dummySerie)"
        >
          + Ajouter une série
        </button>
      </fieldset>

      <div class="px-6">
        <!-- Save button -->
        <BrandedButton
          @click="saveChart"
        >
          Sauvegarder le graphique
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { XAxisType, XAxisSortBy, SortDirection, UnitPosition, DataSeries, Resource, PaginatedArray, ChartForm, Chart } from '@datagouv/components-next'
import { SearchableSelect, useGetProfile, useHasTabularData, toast, BrandedButton } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'
import { computed, defineAsyncComponent, reactive, watch, ref } from 'vue'
import type { DatasetSuggest } from '~/types/types'

const hasTabularData = useHasTabularData()
const getProfile = useGetProfile()
const ChartViewerWrapper = defineAsyncComponent(() => import('../datagouv-components/src/components/Chart/ChartViewerWrapper.vue'))
const columns = ref<Record<string, Array<string>>>({})
const flattenedColumns = computed(() => Object.entries(columns.value).map(([key, value]) => ({ key, value })).flat())

const dataset = ref<DatasetSuggest>()
const resources = ref<Array<Resource>>([])
const savedResources = reactive<Record<string, Resource>>({})
const selectedResource = ref('')
const savedChart = ref<Chart | null>(null)

const { $api } = useNuxtApp()

const suggestDataset = async (q: string): Promise<Array<DatasetSuggest>> => {
  return await $api<Array<DatasetSuggest>>('https://demo.data.gouv.fr/api/1/datasets/suggest/', {
    query: {
      q,
      size: 5,
    },
  })
}

const dummyDataset = { id: '6170ae10981edd7b132f28a0', title: 'Logements et logements sociaux dans les EPCI' }
const dummySerie: DataSeries = {
  type: 'histogram',
  column_y: 'Nombre de logements',
  aggregate_y: null,
  resource_id: '14dba482-41e3-4c54-b82a-d8c11d1d80eb',
  filters: null,
  column_x_name_override: null,
}

onMounted(() => {
  dataset.value = dummyDataset
})

watch(dataset, async (newDataset) => {
  if (newDataset) {
    try {
      const fetchedResources = await $api<PaginatedArray<Resource>>(`https://demo.data.gouv.fr/api/2/datasets/${newDataset.id}/resources/`)
      resources.value = fetchedResources.data.filter(resource => hasTabularData(resource))
      for (const r of resources.value) {
        savedResources[r.id] = r
      }
    }
    catch (error) {
      console.error('Failed to fetch resources:', error)
      resources.value = []
    }
  }
  else {
    resources.value = []
  }
})

watch([selectedResource], async ([r]) => {
  if (r) {
    if (columns.value[r]) {
      return
    }
    const profile = await getProfile(r)
    columns.value[r] = profile.profile.header
  }
})

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

const saveChart = async () => {
  try {
    if (savedChart.value?.id) {
      savedChart.value = await $api<Chart>(`/api/1/visualizations/${savedChart.value.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(chartPreview.value),
      })
    }
    else {
      savedChart.value = await $api<Chart>('/api/1/visualizations/', {
        method: 'POST',
        body: JSON.stringify(chartPreview.value),
      })
    }

    toast.success(savedChart.value?.id ? 'Graphique mis à jour !' : 'Graphique sauvegardé !')
  }
  catch (error) {
    console.error('Failed to save chart:', error)
  }
}
</script>
