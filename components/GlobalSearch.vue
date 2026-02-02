<template>
  <form
    v-if="!organization || organization.metrics.dataservices"
    class="group/form"
    data-input-color="blue"
    @submit.prevent="() => refresh()"
  >
    <div
      ref="search"
      class="flex flex-wrap items-center justify-between"
      data-cy="search"
    >
      <SearchInput
        v-model="q"
        :placeholder="organization ? t(`Recherche dans l'organisation`) : t('Ex : élection présidentielle 2022')"
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
              v-model="type"
              name="search-type"
            >
              <RadioInput
                value="datasets"
                :count="datasetsSearchResults?.total"
              >
                <template #icon>
                  <RiDatabase2Line class="w-4 h-4" />
                </template>
                {{ t('Jeux de données') }}
              </RadioInput>
              <RadioInput
                value="dataservices"
                :count="dataservicesSearchResults?.total"
              >
                <template #icon>
                  <RiRobot2Line class="w-4 h-4" />
                </template>
                {{ t('APIs') }}
              </RadioInput>
              <RadioInput
                value="reuses"
                :count="reusesSearchResults?.total"
              >
                <template #icon>
                  <RiLineChartLine class="w-4 h-4" />
                </template>
                {{ t('Réutilisations') }}
              </RadioInput>
            </RadioGroup>
          </Sidemenu>
        </div>

        <div>
          <Sidemenu :button-text="t('Filtres')">
            <template #title>
              {{ t('Filtres') }}
            </template>
            <div class="space-y-4">
              <OrganizationSelect
                v-if="!organization"
                v-model:id="organizationId"
              />
              <SelectGroup
                v-model="isRestricted"
                :label="t('Accès')"
                :options="[
                  { value: undefined, label: t(`Toutes les modalités d'accès`) },
                  { value: false, label: t('Les API ouvertes à tous') },
                  { value: true, label: t('Les API en accès restreint') },
                ]"
              />
              <div
                v-if="hasFilters"
                class="mb-6 text-center"
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
            </div>
          </Sidemenu>
        </div>
      </div>
      <section
        ref="results"
        class="col-span-12 md:col-span-8 lg:col-span-9 mt-4 md:mt-0 search-results"
        v-bind="$attrs"
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
                  {{ $t('Date de création') }}
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
                  <DatasetCard
                    v-if="type === 'datasets'"
                    :dataset="result"
                  />
                  <DataservicesCard
                    v-if="type === 'dataservices'"
                    :dataservice="result"
                  />
                  <ReuseHorizontalCard
                    v-if="type === 'reuses'"
                    :reuse="result"
                  />
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
              <SearchNoResults
                v-else-if="!organization"
                :forum-url="config.public.forumUrl"
                @reset-filters="resetFilters"
              />
            </div>
            <div
              v-else-if="!organization"
              class="mt-4"
            >
              <SearchNoResults
                :forum-url="config.public.forumUrl"
                @reset-filters="resetFilters"
              />
            </div>
          </LoadingBlock>
        </transition>
      </section>
    </div>
  </form>
  <div
    v-else
    class="flex flex-col items-center lg:pt-12"
  >
    <NuxtImg
      src="/illustrations/schema.svg"
      width="137"
      height="117"
    />
    <p class="mt-4 mb-5 font-bold text-lg">
      {{ $t(`Cette organisation n'a pas encore publié d'APIs.`) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, LoadingBlock, Pagination, RadioGroup, RadioInput, getLink, DatasetCard, ReuseHorizontalCard } from '@datagouv/components-next'
import type { Dataservice, Dataset, Organization, Reuse } from '@datagouv/components-next'
import { RiCloseCircleLine, RiDatabase2Line, RiRobot2Line, RiLineChartLine } from '@remixicon/vue'
import SearchInput from '~/components/Search/SearchInput.vue'
import type { PaginatedArray } from '~/types/types'
import SelectGroup from '~/components/Form/SelectGroup/SelectGroup.vue'
import { useRouteQuery } from '@vueuse/router'
import { omitEmpty } from '../utils/helpers'
import { useRouteQueryBoolean } from '../composables/useRouteQueryBoolean'
import { useDebouncedRef } from '../composables/useDebouncedRef'

const props = defineProps<{
  organization?: Organization
}>()

const { t } = useTranslation()
const config = useRuntimeConfig()

const type = ref<'datasets' | 'dataservices' | 'reuses'>('datasets')

const q = useRouteQuery<string>('q', '', { transform: String })
const { debounced: qDebounced, flush: flushQ } = useDebouncedRef(q, config.public.searchDebounce)

const page = useRouteQuery('page', 1, { transform: Number })
const sort = useRouteQuery<undefined | '-created'>('sort')
const isRestricted = useRouteQueryBoolean('is_restricted')
const organizationId = useRouteQuery<string | undefined>('organization')

const pageSize = 20

const filters = computed(() => {
  return omitEmpty({
    q: qDebounced.value,
    is_restricted: isRestricted.value,
    organization: props.organization?.id ?? organizationId.value,
  })
})

watch(filters, () => page.value = 1)
watch(sort, () => page.value = 1)

const hasFilters = computed(() => {
  const keys = Object.keys(filters.value)
  return keys.some(key => props.organization ? key !== 'organization' : true)
})

const params = computed(() => {
  return {
    ...filters.value,
    sort: sort.value,
    page: page.value,
    page_size: pageSize,
  }
})

watch(params, () => scrollToTop())

function resetFilters() {
  q.value = ''
  isRestricted.value = undefined
  organizationId.value = undefined
  flushQ()
}

const { data: datasetsSearchResults, status: datasetsSearchResultsStatus, refresh: datasetsRefresh } = await useAPI<PaginatedArray<Dataset>>('/api/2/datasets/search/', {
  params: params,
  lazy: true,
})
const { data: dataservicesSearchResults, status: dataservicesSearchResultsStatus, refresh: dataservicesRefresh } = await useAPI<PaginatedArray<Dataservice>>('/api/2/dataservices/search/', {
  params: params,
  lazy: true,
})
const { data: reusesSearchResults, status: reusesSearchResultsStatus, refresh: reusesRefresh } = await useAPI<PaginatedArray<Reuse>>('/api/2/reuses/search/', {
  params: params,
  lazy: true,
})

const searchResults = computed(() => ({
  datasets: datasetsSearchResults.value,
  dataservices: dataservicesSearchResults.value,
  reuses: reusesSearchResults.value,
}[type.value]))
const searchResultsStatus = computed(() => ({
  datasets: datasetsSearchResultsStatus.value,
  dataservices: dataservicesSearchResultsStatus.value,
  reuses: reusesSearchResultsStatus.value,
}[type.value]))

const refresh = () => {
  datasetsRefresh()
  dataservicesRefresh()
  reusesRefresh()
}

const searchRef = useTemplateRef('search')

function scrollToTop() {
  if (searchRef.value) {
    searchRef.value.scrollIntoView({ behavior: 'smooth' })
  }
}

function changePage(newPage: number) {
  page.value = newPage
}
</script>
