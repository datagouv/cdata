<template>
  <form
    class="group/form"
    data-input-color="blue"
    @submit.prevent
  >
    <div
      ref="search"
      class="flex flex-wrap items-center justify-between"
      data-cy="search"
    >
      <SearchInput
        v-model="q"
        :placeholder="placeholder || t('Ex : élection présidentielle 2022')"
      />
    </div>
    <div class="grid grid-cols-12 mt-2 md:mt-5">
      <div class="col-span-12 md:col-span-4 lg:col-span-3 space-y-8">
        <div>
          <Sidemenu :button-text="t('Filtres')">
            <template #title>
              {{ t('Type') }}
            </template>
            <RadioGroup
              v-model="currentType"
              name="search-type"
            >
              <RadioInput
                v-for="typeConfig in visibleTypeConfigs"
                :key="typeConfig.class"
                :value="typeConfig.class"
                :count="getCount(typeConfig.class)"
              >
                <template #icon>
                  <component
                    :is="getIcon(typeConfig.class)"
                    class="w-4 h-4"
                  />
                </template>
                {{ typeConfig.name || getDefaultName(typeConfig.class) }}
              </RadioInput>
            </RadioGroup>
          </Sidemenu>
        </div>

        <div>
          <Sidemenu :button-text="t('Filtres')">
            <template #title>
              {{ t('Filtres') }}
            </template>
            <DoubleFilter
              v-slot="{ isEnabled, getOrder }"
              :basic-filters="activeBasicFilters"
              :advanced-filters="activeAdvancedFilters"
            >
              <OrganizationSelect
                v-if="isEnabled('organization')"
                v-model:id="organizationId"
                :style="{ order: getOrder('organization') }"
              />
              <OrganizationTypeSelect
                v-if="isEnabled('organization_badge')"
                v-model="organizationType"
                :style="{ order: getOrder('organization_badge') }"
              />
              <SelectGroup
                v-if="isEnabled('is_restricted')"
                v-model="isRestricted"
                :label="t('Accès')"
                :options="restrictedOptions"
                :style="{ order: getOrder('is_restricted') }"
                hide-null-option
              />
              <slot
                name="filters"
                :is-enabled="isEnabled"
                :get-order="getOrder"
              />
            </DoubleFilter>
            <div
              v-if="hasFilters"
              class="mt-6 text-center"
            >
              <BrandedButton
                color="secondary"
                :icon="RiCloseCircleLine"
                class="w-full justify-center"
                type="button"
                @click="resetFilters"
              >
                {{ t('Réinitialiser les filtres') }}
              </BrandedButton>
            </div>
          </Sidemenu>
        </div>
      </div>
      <section
        ref="results"
        class="col-span-12 md:col-span-8 lg:col-span-9 mt-4 md:mt-0 search-results"
      >
        <div
          v-if="searchResults?.total"
          class="flex flex-wrap gap-4 items-center justify-between pb-2"
        >
          <p
            class="fr-col-auto my-0"
            role="status"
          >
            {{ t("{count} résultats | {count} résultat | {count} résultats", searchResults.total) }}
          </p>
          <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
            <label
              for="sort-search"
              class="fr-col-auto text-sm m-0 mr-2"
            >
              {{ t('Trier par :') }}
            </label>
            <div class="fr-col">
              <select
                id="sort-search"
                v-model="sort"
                class="fr-select shadow-input-blue!"
              >
                <option :value="undefined">
                  {{ t('Pertinence') }}
                </option>
                <option value="-created">
                  {{ t('Date de création') }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <transition mode="out-in">
          <LoadingBlock
            v-slot="{ data: results }"
            :status="searchResultsStatus"
            :data="searchResults"
          >
            <div v-if="results && results.data.length">
              <ul class="space-y-4 mt-2 pt-2 p-0 border-t border-gray-default relative z-2 list-none">
                <li
                  v-for="result in results.data"
                  :key="result.id"
                  class="p-0"
                >
                  <template v-if="currentType === 'datasets'">
                    <slot
                      name="dataset"
                      :dataset="result"
                    >
                      <DatasetCard :dataset="(result as any)" />
                    </slot>
                  </template>
                  <template v-else-if="currentType === 'dataservices'">
                    <slot
                      name="dataservice"
                      :dataservice="result"
                    >
                      <DataserviceCard :dataservice="(result as any)" />
                    </slot>
                  </template>
                  <template v-else-if="currentType === 'reuses'">
                    <slot
                      name="reuse"
                      :reuse="result"
                    >
                      <ReuseHorizontalCard :reuse="(result as any)" />
                    </slot>
                  </template>
                </li>
              </ul>
              <Pagination
                v-if="results && results.total > pageSize"
                :page
                :page-size
                :total-results="results.total"
                class="mt-4"
                :link="getLink"
                @change="changePage"
              />
            </div>
            <div
              v-else
              class="mt-4"
            >
              <slot name="no-results">
                <div class="text-center py-8 text-gray-500">
                  {{ t('Aucun résultat trouvé.') }}
                </div>
              </slot>
            </div>
          </LoadingBlock>
        </transition>
      </section>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch, useTemplateRef, type Component } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { refDebounced } from '@vueuse/core'
