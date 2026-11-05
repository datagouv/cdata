<template>
  <form
    id="chart-form"
    class="chart-form block"
    @submit.prevent="saveChart"
  >
    <div class="rounded-md border border-new-gray-light bg-white">
      <section
        class="flex flex-col gap-4 border-b border-new-gray-light py-4 px-6 lg:flex-row lg:items-center lg:gap-5"
        aria-label="Source de données"
      >
        <div class="min-w-0 lg:w-48 lg:shrink-0">
          <h2 class="mb-0 text-xs font-bold">
            {{ $t('Source de données') }}
          </h2>
          <p class="mb-0 mt-0.5 text-[11px] leading-4 text-new-gray-medium">
            {{ $t('Contexte commun à la prévisualisation et à l’assistant') }}
          </p>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          <div class="grid flex-1 gap-4 lg:grid-cols-3">
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
            class="mb-0 flex shrink-0 items-center gap-1.5 text-[10px]"
            :class="sourceLoading ? '' : selectedResource ? 'text-new-success' : 'text-new-gray-medium'"
            data-testid="source-status"
          >
            <template v-if="sourceLoading">
              <RiLoader4Line
                class="size-3 animate-spin"
                aria-hidden="true"
              />
              {{ $t('Chargement…') }}
            </template>
            <template v-else-if="selectedResource">
              <RiCheckboxCircleLine
                class="size-3"
                aria-hidden="true"
              />
              {{ $t('{count} colonnes disponibles', { count: resourceColumns.length }) }}
            </template>
            <template v-else>
              <RiInformationLine
                class="size-3"
                aria-hidden="true"
              />
              {{ $t('Source à sélectionner') }}
            </template>
          </p>
        </div>
      </section>

      <div
        class="grid bg-gray-some lg:grid-cols-12"
        data-testid="panels-header"
      >
        <div class="col-span-7 py-2 px-6 shadow-[inset_0_-1px_0_var(--color-gray-default)]">
          <h2 class="mb-0 text-xs font-bold">
            {{ $t('Visualisation') }}
          </h2>
          <p class="mb-0 mt-0.5 text-[11px] leading-4 text-new-gray-medium">
            {{ $t('Prévisualisation et données source') }}
          </p>
        </div>
        <div class="col-span-5 border-t border-new-gray-medium-clic py-2 px-6 shadow-[inset_0_-1px_0_var(--color-gray-default)] lg:border-l lg:border-t-0">
          <h2 class="mb-0 text-xs font-bold">
            {{ $t('Créer une visualisation') }}
          </h2>
          <p class="mb-0 mt-0.5 text-[11px] leading-4 text-new-gray-medium">
            {{ $t('Assistant de création de visualisation') }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-12">
        <div class="col-span-7 space-y-4 py-4 px-6">
          <div
            v-if="selectedResource"
            class="overflow-hidden rounded-md border border-gray-default divide-y divide-gray-default"
            data-testid="chart-preview-block"
          >
            <div class="p-4">
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
              v-if="!hasChart"
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
            <div v-else>
              <ClientOnly>
                <ChartViewerWrapper
                  ref="chartViewerWrapperRef"
                  :chart="chartForViewer"
                />
              </ClientOnly>
            </div>
            <div
              v-if="sourceText"
              class="px-4 py-2 text-sm text-new-gray-medium"
            >
              {{ $t('Source') }}: {{ sourceText }}
            </div>
          </div>
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
          class="col-span-5 space-y-6 border-t border-new-gray-medium-clic py-4 px-6 lg:border-l lg:border-t-0"
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

                  <!-- cursor-auto: DSFR's core.css puts cursor: pointer on the whole
                  details element, so the column list would look clickable. -->
                  <details
                    class="group min-w-0 cursor-auto"
                    data-testid="resource-schema"
                  >
                    <summary class="flex cursor-pointer list-none items-center gap-1 text-[11px] font-medium leading-4 [&::-webkit-details-marker]:hidden">
                      <RiArrowDownSLine
                        class="size-3.5 shrink-0 transition-transform -rotate-90 group-open:rotate-0 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                      {{ $t('Schéma de la ressource') }}
                      <span class="text-new-gray-medium">· {{ $t('{count} colonnes', { count: resourceColumns.length }) }}</span>
                    </summary>
                    <ul class="mt-3 space-y-1 m-0 p-0 list-none">
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
                  </details>
                </fieldset>

                <div class="min-w-0 border-t border-new-gray-light py-4">
                  <fieldset
                    class="m-0 min-w-0"
                    data-testid="chart-type"
                  >
                    <legend class="font-bold mb-4">
                      {{ $t('Type de graphique') }}
                    </legend>
                    <div class="grid grid-cols-2 gap-2">
                      <label
                        v-for="option in chartTypeOptions"
                        :key="option.value"
                        class="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded border px-2 text-[11px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-new-primary motion-reduce:transition-none"
                        :class="form.chart_type === option.value
                          ? 'border-new-primary bg-[#ececfe] font-semibold text-new-primary'
                          : 'border-gray-default bg-white text-new-gray-dark hover:border-new-gray-medium'"
                      >
                        <input
                          v-model="form.chart_type"
                          type="radio"
                          name="chart-type"
                          :value="option.value"
                          class="sr-only"
                        >
                        <component
                          :is="option.icon"
                          class="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {{ option.label }}
                      </label>
                    </div>
                  </fieldset>
                </div>

                <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
                  <p class="font-bold mb-2">
                    {{ $t('Axe X') }}
                  </p>
                  <div>
                    <SearchableSelect
                      id="x-axis-column"
                      v-model="xAxisColumnProxy"
                      :label="$t('Choisir quoi afficher')"
                      :placeholder="$t('Rechercher une colonne à afficher...')"
                      :options="xAxisColumnOptions"
                      :display-value="(opt: XAxisColumnOption) => opt.name"
                      :get-option-id="(opt: XAxisColumnOption) => opt.name"
                      :group-by="(opt: XAxisColumnOption) => typeConfig[opt.type]?.label || opt.type"
                      :multiple="false"
                      class="w-full"
                    >
                      <template #option="{ option }">
                        <component
                          :is="getColumnTypeIcon(option.type)"
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
                      :display-value="(opt) => formatColumnLabel(opt) || $t('Sélectionnez une option')"
                      :get-option-id="(opt) => opt.value"
                    >
                      <template #button>
                        <div class="w-full flex items-center justify-between gap-2 min-w-0">
                          <div
                            class="truncate"
                            :class="{ 'text-new-disabled-text': !sortProxy }"
                          >
                            {{ formatColumnLabel(sortProxy) || $t('Sélectionnez une option') }}
                          </div>
                          <RiArrowDownSLine class="flex-none size-4 justify-self-end" />
                        </div>
                      </template>
                      <template #option="{ option }">
                        <div class="w-full flex items-center justify-between gap-2">
                          <span class="truncate">{{ formatColumnLabel(option) }}</span>
                          <component
                            :is="option.icon"
                            v-if="option.icon"
                            class="size-4 text-new-gray-medium"
                          />
                        </div>
                      </template>
                    </Listbox>
                  </div>
                  <div>
                    <label
                      for="x-axis-limit"
                      class="fr-label"
                    >
                      {{ $t('Nombre de valeurs') }}
                      <span class="fr-hint-text">{{ $t('50 valeurs maximum') }}</span>
                    </label>
                    <input
                      id="x-axis-limit"
                      :value="form.x_axis.limit ?? ''"
                      type="number"
                      :min="1"
                      :max="CHART_MAX_LIMIT"
                      step="1"
                      class="w-full fr-input"
                      @input="onLimitInput"
                    >
                  </div>
                </fieldset>

                <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
                  <p class="font-bold mb-2">
                    {{ $t('Séries') }}
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
                        :placeholder="$t('Rechercher une colonne Y...')"
                        :options="yAxisColumnOptions"
                        :display-value="(opt: YAxisColumnOption) => isCountOption(opt) ? t('Compter') : opt.name"
                        :get-option-id="(opt: YAxisColumnOption) => opt.name"
                        :group-by="(opt: YAxisColumnOption) => isCountOption(opt) ? '' : typeConfig[opt.type]?.label || opt.type"
                        :multiple="false"
                        class="w-full"
                        @update:model-value="(val) => handleSerieColumnYChange(index, val)"
                      >
                        <template #option="{ option }">
                          <component
                            :is="getColumnTypeIcon(option.type)"
                            class="inline w-4 h-4 mr-2"
                          />
                          {{ isCountOption(option) ? $t('Compter') : option.name }}
                        </template>
                      </SearchableSelect>
                    </div>

                    <div v-if="isNumberColumnOption(getSerieColumnYValue(serie))">
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
                      </select>
                    </div>
                  </div>
                </fieldset>

                <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
                  <p class="font-bold mb-2">
                    {{ $t('Filtres') }}
                  </p>
                  <div class="space-y-3">
                    <template
                      v-for="(group, groupIndex) in filterGroups.groups"
                      :key="groupIndex"
                    >
                      <p
                        v-if="groupIndex > 0"
                        class="text-xs text-gray-600"
                      >
                        {{ filterGroups.rootCombinator === 'and' ? $t('et') : $t('ou') }}
                      </p>
                      <ChartFilterGroup
                        :group="group"
                        :combinator="innerCombinator"
                        :can-remove-group="filterGroups.groups.length > 1"
                        :bordered="totalRules > 1"
                        :column-options="columnDetails"
                        :condition-options="conditionOptions"
                        @update:combinator="setInnerCombinator"
                        @remove:filter="(i) => removeFilter(groupIndex, i)"
                        @add-condition="addCondition(groupIndex)"
                        @remove-group="removeGroup(groupIndex)"
                      />
                    </template>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <BrandedButton
                      v-if="totalRules === 0"
                      size="sm"
                      color="tertiary"
                      :icon="RiAddLine"
                      @click="addGroup"
                    >
                      {{ $t('Ajouter une règle') }}
                    </BrandedButton>
                    <BrandedButton
                      v-if="totalRules > 1"
                      size="sm"
                      color="tertiary"
                      :icon="RiAddLine"
                      @click="addGroup"
                    >
                      {{ $t('Ajouter un groupe') }}
                    </BrandedButton>
                  </div>
                </fieldset>

                <fieldset class="min-w-0 border-t border-new-gray-light py-4 space-y-4">
                  <p class="font-bold mb-2">
                    {{ $t('Axe Y') }}
                  </p>
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
                </fieldset>
              </template>
              <div
                v-else
                class="grid min-h-[420px] place-items-center text-center"
                data-testid="form-panel-empty"
              >
                <div class="max-w-xs">
                  <span class="mx-auto grid size-12 place-items-center rounded-full bg-gray-lower text-new-gray-medium-clic">
                    <RiSettings3Line
                      class="size-5"
                      aria-hidden="true"
                    />
                  </span>
                  <p class="mb-0 mt-4 text-sm font-semibold text-new-gray-dark">
                    {{ $t('Aucun graphique à configurer') }}
                  </p>
                  <p class="mb-0 mt-1 text-xs leading-5 text-new-gray-medium">
                    {{ $t('Sélectionnez d’abord un jeu de données et une ressource.') }}
                  </p>
                </div>
              </div>
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
                :visualization="visualization"
                @chart-result="onChartResult"
              />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Resource, PaginatedArray, ChartForm, Chart, Filter, ColumnType, ColumnDefinition, ColumnsDefinition, DataSeriesType, DataSeriesForm, FilterCondition, CombinedSort, Owned, XAxisType } from '@datagouv/components-next'
