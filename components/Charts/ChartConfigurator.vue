<template>
  <form
    id="chart-form"
    class="block"
    @submit.prevent="saveChart"
  >
    <section
      class="mb-4 py-4 px-6 rounded-lg bg-white border border-new-gray-light"
      aria-label="Source de données"
    >
      <h2 class="font-bold text-lg mb-4">
        {{ $t('Source de données') }}
      </h2>
      <div class="grid gap-4 lg:grid-cols-3">
        <fieldset class="min-w-0">
          <ProducerSelect
            v-model="producer"
            :label="$t('Avec qui souhaitez-vous publier ?')"
            :required="true"
            hide-no-organization-notice
            all
          />
        </fieldset>
        <fieldset
          v-if="producer"
          class="min-w-0"
        >
          <SearchableSelect
            v-model="dataset"
            :label="$t('Jeu de données')"
            :placeholder="$t('Recherchez un jeu de données...')"
            :display-value="(option: DatasetSuggest) => option.title"
            :get-option-id="(option: DatasetSuggest) => option.id"
            :multiple="false"
            :suggest="suggestDataset"
          />
        </fieldset>
        <fieldset
          v-if="dataset"
          class="min-w-0"
        >
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
        </fieldset>
      </div>
      <p
        class="mb-0 mt-4 flex items-center gap-2 text-sm"
        :class="sourceLoading ? '' : selectedResource ? 'text-new-success' : 'text-new-gray-medium'"
      >
        <template v-if="sourceLoading">
          <RiLoader4Line
            class="size-4 animate-spin"
            aria-hidden="true"
          />
          {{ $t('Chargement…') }}
        </template>
        <template v-else-if="selectedResource">
          <RiCheckboxCircleLine
            class="size-4"
            aria-hidden="true"
          />
          {{ $t('{count} colonnes disponibles', { count: resourceColumns.length }) }}
        </template>
        <template v-else>
          <RiInformationLine
            class="size-4"
            aria-hidden="true"
          />
          {{ $t('Source à sélectionner') }}
        </template>
      </p>
    </section>

    <div class="grid lg:grid-cols-12 gap-4 lg:gap-8">
      <div class="col-span-7 space-y-4 py-4 px-6 rounded-lg bg-white border border-new-gray-light">
        <template v-if="selectedResource">
          <div>
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
          <div
            v-if="!form.query"
            class="flex flex-col items-center justify-center h-full py-24"
            data-testid="no-chart-blank-state"
          >
            <span class="grid size-14 place-items-center rounded-full bg-gray-lower text-new-gray-medium-clic">
              <RiBarChartBoxLine
                class="size-7"
                aria-hidden="true"
              />
            </span>
            <p class="text-new-gray-dark font-medium mb-0 mt-4">
              {{ $t('Aucun graphique créé') }}
            </p>
            <p class="text-new-gray-medium text-sm mt-1.5 text-center">
              {{ $t('Utilisez l\'assistant ou l\'édition manuelle pour créer votre première visualisation.') }}
            </p>
          </div>
          <div
            v-else
            class="relative"
          >
            <ClientOnly>
              <ChartViewerWrapper
                ref="chartViewerWrapperRef"
                :chart="chartForViewer"
              />
            </ClientOnly>
            <div
              v-if="previewLoading"
              class="absolute inset-0 z-10 grid place-items-center bg-white/80"
              data-testid="preview-loading-overlay"
            >
              <div class="text-center text-sm text-new-gray-medium">
                <RiLoader4Line
                  class="mx-auto mb-2 block size-8 animate-spin"
                  aria-hidden="true"
                />
                {{ $t('Mise à jour de la prévisualisation') }}
              </div>
            </div>
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
          <span class="grid size-14 place-items-center rounded-full bg-gray-lower text-new-gray-medium-clic">
            <RiBarChartBoxLine
              class="size-7"
              aria-hidden="true"
            />
          </span>

          <p class="text-new-gray-dark font-medium mb-0 mt-4">
            {{ $t('Aucune source sélectionnée') }}
          </p>
          <p class="text-new-gray-medium text-sm mt-1.5 text-center">
            {{ $t('Choisissez un jeu de données et une ressource dans le bandeau source pour commencer.') }}
          </p>
        </div>
      </div>

      <div
        class="col-span-5 space-y-6 py-4 px-6 rounded-lg bg-white border border-new-gray-light"
        :class="activePanel === 'assistant' ? 'lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] flex flex-col' : ''"
      >
        <SegmentedControl
          v-model="activePanel"
          grow
          :options="panelOptions"
        />

        <div
          :class="{ hidden: activePanel !== 'form' }"
          data-testid="form-panel"
        >
          <div class="space-y-6">
            <template v-if="selectedResource">
              <fieldset class="min-w-0 space-y-4">
                <p class="font-bold mb-2">
                  {{ $t('Contenu') }}
                </p>
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
              </fieldset>

              <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
                <label
                  for="chart-query"
                  class="fr-label font-bold"
                >
                  {{ $t('Requête SQL') }}
                </label>
                <textarea
                  id="chart-query"
                  v-model="form.query"
                  aria-label="Requête SQL"
                  rows="6"
                  class="w-full fr-input font-mono text-sm"
                  :placeholder="$t('SELECT ...')"
                />
              </fieldset>

              <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
                <p class="font-bold mb-2">
                  {{ $t('Schéma de la ressource') }}
                </p>
                <ul class="space-y-1 m-0 p-0 list-none">
                  <li
                    v-for="column in resourceColumns"
                    :key="column.name"
                    class="flex items-center gap-2 text-sm"
                  >
                    <component
                      :is="getColumnTypeIcon(column.type)"
                      class="size-4 text-new-gray-medium shrink-0"
                    />
                    <span class="font-mono">{{ column.name }}</span>
                    <span class="text-new-gray-medium">{{ typeConfig[column.type]?.label || column.type }}</span>
                  </li>
                </ul>
              </fieldset>

              <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
                <p class="font-bold mb-2">
                  {{ $t('Axe Y') }}
                </p>
                <AccordionGroup>
                  <Accordion :title="$t('Styles')">
                    <div class="space-y-4">
                      <div>
                        <label
                          for="chart-type"
                          class="fr-label"
                        >{{ $t('Type de graphique') }}</label>
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
            </template>
          </div>

          <div
            v-if="selectedResource && isAdmin"
            class="shrink-0"
          >
            <BrandedButton type="submit">
              {{ $t('Sauvegarder le graphique') }}
            </BrandedButton>
          </div>
        </div>

        <div
          :class="{ hidden: activePanel !== 'assistant' }"
          class="flex-1 min-h-0 flex flex-col"
          data-testid="assistant-panel"
        >
          <ClientOnly>
            <ChatPanel
              :resource-id="selectedResource || null"
              @use-query="onUseQuery"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Resource, PaginatedArray, ChartForm, Chart, ColumnType, Owned } from '@datagouv/components-next'
