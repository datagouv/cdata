<template>
  <div class="grid lg:grid-cols-12 gap-4">
    <div class="col-span-7 space-y-4 py-4 px-6 rounded-lg bg-white border border-new-gray-light">
      <div>
        <label
          for="chart-title"
          class="block text-sm font-medium mb-1"
        >Titre</label>
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
          class="block text-sm font-medium mb-1"
        >Description</label>
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
        <p class="mb-2 font-bold">
          Graphiques existants
        </p>
        <div class="flex gap-2">
          <select
            v-model="selectedChartId"
            class="flex-1 fr-select"
          >
            <option
              value=""
              disabled
            >
              Sélectionnez un graphique
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
            Charger
          </button>
        </div>
      </fieldset>
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
            class="mb-1"
          >Type</label>
          <select
            id="x-axis-type"
            v-model="form.x_axis.type"
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
            v-model="form.x_axis.sort_x_by"
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
            v-model="form.x_axis.sort_x_direction"
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
            v-model="form.y_axis.label"
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
              v-model.number="form.y_axis.min"
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
              class="block text-sm font-medium mb-1"
            >Unité</label>
            <input
              id="y-axis-unit"
              v-model="form.y_axis.unit"
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
              v-model="form.y_axis.unit_position"
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

      <fieldset class="border-t border-new-gray-light py-4 px-6 space-y-4">
        <p class="font-bold mb-2">
          Série
        </p>
        <div
          v-for="(serie, index) in form.series"
          :key="index"
          class="space-y-4"
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
              <template v-if="serie.resource_id">
                <option
                  v-for="column in columns[serie.resource_id]"
                  :key="column"
                  :value="column"
                >
                  {{ column }}
                </option>
              </template>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Agrégation</label>
            <select
              v-model="serie.aggregate_y"
              class="w-full fr-select"
            >
              <option :value="null">
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
      </fieldset>

      <div class="px-6">
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
import type { Resource, PaginatedArray, ChartForm, Chart } from '@datagouv/components-next'
import { SearchableSelect, useDebouncedRef, useGetProfile, useHasTabularData, toast, BrandedButton } from '@datagouv/components-next'
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import type { DatasetSuggest } from '~/types/types'
import { useAPI } from '~/utils/api'

const ChartViewerWrapper = defineAsyncComponent(() => import('../datagouv-components/src/components/Chart/ChartViewerWrapper.vue'))

const form = defineModel<ChartForm>({
  required: true,
})

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

      toast.success('Graphique chargé !')
    }
  }
  catch (error) {
    console.error('Failed to load chart:', error)
    toast.error('Erreur lors du chargement du graphique')
  }
}

function loadSelectedChart() {
  if (selectedChartId.value) {
    loadChart(selectedChartId.value)
  }
}

async function saveChart() {
  try {
    if (savedChart.value?.id) {
      savedChart.value = await $api<Chart>(`/api/1/visualizations/${savedChart.value.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(form.value),
      })
    }
    else {
      savedChart.value = await $api<Chart>('/api/1/visualizations/', {
        method: 'POST',
        body: JSON.stringify(form.value),
      })
    }

    toast.success(savedChart.value?.id ? 'Graphique mis à jour !' : 'Graphique sauvegardé !')
    await refresh()
  }
  catch (error) {
    console.error('Failed to save chart:', error)
  }
}
</script>