import { buildTypeConfig, buildColumnsFromProfile, useGetProfile, useHasTabularData, toast, BrandedButton, toChartApi, SearchableSelect, SegmentedControl, Listbox, useTranslation } from '@datagouv/components-next'
import type { Component } from 'vue'
import { computed, defineAsyncComponent, nextTick, reactive, ref, watch } from 'vue'
import { RiAddLine, RiArrowDownLine, RiArrowDownSLine, RiArrowUpLine, RiBarChartBoxLine, RiBarChartLine, RiCalculatorLine, RiCheckboxCircleLine, RiInformationLine, RiLineChartLine, RiLoader4Line, RiSettings3Line, RiText } from '@remixicon/vue'
import { isMeAdmin } from '~/utils/auth'
import { keepValidSortCombined } from '~/utils/charts'
import { fromFilterGroups, toFilterGroups } from '~/utils/chartFilters'
import type { FilterColumnOption, FilterGroupCombinator, FilterGroupsState } from '~/utils/chartFilters'
import type { ChartToolResult } from '~/utils/assistant'
import ChartFilterGroup from './ChartFilterGroup.vue'
import { applyChartToolResult } from './applyChartToolResult'
import ProducerSelect from '../ProducerSelect.vue'
import ChatPanel from '../Assistant/ChatPanel.vue'
import type { DatasetSuggest } from '~/types/types'

