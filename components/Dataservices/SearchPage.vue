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
        v-model="queryString"
        :placeholder="organization ? t(`Recherche une API de l'organisation`) : t('Ex : élection présidentielle 2022')"
      />
    </div>
    <div class="grid grid-cols-12 mt-2 md:mt-5">
      <div class="col-span-12 md:col-span-4 lg:col-span-3">
        <Sidemenu :button-text="t('Filtres')">
          <template #title>
            {{ t('Filtres') }}
          </template>
          <div class="space-y-4">
            <OrganizationSelect
              v-if="!organization"
              v-model="facets.organization"
              :organizations="organizations?.data ?? []"
              :loading="organizationsStatus === 'pending'"
            />
            <SelectGroup
              v-model="facets.isRestricted"
              :label="t('Accès')"
              :options="[
                { value: undefined, label: t(`Toutes les modalités d'accès`) },
                { value: false, label: t('Les API ouvertes à tous') },
                { value: true, label: t('Les API en accès restreint') },
              ]"
            />
            <div
              v-if="isFiltered"
              class="mb-6 text-center"
            >
              <BrandedButton
                v-if="isFiltered"
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
                v-model="searchSort"
                class="fr-select !shadow-input-blue"
                name="sort"
                @change="currentPage = 1"
              >
                <option value="">
                  {{ t('Pertinence') }}
                </option>
                <option
                  v-for="{ value, label } in sortOptions"
                  :key="label"
                  :value="value"
                >
                  {{ label }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <transition mode="out-in">
          <LoadingBlock :status="searchResultsStatus">
            <div v-if="searchResults && searchResults.data.length">
              <ul class="mt-2 p-0 border-t border-gray-default relative z-2 list-none">
                <li
                  v-for="result in searchResults.data"
                  :key="result.id"
                  class="p-0"
                >
                  <DataservicesCard :dataservice="result" />
                </li>
              </ul>
              <Pagination
                v-if="searchResults && searchResults.total > pageSize"
                :page="currentPage"
                :page-size="pageSize"
                :total-results="searchResults.total"
                class="mt-4"
                :link="getLink"
                @change="changePage"
              />
              <SearchNoResults
                v-else-if="!organization"
                :forum-url="config.public.forumUrl"
                @reset-filters="resetForm"
              />
            </div>
            <div
              v-else-if="!organization"
              class="mt-4"
            >
              <SearchNoResults
                :forum-url="config.public.forumUrl"
                @reset-filters="resetForm"
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
import { BrandedButton, LoadingBlock, Pagination, getLink } from '@datagouv/components-next'
import type { Dataservice, Organization, OrganizationOrSuggest, OrganizationSuggest } from '@datagouv/components-next'
import { RiCloseCircleLine } from '@remixicon/vue'
import { computedAsync, debouncedRef, useUrlSearchParams } from '@vueuse/core'
import SearchInput from '~/components/Search/SearchInput.vue'
import type { PaginatedArray } from '~/types/types'
import type { DataserviceSearchParams } from '~/types/form'
import SelectGroup from '~/components/Form/SelectGroup/SelectGroup.vue'

const props = defineProps<{
  organization?: Organization
}>()

type Facets = {
  isRestricted?: boolean
  organization?: OrganizationOrSuggest | null
}

const route = useRoute()
const { t } = useTranslation()
const config = useRuntimeConfig()
const { toast } = useToast()
const { $api } = useNuxtApp()

async function suggestOrganizations(q: string) {
  return await $api<Array<OrganizationSuggest>>('/api/1/organizations/suggest/', {
    query: {
      q,
      size: 20,
    },
  })
}

const params = useUrlSearchParams<DataserviceSearchParams>('history', {
  initialValue: route.query,
  removeNullishValues: true,
  removeFalsyValues: true,
})

const nonFalsyParams = computed(() => {
  const filteredParams = Object.entries(toValue(params)).filter(([_k, v]) => v !== undefined && v !== '')
  const propsParams = props.organization ? { organization: props.organization.id } : {}
  return { ...propsParams, ...Object.fromEntries(filteredParams), page_size: pageSize }
})

const { data: searchResults, status: searchResultsStatus, refresh } = await useAPI<PaginatedArray<Dataservice>>('/api/2/dataservices/search/', {
  params: nonFalsyParams,
  lazy: true,
})

const { data: organizations, status: organizationsStatus } = await useAPI<PaginatedArray<Organization>>('/api/1/organizations/?sort=-followers', { lazy: true })

/**
 * Search query
 */
const queryString = ref('')
watchEffect(() => {
  // We use route.query here instead of params because params doesn't change when Nuxt
  // navigates between page (for exemple when we use the search menu to search for a dataservice
  // while in the dataservice search page)
  if (Array.isArray(route.query.q)) return
  if (!route.query.q) return
  queryString.value = route.query.q
})

const deboucedQuery = debouncedRef(queryString, config.public.searchAutocompleteDebounce)

/**
 * Query sort
 */
const searchSort = ref(params.sort ?? '')

/**
 * Current page of results
 */
const currentPage = ref(params.page ? parseInt(params.page) : 1)

/**
 * Search page size
 */
const pageSize = 20

// Initialize facets from params
const organizationFromParams = computed(() => organizations.value?.data.find(org => org.id === params.organization))

const organizationFromSuggest = computedAsync<OrganizationOrSuggest | null>(async () => {
  if (!props.organization && !organizationFromParams.value && params.organization) {
    const suggested = await suggestOrganizations(params.organization)
    if (suggested && suggested.length > 0) {
      return suggested[0]
    }
  }
  return null
}, null)

const facets = ref<Facets>({
  organization: null,
  isRestricted: params.is_restricted,
})

/**
 * Vue ref to results HTML
 */
const searchRef = useTemplateRef('search')

/**
 * Called when user type in search field
 */
watch([deboucedQuery, facets], () => {
  currentPage.value = 1
}, { deep: true })

/**
 * Change current page
 */
function changePage(page: number) {
  currentPage.value = page
  scrollToTop()
}

function scrollToTop() {
  if (searchRef.value) {
    searchRef.value.scrollIntoView({ behavior: 'smooth' })
  }
}

function reloadFilters() {
  facets.value.organization = props.organization
  facets.value.isRestricted = undefined
  currentPage.value = 1
  searchSort.value = ''
}

function resetFilters() {
  reloadFilters()
}

function resetForm() {
  queryString.value = ''
  reloadFilters()
  scrollToTop()
}

/**
 * Is any filter active ?
 * We don't count scoped search as being filtered
 */
const isFiltered = computed(() => {
  const keys = Object.keys(facets.value) as Array<keyof Facets>
  return keys.some(
    key => key in facets.value && (facets.value[key] || facets.value[key] === false) && (props.organization ? key !== 'organization' : true),
  )
})
const sortOptions = [
  { label: t('Date de création'), value: '-created' },
]

watchEffect(() => {
  facets.value.organization = props.organization ?? organizationFromParams.value ?? organizationFromSuggest.value
})

// Update model params
watchEffect(() => {
  if (!props.organization) {
    params.organization = facets.value.organization?.id ?? undefined
  }
  params.is_restricted = facets.value.isRestricted
  if (currentPage.value > 1 || params.page) params.page = currentPage.value.toString()
  params.q = deboucedQuery.value ?? undefined
  params.sort = searchSort.value ?? null
  return params
})

watch(searchResultsStatus, () => {
  if (searchResultsStatus.value === 'error') {
    toast.error(t(`La recherche a échoué`))
  }
})
</script>
