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
                v-for="typeConfig in config"
                :key="typeConfig.class"
                :value="typeConfig.class"
                :count="typesMeta[typeConfig.class].results.value?.total"
                :icon="typesMeta[typeConfig.class].icon"
              >
                {{ typeConfig.name || typesMeta[typeConfig.class].name }}
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
              <BadgeSelect
                v-if="isEnabled('badge')"
                v-model:id="badge"
                :style="{ order: getOrder('badge') }"
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
import { useRouteQueryBoolean } from '../../composables/useRouteQueryBoolean'
import { useDebouncedRef } from '../../composables/useDebouncedRef'
import { useStableQueryParams } from '../../composables/useStableQueryParams'
import { useComponentsConfig } from '../../config'
import { useFetch } from '../../functions/api'
import { getLink } from '../../functions/pagination'
import type { PaginatedArray } from '../../types/api'
import type { Dataset } from '../../types/datasets'
import type { Dataservice } from '../../types/dataservices'
import type { Reuse } from '../../types/reuses'
import type { GlobalSearchConfig } from '../../types/search'
import { defaultDatasetSortOptions, defaultDataserviceSortOptions, defaultReuseSortOptions } from '../../types/search'
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
import TagSelect from '../Form/TagSelect.vue'
import FormatSelect from '../Form/FormatSelect.vue'
import LicenseSelect from '../Form/LicenseSelect.vue'
import SchemaSelect from '../Form/SchemaSelect.vue'
import GeozoneSelect from '../Form/GeozoneSelect.vue'
import GranularitySelect from '../Form/GranularitySelect.vue'
import BadgeSelect from '../Form/BadgeSelect.vue'

const props = withDefaults(defineProps<{
  config?: GlobalSearchConfig
  placeholder?: string
}>(), {
  config: () => [
    { class: 'datasets', basicFilters: ['organization', 'organization_badge'], sortOptions: defaultDatasetSortOptions },
    { class: 'dataservices', basicFilters: ['organization', 'is_restricted'], sortOptions: defaultDataserviceSortOptions },
    { class: 'reuses', basicFilters: ['organization'], sortOptions: defaultReuseSortOptions },
  ],
})

const { t } = useTranslation()
const componentsConfig = useComponentsConfig()

const currentType = ref<'datasets' | 'dataservices' | 'reuses'>(props.config[0]?.class ?? 'datasets')

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

// URL query params
const q = useRouteQuery<string>('q', '')
const { debounced: qDebounced, flush: flushQ } = useDebouncedRef(q, componentsConfig.searchDebounce ?? 300)
const page = useRouteQuery('page', 1, { transform: Number })
const sort = useRouteQuery<string | undefined>('sort')

// Filter values
const organizationId = useRouteQuery<string | undefined>('organization')
const organizationType = useRouteQuery<string | undefined>('organization_badge')
const isRestricted = useRouteQueryBoolean('is_restricted')
const tag = useRouteQuery<string | undefined>('tag')
const format = useRouteQuery<string | undefined>('format')
const license = useRouteQuery<string | undefined>('license')
const schema = useRouteQuery<string | undefined>('schema')
const geozone = useRouteQuery<string | undefined>('geozone')
const granularity = useRouteQuery<string | undefined>('granularity')
const badge = useRouteQuery<string | undefined>('badge')

const pageSize = 20

const restrictedOptions = [
  { value: undefined, label: t(`Toutes les modalités d'accès`) },
  { value: false, label: t('Les API ouvertes à tous') },
  { value: true, label: t('Les API en accès restreint') },
]

// All filter values as a record
const allFilters: Record<string, Ref<unknown>> = {
  organization: organizationId,
  organization_badge: organizationType,
  is_restricted: isRestricted,
  tag,
  format,
  license,
  schema,
  geozone,
  granularity,
  badge,
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

// Reset page on filter/sort change
const filtersForReset = computed(() => ({
  q: qDebounced.value,
  organization: organizationId.value,
  organization_badge: organizationType.value,
  is_restricted: isRestricted.value,
  tag: tag.value,
  format: format.value,
  license: license.value,
  schema: schema.value,
  geozone: geozone.value,
  granularity: granularity.value,
  badge: badge.value,
}))

watch(filtersForReset, () => page.value = 1)
watch(sort, () => page.value = 1)

const hasFilters = computed(() => {
  return q.value
    || organizationId.value
    || organizationType.value
    || isRestricted.value !== undefined
    || tag.value
    || format.value
    || license.value
    || schema.value
    || geozone.value
    || granularity.value
    || badge.value
})

const showForumLink = computed(() => currentType.value === 'datasets' && !!componentsConfig.forumUrl)

function resetFilters() {
  organizationId.value = undefined
  organizationType.value = undefined
  isRestricted.value = undefined
  tag.value = undefined
  format.value = undefined
  license.value = undefined
  schema.value = undefined
  geozone.value = undefined
  granularity.value = undefined
  badge.value = undefined
  q.value = ''
  flushQ()
}

// API calls for all 3 types with their specific params
const { data: datasetsResults, status: datasetsStatus } = await useFetch<PaginatedArray<Dataset>>(
  '/api/2/datasets/search/',
  { params: datasetsParams },
)
const { data: dataservicesResults, status: dataservicesStatus } = await useFetch<PaginatedArray<Dataservice>>(
  '/api/2/dataservices/search/',
  { params: dataservicesParams },
)
const { data: reusesResults, status: reusesStatus } = await useFetch<PaginatedArray<Reuse>>(
  '/api/2/reuses/search/',
  { params: reusesParams },
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