type XAxisColumnOption = ColumnDefinition & {
  resourceId: string
}

type SortOption = {
  value: CombinedSort
  column: string
  direction: 'asc' | 'desc' | ''
  label: string
  icon: Component | null
}

const COUNT_OPTION = { name: '__count__', type: 'count' } as const
type CountColumnOption = typeof COUNT_OPTION
type YAxisColumnOption = ColumnDefinition | CountColumnOption

// The chart fetches at most 50 groups (CHART_PAGE_SIZE): a larger limit would show nothing more.
const CHART_MAX_LIMIT = 50

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

const columns = ref<ColumnsDefinition>({})
const producer = ref<Owned | null>(null)
const dataset = ref<DatasetSuggest | null>(null)
const savedResources = reactive<Record<string, Resource>>({})
const selectedResource = ref<string>('')
const chartViewerWrapperRef = ref<InstanceType<typeof ChartViewerWrapper> | null>(null)
const sourceLoading = ref(false)
const activePanel = ref<string>('form')
const panelOptions = computed(() => [
  { value: 'form', label: t('Formulaire') },
  { value: 'assistant', label: t('Assistant') },
])

watch(producer, (newProducer) => {
  if (newProducer?.organization?.id) {
    form.value.owned = { organization: newProducer.organization.id, owner: null }
  }
  else if (newProducer?.owner?.id) {
    form.value.owned = { organization: null, owner: newProducer.owner.id }
  }
}, { immediate: true })
const savedChart = ref<Chart | null>(null)