import { RiCloseCircleLine, RiDatabase2Line, RiRobot2Line, RiLineChartLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import { useRouteQueryBoolean } from '../../composables/useRouteQueryBoolean'
import { useComponentsConfig } from '../../config'
import { useFetch } from '../../functions/api'
import { getLink } from '../../functions/pagination'
import type { PaginatedArray } from '../../types/api'
import type { Dataset } from '../../types/datasets'
import type { Dataservice } from '../../types/dataservices'
import type { Reuse } from '../../types/reuses'
import type { GlobalSearchConfig } from '../../types/search'
import BrandedButton from '../BrandedButton.vue'
import LoadingBlock from '../LoadingBlock.vue'
import Pagination from '../Pagination.vue'
import RadioGroup from '../RadioGroup.vue'
import RadioInput from '../RadioInput.vue'
import DatasetCard from '../DatasetCard.vue'
import DataserviceCard from '../DataserviceCard.vue'
import ReuseHorizontalCard from '../ReuseHorizontalCard.vue'
import SearchInput from './SearchInput.vue'
import Sidemenu from './Sidemenu.vue'
import DoubleFilter from './DoubleFilter.vue'
import OrganizationSelect from '../Form/OrganizationSelect.vue'
import OrganizationTypeSelect from '../Form/OrganizationTypeSelect.vue'
import SelectGroup from '../Form/SelectGroup.vue'

const props = withDefaults(defineProps<{
  config?: GlobalSearchConfig
  placeholder?: string
}>(), {
  config: () => [
    { class: 'datasets', basicFilters: ['organization', 'organization_badge'] },
    { class: 'dataservices', basicFilters: ['organization', 'is_restricted'] },
    { class: 'reuses', basicFilters: ['organization'] },
  ],
})

const { t } = useTranslation()
const componentsConfig = useComponentsConfig()

const currentType = ref<'datasets' | 'dataservices' | 'reuses'>('datasets')

const visibleTypeConfigs = computed(() => props.config)

const currentTypeConfig = computed(() =>
  props.config.find(c => c.class === currentType.value),
)

const activeBasicFilters = computed(() =>
  (currentTypeConfig.value?.basicFilters ?? []) as string[],
)

const activeAdvancedFilters = computed(() =>
  (currentTypeConfig.value?.advancedFilters ?? []) as string[],
)

const hiddenFilters = computed(() =>
  currentTypeConfig.value?.hiddenFilters ?? [],
)

// URL query params
const q = useRouteQuery<string>('q', '')
const qDebounced = refDebounced(q, componentsConfig.searchDebounce ?? 300)
const page = useRouteQuery('page', 1, { transform: Number })
const sort = useRouteQuery<string | undefined>('sort')

// Filter values
const organizationId = useRouteQuery<string | undefined>('organization')
const organizationType = useRouteQuery<string | undefined>('organization_badge')
const isRestricted = useRouteQueryBoolean('is_restricted')

const pageSize = 20

const restrictedOptions = [
  { value: undefined, label: t(`Toutes les modalités d'accès`) },
  { value: false, label: t('Les API ouvertes à tous') },
  { value: true, label: t('Les API en accès restreint') },
]

function omitEmpty(obj: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '' && v !== null),
  )
}

const filters = computed(() => omitEmpty({
  q: qDebounced.value,
  organization: organizationId.value,
  organization_badge: organizationType.value,
  is_restricted: isRestricted.value,
}))

const queryParams = computed(() => {
  const baseParams: Record<string, unknown> = {
    ...filters.value,
    sort: sort.value,
    page: page.value,
    page_size: pageSize,
  }
  for (const hf of hiddenFilters.value) {
    if (hf) {
      baseParams[hf.key as string] = hf.value
    }
  }
  return baseParams
})

// Reset page on filter/sort change
watch(filters, () => {
  page.value = 1
})
watch(sort, () => {
  page.value = 1
})
watch(currentType, () => {
  page.value = 1
})

const hasFilters = computed(() => {
  const filterKeys = Object.keys(filters.value)
  return filterKeys.some(key => key !== 'q' && filters.value[key] !== undefined)
})

function resetFilters() {
  organizationId.value = undefined
  organizationType.value = undefined
  isRestricted.value = undefined
  q.value = ''
}

// API calls for all 3 types
const { data: datasetsResults, status: datasetsStatus } = await useFetch<PaginatedArray<Dataset>>(
  '/api/2/datasets/search/',
  { params: queryParams },
)
const { data: dataservicesResults, status: dataservicesStatus } = await useFetch<PaginatedArray<Dataservice>>(
  '/api/2/dataservices/search/',
  { params: queryParams },
)
const { data: reusesResults, status: reusesStatus } = await useFetch<PaginatedArray<Reuse>>(
  '/api/2/reuses/search/',
  { params: queryParams },
)

const searchResults = computed(() => ({
  datasets: datasetsResults.value,
  dataservices: dataservicesResults.value,
  reuses: reusesResults.value,
}[currentType.value]))

const searchResultsStatus = computed(() => ({
  datasets: datasetsStatus.value,
  dataservices: dataservicesStatus.value,
  reuses: reusesStatus.value,
}[currentType.value]))

function getCount(type: string) {
  switch (type) {
    case 'datasets': return datasetsResults.value?.total
    case 'dataservices': return dataservicesResults.value?.total
    case 'reuses': return reusesResults.value?.total
    default: return undefined
  }
}

function getIcon(type: string): Component {
  switch (type) {
    case 'datasets': return RiDatabase2Line
    case 'dataservices': return RiRobot2Line
    case 'reuses': return RiLineChartLine
    default: return RiDatabase2Line
  }
}

function getDefaultName(type: string) {
  switch (type) {
    case 'datasets': return t('Jeux de données')
    case 'dataservices': return t('APIs')
    case 'reuses': return t('Réutilisations')
    default: return type
  }
}

// Scroll handling
const searchRef = useTemplateRef('search')
watch(queryParams, () => scrollToTop())

function scrollToTop() {
  searchRef.value?.scrollIntoView({ behavior: 'smooth' })
}

function changePage(newPage: number) {
  page.value = newPage
}
</script>
