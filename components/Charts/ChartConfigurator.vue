<template>
  <form
    id="chart-form"
    class="block"
    @submit.prevent="saveChart"
  >
    <div class="grid lg:grid-cols-12 gap-4 lg:gap-8">
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
                  ref="chartViewerWrapperRef"
                  :chart="chartForViewer"
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
          <img
            src="/illustrations/chart.svg"
            class="size-32 shrink-0"
            alt=""
          >

          <p class="text-new-gray-dark font-medium mb-0">
            {{ $t('Aucune source sélectionnée') }}
          </p>
          <p class="text-new-gray-medium text-sm mt-1.5 text-center">
            {{ $t('Choisissez un jeu de données depuis le panneau de configuration pour commencer à visualiser.') }}
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
import type { Resource, PaginatedArray, ChartForm, Chart, ColumnType, ColumnDefinition, Owned } from '@datagouv/components-next'
import { buildTypeConfig, buildColumnsFromProfile, useGetProfile, useHasTabularData, toast, BrandedButton, toChartApi, SearchableSelect, SegmentedControl, useTranslation } from '@datagouv/components-next'
import type { Component } from 'vue'
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { RiText } from '@remixicon/vue'
import { isMeAdmin } from '~/utils/auth'
import ProducerSelect from '../ProducerSelect.vue'
import ChatPanel from '../Assistant/ChatPanel.vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import type { DatasetSuggest } from '~/types/types'

const { $api, $fileApi } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const { t } = useTranslation()
const hasTabularData = useHasTabularData()
const getProfile = useGetProfile()
const isAdmin = isMeAdmin()

const $chartsApi = $fetch.create({
  baseURL: runtimeConfig.public.chartsApiBase as string,
  onRequest({ options }) {
    options.headers.set('Content-Type', 'application/json')
    options.headers.set('Accept', 'application/json')
  },
})

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

const resourceColumns = ref<Array<ColumnDefinition>>([])
const resourceColumnsId = ref('')
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
        const resource = await $chartsApi<{ resource: Resource, dataset_id: string }>(`/api/2/datasets/resources/${id}/`)
        savedResources[id] = resource.resource
      }
      catch (error) {
        console.error(`Failed to fetch resource ${id}:`, error)
      }
    }),
  )
}

async function loadColumnsForResource(resourceId: string) {
  if (resourceColumnsId.value === resourceId) return
  resourceColumnsId.value = resourceId
  try {
    const profile = await getProfile(resourceId)
    if (resourceColumnsId.value !== resourceId) return
    resourceColumns.value = buildColumnsFromProfile(profile)
  }
  catch (error) {
    if (resourceColumnsId.value !== resourceId) return
    console.error(`Failed to load columns for resource ${resourceId}:`, error)
    resourceColumns.value = []
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
      const resourceData = await $chartsApi<{ resource: Resource, dataset_id: string }>(`/api/2/datasets/resources/${data.resource_id}/`)
      if (resourceData.dataset_id) {
        const fetchedDataset = await $chartsApi<DatasetSuggest>(`/api/2/datasets/${resourceData.dataset_id}/`)
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

watch(selectedResource, async (r) => {
  form.value.resource_id = r
  if (r) {
    if (!savedResources[r]) {
      await loadMissingResourcesForChart([r])
    }
    await loadColumnsForResource(r)
  }
})

if (props.initialChart) {
  await initializeFromChart(props.initialChart)
}
</script>