const chartForViewer = ref(toChartApi(form.value))
// What the assistant sees of the chart, read when a message is sent.
const visualization = computed(() => toChartApi(form.value))

const hasChart = computed(() => !!form.value.x_axis.column_x && form.value.series.length > 0)

const chartTypeOptions = computed(() => [
  { value: 'histogram', label: t('Histogramme'), icon: RiBarChartLine },
  { value: 'line', label: t('Courbe'), icon: RiLineChartLine },
] satisfies Array<{ value: DataSeriesType, label: string, icon: Component }>)

const conditionOptions = ['exact', 'differs', 'is_null', 'is_not_null', 'greater', 'less', 'strictly_greater', 'strictly_less'] satisfies Array<FilterCondition>

const resources = computed(() => Object.values(savedResources))

const resourceColumns = computed<Array<ColumnDefinition>>(() => columns.value[selectedResource.value] ?? [])

const sourceText = computed<string>(() => {
  if (!dataset.value) return ''
  const orgName = producer.value?.organization?.name || ''
  return `${dataset.value.title}${orgName ? ` - ${orgName}` : ''} - datagouv.fr`
})

const xAxisColumnProxy = computed<XAxisColumnOption | null>({
  get: () => {
    const colName = form.value.x_axis.column_x
    if (!colName) return null
    return xAxisColumnOptions.value.find(opt => opt.name === colName) ?? null
  },
  set: (val: XAxisColumnOption | null) => {
    form.value.x_axis.column_x = val?.name ?? ''
    form.value.x_axis.type = getDefaultXAxisType(val?.type)
    if (val?.type === 'date') {
      form.value.x_axis.sort_combined = 'axis_x-asc'
      form.value.chart_type = 'line'
    }
  },
})

