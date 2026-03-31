<template>
  <div class="grid lg:grid-cols-12 gap-4">
    <div class="col-span-7 space-y-4 py-4 px-6 rounded-lg bg-white border border-new-gray-light">
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
      <div class="mt-4">
        <ClientOnly>
          <ChartViewerWrapper
            v-model="form"
            @columns="columns = $event"
          />
        </ClientOnly>
      </div>
    </div>
    <div class="col-span-5 space-y-6 lg:ml-4 py-4 rounded-lg bg-white border border-new-gray-light">
      <fieldset class="px-6 space-y-4">
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
              v-for="chart in charts?.data"
              :key="chart.id"
              :value="chart.id"
            >
              {{ chart.title }}
            </option>
          </select>
          <button
            class="fr-btn"
            :disabled="!selectedChartId"
            @click="loadSelectedChart"
          >
            {{ $t('Charger') }}
          </button>
        </div>
      </fieldset>
      <fieldset class="px-6">
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
        <label
          for="resource-select"
          class="fr-label"
        >{{ $t('Choix de la ressource') }}</label>
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
            {{ dataset ? $t('Sélectionnez une ressource') : $t('Sélectionnez d\'abord un jeu de données') }}
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
      <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
        <label
          for="chart-type"
          class="fr-label font-bold"
        >
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
              v-for="{ key, value } in flattenedColumns"
              :key="key"
              :label="savedResources[key].title"
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
          {{ $t('Série') }}
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
              <template v-if="selectedResource">
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
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
        <p class="font-bold mb-2">
          {{ $t('Filtre') }}
        </p>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-gray-600">{{ $t('Quand') }}</span>
          
          <!-- Column select -->
          <select
            v-model="form.filter?.column"
            class="fr-select text-sm"
          >
            <option value="" disabled>
              {{ $t('Colonne') }}
            </option>
            <template v-if="selectedResource">
              <option
                v-for="column in columns[selectedResource]"
                :key="column"
                :value="column"
              >
                {{ column }}
              </option>
            </template>
          </select>
          
          <!-- Condition select -->
          <select
            v-model="form.filter?.condition"
            class="fr-select text-sm"
          >
            <option value="" disabled>
              {{ $t('Condition') }}
            </option>
            <option value="equal">
              {{ $t('est') }}
            </option>
            <option value="greater">
              {{ $t('est supérieur à') }}
            </option>
          </select>
          
          <!-- Value input -->
          <input
            v-model="form.filter?.value"
            type="text"
            class="fr-input text-sm w-32"
            :placeholder="$t('Valeur')"
          >
          
          <!-- Remove button -->
          <BrandedButton
            size="sm"
            @click="removeFilter"
            :disabled="!form.filter?.column"
          >
            <RiDeleteBinLine class="w-4 h-4" />
          </BrandedButton>
        </div>
      </fieldset>
      <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
        <p class="font-bold mb-2">
          {{ $t('Axe Y') }}
        </p>
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
      </fieldset>

      <div class="px-6">
        <BrandedButton @click="saveChart">
          {{ $t('Sauvegarder le graphique') }}
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource, PaginatedArray, ChartForm, Chart, Filter, FilterCondition } from '@datagouv/components-next'
import { SearchableSelect, useDebouncedRef, useGetProfile, useHasTabularData, toast, BrandedButton } from '@datagouv/components-next'
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import type { DatasetSuggest } from '~/types/types'
import { RiDeleteBinLine } from '@remixicon/vue'
import { useAPI } from '~/utils/api'

const ChartViewerWrapper = defineAsyncComponent(() => import('@datagouv/components-next').then(m => m.ChartViewerWrapper))

const form = defineModel<ChartForm>({
  required: true,
})

const { t } = useTranslation()

const columns = ref<Record<string, Array<string>>>({})
const flattenedColumns = computed(() => Object.entries(columns.value).map(([key, value]) => ({ key, value })).flat())

const dataset = ref<DatasetSuggest | undefined>({ id: '6170ae10981edd7b132f28a0', title: 'Logements et logements sociaux dans les EPCI' } as DatasetSuggest)
const savedResources = reactive<Record<string, Resource>>({})
const selectedResource = ref('14dba482-41e3-4c54-b82a-d8c11d1d80eb')
const savedChart = ref<Chart | null>(null)
const selectedChartId = ref('')

const debounceMs = 300
const title = ref(form.value.title)
const desc = ref(form.value.description)

const { debounced: titleDebounced } = useDebouncedRef(title, debounceMs)
const { debounced: descDebounced } = useDebouncedRef(desc, debounceMs)

const resources = computed(() => Object.values(savedResources))

const sortOptionLabels = computed(() => {
  const xAxisColumn = form.value.x_axis.column_x
  const yAxisColumn = form.value.series[0]?.column_y
  return {
    '': t('Aucun'),
    'axis_x-asc': xAxisColumn ? `${xAxisColumn} - ${t('Ascendant')}` : t('Axe X - Ascendant'),
    'axis_x-desc': xAxisColumn ? `${xAxisColumn} - ${t('Descendant')}` : t('Axe X - Descendant'),
    'axis_y-asc': yAxisColumn ? `${yAxisColumn} - ${t('Ascendant')}` : t('Axe Y - Ascendant'),
    'axis_y-desc': yAxisColumn ? `${yAxisColumn} - ${t('Descendant')}` : t('Axe Y - Descendant'),
  }
})

const { $api } = useNuxtApp()
const hasTabularData = useHasTabularData()
const getProfile = useGetProfile()

const { data: charts, refresh: refresh } = await useAPI<PaginatedArray<Chart>>('/api/1/visualizations/', { lazy: true })

watch(dataset, async (newDataset) => {
  if (!newDataset) return
  try {
    const fetchedResources = await $api<PaginatedArray<Resource>>(`https://demo.data.gouv.fr/api/2/datasets/${newDataset.id}/resources/`)
    for (const r of fetchedResources.data.filter(resource => hasTabularData(resource))) {
      savedResources[r.id] = r
    }
  }
  catch (error) {
    console.error('Failed to fetch resources:', error)
  }
}, { immediate: true })

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

async function loadMissingResourcesForChart(resourceIds: Set<string>) {
  for (const id of resourceIds) {
    if (savedResources[id]) continue

    try {
      const resource = await $api<Resource>(`https://demo.data.gouv.fr/api/2/datasets/resources/${id}/`)
      savedResources[id] = resource
    }
    catch (error) {
      console.error(`Failed to fetch resource ${id}:`, error)
    }
  }
}

async function suggestDataset(q: string): Promise<Array<DatasetSuggest>> {
  return await $api<Array<DatasetSuggest>>('https://demo.data.gouv.fr/api/1/datasets/suggest/', {
    query: { q, size: 5 },
  })
}

function removeFilter() {
  form.value.filter = undefined
}

async function loadChart(id: string) {
  try {
    const { data } = await useAPI<Chart>(`/api/1/visualizations/${id}/`)
    if (data.value) {
      savedChart.value = data.value

      const chartResources = new Set<string>()
      for (const serie of data.value.series) {
        if (serie.resource_id) {
          chartResources.add(serie.resource_id)
        }
      }

      form.value = toChartForm(data.value)
      title.value = data.value.title
      desc.value = data.value.description

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
</script>