import { buildTypeConfig, useGetProfile, useHasTabularData, toast, BrandedButton, toChartApi, SearchableSelect, SegmentedControl, useTranslation, useComponentsConfig } from '@datagouv/components-next'
import type { Component } from 'vue'
import { computed, defineAsyncComponent, nextTick, reactive, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { RiBarChartBoxLine, RiCheckboxCircleLine, RiInformationLine, RiLoader4Line, RiText } from '@remixicon/vue'
import { isMeAdmin } from '~/utils/auth'
import ProducerSelect from '../ProducerSelect.vue'
import ChatPanel from '../Assistant/ChatPanel.vue'
import { useResourceColumns } from './useResourceColumns'
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import type { DatasetSuggest } from '~/types/types'

const { $api, $fileApi } = useNuxtApp()
const { t } = useTranslation()
const hasTabularData = useHasTabularData()
const getProfile = useGetProfile()
const isAdmin = isMeAdmin()

const typeConfig = buildTypeConfig(t)
const ChartViewerWrapper = defineAsyncComponent(() => import('@datagouv/components-next/chart').then(m => m.ChartViewerWrapper))

const form = defineModel<ChartForm>({
  required: true,
})

const props = defineProps<{
  /**
   * Full chart being edited, used only to initialize producer/resources/dataset
   * and to keep the chart id for saving — the form data itself comes from the v-model
   */
  initialChart?: Chart
}>()

const { resourceColumns, loadColumnsForResource } = useResourceColumns(getProfile)
const producer = ref<Owned | null>(null)
const dataset = ref<DatasetSuggest | null>(null)
const savedResources = reactive<Record<string, Resource>>({})
const selectedResource = ref<string>('')
const activePanel = ref<string>('form')
const panelOptions = computed(() => [
  { value: 'form', label: t('Formulaire') },
  { value: 'assistant', label: t('Assistant') },
])
const chartViewerWrapperRef = ref<InstanceType<typeof ChartViewerWrapper> | null>(null)
const sourceLoading = ref(false)
const previewLoading = ref(false)
const componentsConfig = useComponentsConfig()

watch(producer, (newProducer) => {
  if (newProducer?.organization?.id) {
    form.value.owned = { organization: newProducer.organization.id, owner: null }
  }
  else if (newProducer?.owner?.id) {
    form.value.owned = { organization: null, owner: newProducer.owner.id }
  }
}, { immediate: true })
const savedChart = ref<Chart | null>(null)

const chartForViewer = computed(() => toChartApi(form.value))

const resources = computed(() => Object.values(savedResources))

const sourceText = computed<string>(() => {
  if (!dataset.value) return ''
  const orgName = producer.value?.organization?.name || ''
  return `${dataset.value.title}${orgName ? ` - ${orgName}` : ''} - datagouv.fr`
})

function getColumnTypeIcon(colType: ColumnType): Component {
  return typeConfig[colType]?.icon ?? RiText
}

function onUseQuery(query: string) {
  form.value.query = query
}

async function loadMissingResourcesForChart(resourceIds: Array<string>) {
  const idsToLoad = resourceIds.filter(id => !savedResources[id])
  if (idsToLoad.length === 0) return

  await Promise.all(
    idsToLoad.map(async (id) => {
      try {
        const resource = await $api<{ resource: Resource, dataset_id: string }>(`/api/2/datasets/resources/${id}/`)
        savedResources[id] = resource.resource
      }
      catch (error) {
        console.error(`Failed to fetch resource ${id}:`, error)
      }
    }),
  )
}

async function suggestDataset(q: string): Promise<Array<DatasetSuggest>> {
  const query: Record<string, string> = { q, size: '5' }

  if (!isAdmin && producer.value?.organization?.id) {
    query.organization = producer.value.organization.id
  }

  return await $api<Array<DatasetSuggest>>('/api/1/datasets/suggest/', {
    query,
  })
}

async function initializeFromChart(data: Chart) {
  savedChart.value = data

  if (data.resource_id) {
    await loadMissingResourcesForChart([data.resource_id])
    await loadColumnsForResource(data.resource_id)
  }

  if (data.organization) {
    producer.value = { organization: data.organization, owner: null }
  }
  if (data.owner) {
    producer.value = { organization: null, owner: data.owner }
  }

  if (!dataset.value && data.resource_id) {
    try {
      const resourceData = await $api<{ resource: Resource, dataset_id: string }>(`/api/2/datasets/resources/${data.resource_id}/`)
      if (resourceData.dataset_id) {
        const fetchedDataset = await $api<DatasetSuggest>(`/api/2/datasets/${resourceData.dataset_id}/`)
        dataset.value = fetchedDataset
      }
    }
    catch (error) {
      console.error('Failed to load dataset for chart:', error)
    }
  }

  if (data.resource_id) {
    await nextTick()

    selectedResource.value = data.resource_id
  }
}

async function saveChart() {
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

  const imageUrl = chartViewerWrapperRef.value?.capture()
  if (imageUrl) {
    const i = await fetch(imageUrl)
    const imageBlob = await i.blob()
    const formData = new FormData()
    formData.set('file', imageBlob, 'image.png')
    await $fileApi(`/api/1/visualizations/${savedChart.value.id}/image/`, {
      method: 'POST',
      body: formData,
    })
  }

  toast.success(update ? t('Graphique mis à jour !') : t('Graphique sauvegardé !'))
}

watch(dataset, async (newDataset) => {
  selectedResource.value = ''
  if (!newDataset) {
    return
  }
  sourceLoading.value = true
  try {
    const fetchedResources = await $api<PaginatedArray<Resource>>(`/api/2/datasets/${newDataset.id}/resources/`)
    for (const r of fetchedResources.data.filter(resource => hasTabularData(resource))) {
      savedResources[r.id] = r
    }
  }
  catch (error) {
    console.error('Failed to fetch resources:', error)
  }
  finally {
    sourceLoading.value = false
  }
}, { immediate: true })

watch(selectedResource, async (r) => {
  form.value.resource_id = r
  if (r) {
    if (!savedResources[r]) {
      await loadMissingResourcesForChart([r])
    }
    sourceLoading.value = true
    try {
      await loadColumnsForResource(r)
    }
    finally {
      sourceLoading.value = false
    }
  }
})

// ChartViewerWrapper keeps its fetch status internal (only `capture` is exposed),
// so the overlay mirrors the wrapper's own trigger: same watched inputs, same
// debounce. It clears two animation frames after the fetch starts, once Vue has
// flushed the wrapper's post-fetch re-render for the common case.
watchDebounced(
  () => [form.value.query, selectedResource.value],
  async () => {
    previewLoading.value = true
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    previewLoading.value = false
  },
  { debounce: componentsConfig.searchDebounce ?? 300 },
)

if (props.initialChart) {
  await initializeFromChart(props.initialChart)
}
</script>