const xAxisColumnOptions = computed<Array<XAxisColumnOption>>(() =>
  Object.entries(columns.value).flatMap(([resourceId, cols]) =>
    cols.map(col => ({ name: col.name, type: col.type, resourceId })),
  ),
)

const yAxisColumnOptions = computed<Array<YAxisColumnOption>>(() => {
  if (selectedResource.value && columns.value[selectedResource.value]) {
    return [
      COUNT_OPTION,
      ...columns.value[selectedResource.value].map(col => ({ name: col.name, type: col.type })),
    ]
  }
  return [COUNT_OPTION]
})

function isCountOption(option: YAxisColumnOption | null | undefined): option is CountColumnOption {
  return option?.name === COUNT_OPTION.name
}

function isNumberColumnOption(option: YAxisColumnOption | null | undefined): boolean {
  return option?.type === 'number'
}

const sortOptions = computed<SortOption[]>(() => {
  const xAxisColumn = form.value.x_axis.column_x
  const yAxisColumn = form.value.series[0]?.column_y
  const sameColumnAsX = xAxisColumn && yAxisColumn === xAxisColumn
  const options: SortOption[] = [
    { value: '', column: '', direction: '', label: t('Aucun'), icon: null },
    { value: 'axis_x-asc', column: xAxisColumn || t('Axe X'), direction: 'asc', label: t('Ascendant'), icon: RiArrowUpLine },
    { value: 'axis_x-desc', column: xAxisColumn || t('Axe X'), direction: 'desc', label: t('Descendant'), icon: RiArrowDownLine },
  ]
  if (!sameColumnAsX) {
    options.push(
      { value: 'axis_y-asc', column: yAxisColumn || t('Axe Y'), direction: 'asc', label: t('Ascendant'), icon: RiArrowUpLine },
      { value: 'axis_y-desc', column: yAxisColumn || t('Axe Y'), direction: 'desc', label: t('Descendant'), icon: RiArrowDownLine },
    )
  }
  return options
})

const sortProxy = computed<SortOption | null>({
  get: () => sortOptions.value.find(o => o.value === form.value.x_axis.sort_combined) ?? null,
  set: (val: SortOption | null) => {
    if (val) {
      form.value.x_axis.sort_combined = val.value
    }
  },
})

/**
 * Empty input means no limit. Out-of-range values are clamped and written back
 * to the field, which Vue would not re-render when the clamped value is unchanged.
 */
function onLimitInput(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.value === '') {
    form.value.x_axis.limit = null
    return
  }
  const value = Number(input.value)
  if (!Number.isFinite(value)) return
  const limit = Math.min(CHART_MAX_LIMIT, Math.max(1, Math.trunc(value)))
  form.value.x_axis.limit = limit
  if (input.value !== String(limit)) input.value = String(limit)
}

const columnDetails = computed<Array<FilterColumnOption>>(() => {
  const options: Array<FilterColumnOption> = [{ key: '', value: t('Colonne'), disabled: true }]
  const resourceColumns = columns.value[selectedResource.value ?? '']

  if (resourceColumns) {
    options.push(...resourceColumns.map(c => ({ key: c.name, value: c.name, disabled: false })))
  }

  return options
})

const filterGroups = computed<FilterGroupsState>(() => toFilterGroups(form.value.filter))

