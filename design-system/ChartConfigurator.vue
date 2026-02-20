<template>
  <div class="grid lg:grid-cols-2 gap-8">
    <!-- Live preview -->
    <div class="border border-gray-light rounded-lg p-4">
      <h3 class="text-lg font-bold mb-4">
        Aperçu
      </h3>
      <ClientOnly>
        <ChartViewer :chart="chartPreview" />
      </ClientOnly>
    </div>

    <!-- Form -->
    <div class="space-y-6">
      <h3 class="text-lg font-bold">
        Configuration
      </h3>

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
          class="w-full border border-gray-light rounded px-3 py-2"
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
          class="w-full border border-gray-light rounded px-3 py-2"
          rows="2"
        />
      </div>

      <!-- X Axis -->
      <fieldset class="border border-gray-light rounded-lg p-4 space-y-4">
        <legend class="text-sm font-bold px-2">
          Axe X
        </legend>
        <div>
          <label
            for="x-axis-type"
            class="block text-sm font-medium mb-1"
          >Type</label>
          <select
            id="x-axis-type"
            v-model="form.xAxisType"
            class="w-full border border-gray-light rounded px-3 py-2"
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
            class="block text-sm font-medium mb-1"
          >Trier par</label>
          <select
            id="x-axis-sort-by"
            v-model="form.xAxisSortBy"
            class="w-full border border-gray-light rounded px-3 py-2"
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
            class="block text-sm font-medium mb-1"
          >Direction du tri</label>
          <select
            id="x-axis-sort-direction"
            v-model="form.xAxisSortDirection"
            class="w-full border border-gray-light rounded px-3 py-2"
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
            class="w-full border border-gray-light rounded px-3 py-2"
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
              class="w-full border border-gray-light rounded px-3 py-2"
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
              class="w-full border border-gray-light rounded px-3 py-2"
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
              class="w-full border border-gray-light rounded px-3 py-2"
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
              class="w-full border border-gray-light rounded px-3 py-2"
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
            class="flex-1 border border-gray-light rounded px-3 py-2"
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
          @click="form.series.push({ type: 'line' })"
        >
          + Ajouter une série
        </button>
      </fieldset>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chart, DataSeriesType, XAxisType, XAxisSortBy, SortDirection, UnitPosition } from '@datagouv/components-next'
import { computed, defineAsyncComponent, reactive } from 'vue'

const ChartViewer = defineAsyncComponent(() => import('../datagouv-components/src/components/ChartViewer.vue'))

const form = reactive<{
  title: string
  description: string
  xAxisType: XAxisType
  xAxisSortBy: XAxisSortBy | ''
  xAxisSortDirection: SortDirection
  yAxisLabel: string
  yAxisMin: number | undefined
  yAxisMax: number | undefined
  yAxisUnit: string
  yAxisUnitPosition: UnitPosition
  series: Array<{ type: DataSeriesType }>
}>({
  title: 'Mon graphique',
  description: '',
  xAxisType: 'discrete',
  xAxisSortBy: '',
  xAxisSortDirection: 'asc',
  yAxisLabel: '',
  yAxisMin: undefined,
  yAxisMax: undefined,
  yAxisUnit: '',
  yAxisUnitPosition: 'suffix',
  series: [{ type: 'line' }, { type: 'histogram' }],
})

const chartPreview = computed<Chart>(() => ({
  id: 'preview',
  title: form.title,
  slug: 'preview',
  description: form.description,
  private: false,
  organization: null,
  owner: { class: 'User', id: 'preview', first_name: 'Preview', last_name: 'User', slug: 'preview', uri: '', page: '', avatar: '', avatar_thumbnail: '' },
  created_at: new Date().toISOString(),
  last_modified: new Date().toISOString(),
  deleted_at: null,
  uri: '',
  page: '',
  x_axis: {
    column_x: 'category',
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
  series: form.series.map(s => ({
    type: s.type,
  })),
  extras: {},
  permissions: { delete: false, edit: true, read: true },
  metrics: { views: 0 },
}))
</script>
