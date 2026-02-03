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
      <div
        v-if="showSidebar"
        class="col-span-12 md:col-span-4 lg:col-span-3 md:space-y-8"
      >
        <div v-if="config.length > 1">
          <Sidemenu :button-text="t('Type')">
            <template #title>
              {{ t('Type') }}
            </template>
            <RadioGroup
              v-model="currentType"
              name="search-type"
            >
              <RadioInput
                v-for="typeConfig in config"
                :key="typeConfig.class"
                :value="typeConfig.class"
                :count="typesMeta[typeConfig.class].results.value?.total"
                :loading="typesMeta[typeConfig.class].status.value === 'pending' || typesMeta[typeConfig.class].status.value === 'idle'"
                :icon="typesMeta[typeConfig.class].icon"
              >
                {{ typeConfig.name || typesMeta[typeConfig.class].name }}
              </RadioInput>
            </RadioGroup>
          </Sidemenu>
        </div>

        <div v-if="activeFilters.length > 0">
          <Sidemenu :button-text="t('Filtres')">
            <template #title>
              {{ t('Filtres') }}
            </template>
            <BasicAndAdvancedFilters
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
              <TagSelect
                v-if="isEnabled('tag')"
                v-model:id="tag"
                :style="{ order: getOrder('tag') }"
              />
              <FormatSelect
                v-if="isEnabled('format')"
                v-model:id="format"
                :style="{ order: getOrder('format') }"
              />
              <LicenseSelect
                v-if="isEnabled('license')"
                v-model:id="license"
                :style="{ order: getOrder('license') }"
              />
              <SchemaSelect
                v-if="isEnabled('schema')"
                v-model:id="schema"
                :style="{ order: getOrder('schema') }"
              />
              <GeozoneSelect
                v-if="isEnabled('geozone')"
                v-model:id="geozone"
                :style="{ order: getOrder('geozone') }"
              />
              <GranularitySelect
                v-if="isEnabled('granularity')"
                v-model:id="granularity"
                :style="{ order: getOrder('granularity') }"
              />
              <ReuseTopicSelect
                v-if="isEnabled('topic')"
                v-model:id="topic"
                :style="{ order: getOrder('topic') }"
              />
              <FormatFamilyFilter
                v-if="isEnabled('format_family')"
                v-model="formatFamily"
                :facets="getFacets('format_family')"
                :loading="searchResultsStatus === 'pending'"
                :style="{ order: getOrder('format_family') }"
              />
              <AccessTypeFilter
                v-if="isEnabled('access_type')"
                v-model="accessType"
                :facets="getFacets('access_type')"
                :loading="searchResultsStatus === 'pending'"
                :style="{ order: getOrder('access_type') }"
              />
              <LastUpdateRangeFilter
                v-if="isEnabled('last_update_range')"
                v-model="lastUpdateRange"
                :facets="getFacets('last_update')"
                :loading="searchResultsStatus === 'pending'"
                :style="{ order: getOrder('last_update_range') }"
              />
              <ProducerTypeFilter
                v-if="isEnabled('producer_type')"
                v-model="producerType"
                :facets="getFacets('producer_type')"
                :loading="searchResultsStatus === 'pending'"
                :style="{ order: getOrder('producer_type') }"
              />
              <DatasetBadgeFilter
                v-if="isEnabled('badge')"
                v-model="badge"
                :facets="getFacets('badge')"
                :loading="searchResultsStatus === 'pending'"
                :style="{ order: getOrder('badge') }"
              />
              <ReuseTypeFilter
                v-if="isEnabled('type')"
                v-model="reuseType"
                :facets="getFacets('type')"
                :loading="searchResultsStatus === 'pending'"
                :style="{ order: getOrder('type') }"
              />
              <slot
                name="filters"
                :is-enabled="isEnabled"
                :get-order="getOrder"
              />
            </BasicAndAdvancedFilters>
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
        class="col-span-12 mt-4 md:mt-0 search-results"
        :class="showSidebar ? 'md:col-span-8 lg:col-span-9' : ''"
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
                <option
                  v-for="option in activeSortOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
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
                      <DatasetCard :dataset="(result as Dataset)" />
                    </slot>
                  </template>
                  <template v-else-if="currentType === 'dataservices'">
                    <slot
                      name="dataservice"
                      :dataservice="result"
                    >
                      <DataserviceCard :dataservice="(result as Dataservice)" />
                    </slot>
                  </template>
                  <template v-else-if="currentType === 'reuses'">
                    <slot
                      name="reuse"
                      :reuse="result"
                    >
                      <ReuseHorizontalCard :reuse="(result as Reuse)" />
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
              <slot
                name="no-results"
                :has-filters="hasFilters"
                :reset-filters="resetFilters"
              >
                <div class="rounded p-6 flex flex-wrap gap-4 bg-blue-light text-datagouv">
                  <div class="flex-none">
                    <img
                      class="w-20"
                      :src="magnifyingGlassSrc"
                      alt=""
                    >
                  </div>
                  <div class="flex-1 min-w-48">
                    <p class="font-bold mb-2">
                      {{ t(`Vous n'avez pas trouvé ce que vous cherchez ?`) }}
                    </p>
                    <p class="mt-1 mb-3">
                      {{ t("Essayez de réinitialiser les filtres pour élargir votre recherche.") }}
                      <template v-if="showForumLink">
                        <br>
                        {{ t("Vous pouvez aussi regarder les demandes en cours et soumettre la vôtre sur notre forum dédié à la recherche et à l'ouverture de données.") }}
                      </template>
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <BrandedButton
                        color="secondary"
                        type="button"
                        @click="resetFilters"
                      >
                        {{ t("Réinitialiser les filtres") }}
                      </BrandedButton>
                      <BrandedButton
                        v-if="showForumLink"
                        color="tertiary"
                        :href="componentsConfig.forumUrl"
                        :icon="RiLightbulbLine"
                      >
                        {{ t("Voir le forum") }}
                      </BrandedButton>
                    </div>
                  </div>
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
import { computed, ref, watch, useTemplateRef, type Ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { RiCloseCircleLine, RiDatabase2Line, RiRobot2Line, RiLineChartLine, RiLightbulbLine } from '@remixicon/vue'
import magnifyingGlassSrc from '../../../assets/illustrations/magnifying_glass.svg?url'
import { useTranslation } from '../../composables/useTranslation'
import { useDebouncedRef } from '../../composables/useDebouncedRef'
import { useStableQueryParams } from '../../composables/useStableQueryParams'
import { useComponentsConfig } from '../../config'
import { useFetch } from '../../functions/api'
import { getLink } from '../../functions/pagination'
import type { Dataset } from '../../types/datasets'
import type { Dataservice } from '../../types/dataservices'
import type { Reuse } from '../../types/reuses'
import type { GlobalSearchConfig, DatasetSearchResponse, DataserviceSearchResponse, ReuseSearchResponse, FacetItem } from '../../types/search'
import { getDefaultGlobalSearchConfig } from '../../types/search'
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
import BasicAndAdvancedFilters from './BasicAndAdvancedFilters.vue'
import OrganizationSelect from '../Form/OrganizationSelect.vue'
import OrganizationTypeSelect from '../Form/OrganizationTypeSelect.vue'
import TagSelect from '../Form/TagSelect.vue'
import FormatSelect from '../Form/FormatSelect.vue'
import LicenseSelect from '../Form/LicenseSelect.vue'
import SchemaSelect from '../Form/SchemaSelect.vue'
import GeozoneSelect from '../Form/GeozoneSelect.vue'
import GranularitySelect from '../Form/GranularitySelect.vue'
import ReuseTopicSelect from '../Form/ReuseTopicSelect.vue'
import FormatFamilyFilter from './Filter/FormatFamilyFilter.vue'
import AccessTypeFilter from './Filter/AccessTypeFilter.vue'
import LastUpdateRangeFilter from './Filter/LastUpdateRangeFilter.vue'
import ProducerTypeFilter from './Filter/ProducerTypeFilter.vue'
import DatasetBadgeFilter from './Filter/DatasetBadgeFilter.vue'
import ReuseTypeFilter from './Filter/ReuseTypeFilter.vue'

const props = withDefaults(defineProps<{
  config?: GlobalSearchConfig
  placeholder?: string
}>(), {
  config: getDefaultGlobalSearchConfig,
})

const { t } = useTranslation()
const componentsConfig = useComponentsConfig()

// Initial type is used to determine which fetch should be SSR (non-lazy)
const initialType = props.config[0]?.class ?? 'datasets'
const currentType = ref<'datasets' | 'dataservices' | 'reuses'>(initialType)

const currentTypeConfig = computed(() =>
  props.config.find(c => c.class === currentType.value),
)

const activeBasicFilters = computed(() =>
  (currentTypeConfig.value?.basicFilters ?? []) as string[],
)

const activeAdvancedFilters = computed(() =>
  (currentTypeConfig.value?.advancedFilters ?? []) as string[],
)

const activeSortOptions = computed(() =>
  currentTypeConfig.value?.sortOptions ?? [],
)

const activeFilters = computed(() => [
  ...(currentTypeConfig.value?.basicFilters ?? []),
  ...(currentTypeConfig.value?.advancedFilters ?? []),
] as string[])

const showSidebar = computed(() => props.config.length > 1 || activeFilters.value.length > 0)

// URL query params
const q = useRouteQuery<string>('q', '')
const { debounced: qDebounced, flush: flushQ } = useDebouncedRef(q, componentsConfig.searchDebounce ?? 300)
const page = useRouteQuery('page', 1, { transform: Number })
const sort = useRouteQuery<string | undefined>('sort')

// Filter values
const organizationId = useRouteQuery<string | undefined>('organization')
const organizationType = useRouteQuery<string | undefined>('organization_badge')
const tag = useRouteQuery<string | undefined>('tag')
const format = useRouteQuery<string | undefined>('format')
const license = useRouteQuery<string | undefined>('license')
const schema = useRouteQuery<string | undefined>('schema')
const geozone = useRouteQuery<string | undefined>('geozone')
const granularity = useRouteQuery<string | undefined>('granularity')
const badge = useRouteQuery<string | undefined>('badge')
const topic = useRouteQuery<string | undefined>('topic')

// New simple filters
const formatFamily = useRouteQuery<string | undefined>('format_family')
const accessType = useRouteQuery<string | undefined>('access_type')
const lastUpdateRange = useRouteQuery<string | undefined>('last_update_range')
const producerType = useRouteQuery<string | undefined>('producer_type')
const reuseType = useRouteQuery<string | undefined>('type')

const pageSize = 20

// All filter values as a record
const allFilters: Record<string, Ref<unknown>> = {
  organization: organizationId,
  organization_badge: organizationType,
  tag,
  format,
  license,
  schema,
  geozone,
  granularity,
  badge,
  topic,
  format_family: formatFamily,
  access_type: accessType,
  last_update_range: lastUpdateRange,
  producer_type: producerType,
  type: reuseType,
}

// Reset sort and filters when changing type if they're not valid for the new type
watch(currentType, () => {
  // Reset sort if not valid
  const validSortValues = activeSortOptions.value.map(o => o.value as string)
  if (sort.value && !validSortValues.includes(sort.value)) {
    sort.value = undefined
  }

  // Reset filters that are not enabled for the new type
  for (const [filterName, filterRef] of Object.entries(allFilters)) {
    if (filterRef.value !== undefined && !activeFilters.value.includes(filterName)) {
      filterRef.value = undefined
    }
  }
})

// Check which types are enabled
const datasetsEnabled = computed(() => props.config.some(c => c.class === 'datasets'))
const dataservicesEnabled = computed(() => props.config.some(c => c.class === 'dataservices'))
const reusesEnabled = computed(() => props.config.some(c => c.class === 'reuses'))

// Create stable params for each type
const stableParamsOptions = {
  allFilters,
  q: qDebounced,
  sort,
  page,
  pageSize,
}

const datasetsParams = useStableQueryParams({
  ...stableParamsOptions,
  typeConfig: props.config.find(c => c.class === 'datasets'),
})
const dataservicesParams = useStableQueryParams({
  ...stableParamsOptions,
  typeConfig: props.config.find(c => c.class === 'dataservices'),
})
const reusesParams = useStableQueryParams({
  ...stableParamsOptions,
  typeConfig: props.config.find(c => c.class === 'reuses'),
})

// URLs that return null when type is not enabled
const datasetsUrl = computed(() => datasetsEnabled.value ? '/api/2/datasets/search/' : null)
const dataservicesUrl = computed(() => dataservicesEnabled.value ? '/api/2/dataservices/search/' : null)
const reusesUrl = computed(() => reusesEnabled.value ? '/api/2/reuses/search/' : null)

// Reset page on filter/sort change
const filtersForReset = computed(() => ({
  q: qDebounced.value,
  organization: organizationId.value,
  organization_badge: organizationType.value,
  tag: tag.value,
  format: format.value,
  license: license.value,
  schema: schema.value,
  geozone: geozone.value,
  granularity: granularity.value,
  badge: badge.value,
  topic: topic.value,
  format_family: formatFamily.value,
  access_type: accessType.value,
  last_update_range: lastUpdateRange.value,
  producer_type: producerType.value,
  type: reuseType.value,
}))

watch(filtersForReset, () => page.value = 1)
watch(sort, () => page.value = 1)

const hasFilters = computed(() => {
  return q.value
    || organizationId.value
    || organizationType.value
    || tag.value
    || format.value
    || license.value
    || schema.value
    || geozone.value
    || granularity.value
    || badge.value
    || topic.value
    || formatFamily.value
    || accessType.value
    || lastUpdateRange.value
    || producerType.value
    || reuseType.value
})

const showForumLink = computed(() => currentType.value === 'datasets' && !!componentsConfig.forumUrl)

function resetFilters() {
  organizationId.value = undefined
  organizationType.value = undefined
  tag.value = undefined
  format.value = undefined
  license.value = undefined
  schema.value = undefined
  geozone.value = undefined
  granularity.value = undefined
  badge.value = undefined
  topic.value = undefined
  formatFamily.value = undefined
  accessType.value = undefined
  lastUpdateRange.value = undefined
  producerType.value = undefined
  reuseType.value = undefined
  q.value = ''
  flushQ()
}

// API calls only for enabled types (useFetch skips when URL is null)
// Only the initial type is fetched during SSR, others are client-side only
const { data: datasetsResults, status: datasetsStatus } = await useFetch<DatasetSearchResponse<Dataset>>(
  datasetsUrl,
  { params: datasetsParams, server: initialType === 'datasets' },
)
const { data: dataservicesResults, status: dataservicesStatus } = await useFetch<DataserviceSearchResponse<Dataservice>>(
  dataservicesUrl,
  { params: dataservicesParams, server: initialType === 'dataservices' },
)
const { data: reusesResults, status: reusesStatus } = await useFetch<ReuseSearchResponse<Reuse>>(
  reusesUrl,
  { params: reusesParams, server: initialType === 'reuses' },
)

const typesMeta = {
  datasets: {
    icon: RiDatabase2Line,
    name: t('Jeux de données'),
    results: datasetsResults,
    status: datasetsStatus,
  },
  dataservices: {
    icon: RiRobot2Line,
    name: t('APIs'),
    results: dataservicesResults,
    status: dataservicesStatus,
  },
  reuses: {
    icon: RiLineChartLine,
    name: t('Réutilisations'),
    results: reusesResults,
    status: reusesStatus,
  },
} as const

const searchResults = computed(() => typesMeta[currentType.value].results.value)
const searchResultsStatus = computed(() => typesMeta[currentType.value].status.value)

// Facets for filters
const currentFacets = computed(() => searchResults.value?.facets)

function getFacets(key: string): FacetItem[] | undefined {
  if (!currentFacets.value) return undefined
  return (currentFacets.value as Record<string, FacetItem[]>)[key]
}

// Scroll handling
const searchRef = useTemplateRef('search')

function scrollToTop() {
  searchRef.value?.scrollIntoView({ behavior: 'smooth' })
}

function changePage(newPage: number) {
  page.value = newPage
  scrollToTop()
}
</script>