/** Conditions inside a group are combined with the opposite of the root combinator. */
const innerCombinator = computed<FilterGroupCombinator>(() =>
  filterGroups.value.rootCombinator === 'and' ? 'or' : 'and',
)

const totalRules = computed(() =>
  filterGroups.value.groups.reduce((count, group) => count + group.length, 0),
)

/** All group combinator selects share one value: flip the root to its opposite. */
function setInnerCombinator(combinator: FilterGroupCombinator) {
  applyFilterGroups({
    ...filterGroups.value,
    rootCombinator: combinator === 'and' ? 'or' : 'and',
  })
}

function applyFilterGroups(state: FilterGroupsState) {
  form.value.filter = fromFilterGroups(state)
}

function newEmptyFilter(): Filter {
  return { _cls: 'Filter', column: '', condition: 'exact', value: '' }
}

function getColumnTypeIcon(colType: ColumnType | 'count'): Component {
  if (colType === 'count') {
    return RiCalculatorLine
  }
  return typeConfig[colType]?.icon ?? RiText
}

function formatColumnLabel(opt: { column: string, label: string } | null): string {
  if (!opt) return ''
  return `${opt.column}${opt.column ? ' - ' : ''}${opt.label}`
}

function getSerieColumnYValue(serie: DataSeriesForm): YAxisColumnOption | null {
  if (serie.aggregate_y === 'count' && serie.column_y === form.value.x_axis.column_x) {
    return COUNT_OPTION
  }
  const colName = serie.column_y
  if (!colName) return null
  return yAxisColumnOptions.value.find(opt => opt.name === colName) ?? null
}

function getDefaultXAxisType(columnType: ColumnType | undefined): XAxisType {
  if (columnType === 'number' || columnType === 'date') {
    return 'continuous'
  }
  return 'discrete'
}

function handleSerieColumnYChange(index: number, option: YAxisColumnOption | null | undefined) {
  const serie = form.value.series[index]
  if (!serie) return

  if (isCountOption(option)) {
    serie.column_y = form.value.x_axis.column_x
    serie.aggregate_y = 'count'
  }
  else {
    serie.column_y = option?.name ?? ''
    if (serie.aggregate_y === 'count' || option?.type !== 'number') {
      serie.aggregate_y = null
    }
  }
}

// Tool calls already applied: a result must never overwrite the user's later
// manual edits, whatever re-emits it.
const appliedToolCalls = new Set<string>()

function onChartResult(result: ChartToolResult) {
  if (appliedToolCalls.has(result.toolCallId)) return
  // The resource changed while the assistant was answering: the chart is for another one.
  if (result.kind === 'create' && result.chart.series[0]?.resource_id !== selectedResource.value) return
  applyChartToolResult(form.value, result)
  appliedToolCalls.add(result.toolCallId)
}

function ensureSeriesHasColumnX(resourceId: string) {
  if (!form.value.x_axis.column_x) {
    const resourceColumns = columns.value[resourceId]
    if (resourceColumns?.length) {
      const nonIdColumns = resourceColumns.filter(c => c.name !== '__id')
      if (nonIdColumns.length > 0) {
        const column = nonIdColumns[0]
        form.value.x_axis.column_x = column.name
        form.value.x_axis.type = getDefaultXAxisType(column.type)
      }
    }
  }
}

function ensureSeriesHasColumnY(resourceId: string) {
  if (form.value.series[0]?.column_y === '') {
    const xColumn = form.value.x_axis.column_x
    if (xColumn) {
      form.value.series[0].column_y = xColumn
      form.value.series[0].aggregate_y = 'count'
    }
    else {
      const resourceColumns = columns.value[resourceId]
      if (resourceColumns?.length) {
        const nonIdColumns = resourceColumns.filter(c => c.name !== '__id')
        if (nonIdColumns.length > 0) {
          form.value.series[0].column_y = nonIdColumns[0].name
        }
      }
    }
  }
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

async function loadColumnsForResources(resourceIds: Array<string>) {
  const idsToLoad = resourceIds.filter(id => !columns.value[id] || columns.value[id].length === 0)
  if (idsToLoad.length === 0) return

  await Promise.all(
    idsToLoad.map(async (id) => {
      try {
        const profile = await getProfile(id)
        columns.value[id] = buildColumnsFromProfile(profile)
      }
      catch (error) {
        console.error(`Failed to load columns for resource ${id}:`, error)
        columns.value[id] = []
      }
    }),
  )
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

  const chartResources = new Set<string>()
  for (const serie of data.series) {
    if (serie.resource_id) {
      chartResources.add(serie.resource_id)
    }
  }

  await loadMissingResourcesForChart(Array.from(chartResources))
  await loadColumnsForResources(Array.from(chartResources))

  if (data.organization) {
    producer.value = { organization: data.organization, owner: null }
  }
  if (data.owner) {
    producer.value = { organization: null, owner: data.owner }
  }

  if (!dataset.value && data.series.length > 0 && data.series[0]?.resource_id) {
    try {
      const resourceData = await $chartsApi<{ resource: Resource, dataset_id: string }>(`/api/2/datasets/resources/${data.series[0].resource_id}/`)
      if (resourceData.dataset_id) {
        const fetchedDataset = await $chartsApi<DatasetSuggest>(`/api/2/datasets/${resourceData.dataset_id}/`)
        dataset.value = fetchedDataset
      }
    }
    catch (error) {
      console.error('Failed to load dataset for chart:', error)
    }
  }

  if (data.series.length > 0 && data.series[0]?.resource_id) {
    await nextTick()

    selectedResource.value = data.series[0].resource_id
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

function addGroup() {
  applyFilterGroups({ ...filterGroups.value, groups: [...filterGroups.value.groups, [newEmptyFilter()]] })
}

function removeGroup(groupIndex: number) {
  applyFilterGroups({ ...filterGroups.value, groups: filterGroups.value.groups.filter((_, i) => i !== groupIndex) })
}

function addCondition(groupIndex: number) {
  const groups = filterGroups.value.groups.map((g, i) => (i === groupIndex ? [...g, newEmptyFilter()] : g))
  applyFilterGroups({ ...filterGroups.value, groups })
}

function removeFilter(groupIndex: number, filterIndex: number) {
  const groups = filterGroups.value.groups.map((g, i) =>
    (i === groupIndex ? g.filter((_, j) => j !== filterIndex) : g))
  applyFilterGroups({ ...filterGroups.value, groups })
}

watch(
  () => ({
    series: form.value.series,
    x_axis: form.value.x_axis,
    y_axis: form.value.y_axis,
    filter: form.value.filter,
    extras: form.value.extras,
    chart_type: form.value.chart_type,
  }),
  () => {
    chartForViewer.value = toChartApi(form.value)
  },
  { deep: true, immediate: true },
)

watch(
  () => form.value.x_axis.column_x,
  (newXColumn) => {
    const serie = form.value.series[0]
    if (serie && serie.aggregate_y === 'count') {
      serie.column_y = newXColumn
    }
  },
)

watch(dataset, async (newDataset) => {
  selectedResource.value = ''
  if (!newDataset) {
    return
  }
  sourceLoading.value = true
  try {
    const fetchedResources = await $chartsApi<PaginatedArray<Resource>>(`/api/2/datasets/${newDataset.id}/resources/`)
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
  if (r) {
    if (form.value.series.length === 0) {
      form.value.series.push({
        type: 'histogram',
        column_y: '',
        aggregate_y: null,
        resource_id: r,
        filters: null,
        column_x_name_override: null,
      })
    }
    else {
      form.value.series[0].resource_id = r
    }
    sourceLoading.value = true
    try {
      if (!savedResources[r]) {
        await loadMissingResourcesForChart([r])
      }
      if (!columns.value[r] || columns.value[r].length === 0) {
        await loadColumnsForResources([r])
      }
    }
    finally {
      sourceLoading.value = false
    }
    // Another resource was selected while this one loaded: its columns must not reset the form.
    if (selectedResource.value !== r) return
    const resourceColumns = columns.value[r]
    if (resourceColumns && resourceColumns.length > 0) {
      const currentXColumn = form.value.x_axis.column_x
      const currentYColumn = form.value.series[0]?.column_y
      const columnNames = resourceColumns.map(c => c.name)

      if (currentXColumn && !columnNames.includes(currentXColumn)) {
        form.value.x_axis.column_x = ''
      }
      if (currentYColumn && !columnNames.includes(currentYColumn)) {
        form.value.series[0].column_y = ''
      }
    }
    else {
      form.value.x_axis.column_x = ''
      form.value.series[0].column_y = ''
    }
    ensureSeriesHasColumnX(r)
    ensureSeriesHasColumnY(r)
  }
})

watch(
  sortOptions,
  (newOptions) => {
    form.value.x_axis.sort_combined = keepValidSortCombined(
      form.value.x_axis.sort_combined,
      newOptions.map(option => option.value),
    )
  },
  { immediate: true },
)

if (props.initialChart) {
  await initializeFromChart(props.initialChart)
}
</script>

<style scoped>
/*
 * Form controls of the chart creation screen only, matching the prototype
 * (.form-control / .form-select). Scoped to `.chart-form`, so the shared
 * SearchableSelect / ProducerSelect and DSFR fields look unchanged elsewhere.
 * Tailwind runs with `important` and `.input` uses `!` utilities, so these rules
 * sit in the `base` layer with `!important`: for important declarations the
 * earlier layer wins over the utilities / components layers.
 */
@layer base {
  .chart-form :deep(.fr-label) {
    font-size: 11px !important;
    font-weight: 500 !important;
    line-height: 1rem !important;
    margin-bottom: 0.25rem !important;
  }

  .chart-form :deep(.fr-input),
  .chart-form :deep(.fr-select),
  .chart-form :deep(.input) {
    display: block !important;
    min-height: 36px !important;
    border: 1px solid var(--color-gray-default) !important;
    border-radius: 6px !important;
    background-color: #fff !important;
    padding-top: 7px !important;
    padding-bottom: 7px !important;
    padding-left: 10px !important;
    color: var(--color-new-gray-dark) !important;
    font-size: 11px !important;
    line-height: 1.25rem !important;
    box-shadow: none !important;
    outline: none !important;
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }

  .chart-form :deep(.fr-input),
  .chart-form :deep(.fr-select) {
    padding-right: 10px !important;
  }

  .chart-form :deep(textarea.fr-input) {
    min-height: 0 !important;
  }

  .chart-form :deep(.fr-input::placeholder),
  .chart-form :deep(.input::placeholder) {
    color: var(--color-new-gray-medium-clic) !important;
    font-style: normal !important;
  }

  .chart-form :deep(.fr-input:focus),
  .chart-form :deep(.fr-select:focus),
  .chart-form :deep(.input:focus) {
    border-color: var(--color-new-primary) !important;
    box-shadow: 0 0 0 2px var(--color-blue-light) !important;
    outline: none !important;
  }

  .chart-form :deep(.fr-input:disabled),
  .chart-form :deep(.fr-select:disabled),
  .chart-form :deep(.input:disabled) {
    cursor: not-allowed !important;
    background-color: var(--color-gray-some) !important;
    color: var(--color-new-gray-medium-clic) !important;
  }

  .chart-form :deep(.fr-select) {
    appearance: none !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%23161616' d='m7 10l5 5l5-5z'/%3E%3C/svg%3E") !important;
    background-position: right 9px center !important;
    background-repeat: no-repeat !important;
    background-size: 16px !important;
    padding-right: 34px !important;
  }

  /* SearchableSelect: drop the wrapper shadow/clipping so the input carries the look. */
  .chart-form :deep(.fr-input-group .overflow-hidden.shadow-md) {
    overflow: visible !important;
    background: transparent !important;
    box-shadow: none !important;
  }
}
</style>
