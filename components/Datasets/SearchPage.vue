<template>
  <form
    v-if="!organization || organization.metrics.datasets"
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
        :placeholder="organization ? t(`Rechercher un jeu de données de l'organisation`) : t('Ex : élection présidentielle 2022')"
      />
    </div>
    <div class="grid grid-cols-12 mt-2 md:mt-5">
      <div class="col-span-12 md:col-span-4 lg:col-span-3">
        <Sidemenu :button-text="t('Filtres')">
          <template #title>
            {{ t('Filtres') }}
          </template>
          <div class="space-y-4">
            <template v-if="!organization">
              <OrganizationSelect
                v-model="facets.organization"
                :organizations="organizations?.data ?? []"
                :loading="organizationsStatus === 'pending'"
              />
              <SearchableSelect
                v-model="facets.organizationType"
                :options="organizationTypes"
                :label="t(`Type d'organisation`)"
                :placeholder="t('Tous les types')"
                :get-option-id="(type) => type.type"
                :display-value="(value) => value.label"
                :multiple="false"
              >
                <template #option="{ option: type }">
                  {{ type.label }}
                </template>
              </SearchableSelect>
            </template>
            <SearchableSelect
              v-model="facets.tag"
              :label="t('Mots clés')"
              :placeholder="t('Tous les mots clés')"
              :get-option-id="(tag) => tag"
              :display-value="(value) => value"
              :suggest="suggestTags"
              :multiple="false"
            >
              <template #option="{ option: tag }">
                {{ tag }}
              </template>
            </SearchableSelect>
            <SearchableSelect
              v-model="facets.format"
              :label="t('Formats')"
              :placeholder="t('Tous les formats')"
              :options="allowedFormats ? allowedFormats : []"
              :loading="allowedFormatsStatus === 'pending'"
              :get-option-id="(format) => format"
              :display-value="(value) => value"
              :multiple="false"
            >
              <template #option="{ option: format }">
                {{ format }}
              </template>
            </SearchableSelect>
            <SearchableSelect
              v-model="facets.license"
              :label="t('Licences')"
              :explanation="t('Les licences définissent les règles de réutilisation des jeux de données publiés. Voir la page data.gouv.fr/licences')"
              :placeholder="t('Toutes les licences')"
              :display-value="(value) => value.title"
              :options="licenses ? licenses : []"
              :loading="licensesStatus === 'pending'"
              :multiple="false"
            >
              <template #option="{ option: license }">
                {{ license.title }}
              </template>
            </SearchableSelect>
            <SearchableSelect
              v-model="facets.schema"
              :label="t('Schéma')"
              :explanation="t('Les schémas de données permettent de décrire des modèles de données : quels sont les différents champs, comment sont représentées les données, quelles sont les valeurs possibles etc. Voir schema.data.gouv.fr')"
              :display-value="(value) => value.name"
              :get-option-id="(option) => option.name"
              :placeholder="t('Tous les schémas')"
              :options="schemas ? schemas : []"
              :loading="schemasStatus === 'pending'"
              :multiple="false"
            >
              <template #option="{ option: schema }">
                {{ schema.name }}
              </template>
            </SearchableSelect>
            <SearchableSelect
              v-model="facets.geozone"
              :label="t('Couverture spatiale')"
              :placeholder="t('Toutes les couvertures')"
              :suggest="suggestSpatialCoverages"
              :get-option-id="(coverage) => coverage.id"
              :display-value="(value) => value.name"
              :multiple="false"
            >
              <template #option="{ option: coverage }">
                <div class="flex-1">
                  {{ coverage.name }}
                </div>
                <code class="bg-gray-some text-gray-medium p-1">{{ coverage.code }}</code>
              </template>
            </SearchableSelect>
            <SearchableSelect
              v-model="facets.granularity"
              :label="t('Granularité spatiale')"
              :placeholder="t('Toutes les granularités')"
              :get-option-id="(granularity) => granularity.id"
              :display-value="(value) => value.name"
              :multiple="false"
              :options="spatialGranularities ? spatialGranularities : []"
              :loading="spatialGranularitiesStatus === 'pending'"
            >
              <template #option="{ option: granularity }">
                {{ granularity.name }}
              </template>
            </SearchableSelect>
            <SearchableSelect
              v-model="facets.badge"
              :label="t('Label de données')"
              :placeholder="t('Tous les badges')"
              :get-option-id="(badge) => badge.kind"
              :display-value="(value) => value.label"
              :multiple="false"
              :options="badges ? badges : []"
              :loading="badgeStatus === 'pending'"
              data-testid="dataset-label-filter"
            >
              <template #option="{ option: badge }">
                {{ badge.label }}
              </template>
            </SearchableSelect>
            <div
              v-if="isFiltered || organization"
              class="pb-6 text-center"
            >
              <BrandedButton
                v-if="isFiltered"
                color="secondary"
                :icon="RiCloseCircleLine"
                class="w-full justify-center"
                @click="resetFilters"
              >
                {{ t('Réinitialiser les filtres') }}
              </BrandedButton>
              <BrandedButton
                v-else-if="organization"
                :href="`${config.public.apiBase}/api/1/organizations/${organization.slug}/datasets.csv`"
                color="secondary"
                :external="true"
                :icon="RiDownloadLine"
              >
                {{ t('Télécharger la liste en CSV') }}
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
            data-testid="result-count"
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
              <ul
                class="space-y-4 mt-2 pt-2 p-0 border-t border-gray-default relative z-2 list-none"
                data-testid="results"
              >
                <li
                  v-for="result in searchResults.data"
                  :key="result.id"
                  class="p-0"
                >
                  <DatasetCardLg :dataset="result" />
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
                v-else-if="!organization && searchResultsStatus !== 'pending'"
                class="mt-4"
                :forum-url="config.public.forumUrl"
                @reset-filters="resetForm"
              />
            </div>
            <SearchNoResults
              v-else-if="searchResultsStatus !== 'pending'"
              :forum-url="config.public.forumUrl"
              @reset-filters="resetForm"
            />
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
      {{ $t(`Cette organisation n'a pas encore publié de jeux de données.`) }}
    </p>
    <BrandedButton
      color="secondary"
      :href="config.public.datasetPublishingGuideUrl"
    >
      {{ $t(`Qu'est-ce qu'un jeu de données ?`) }}
    </BrandedButton>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, getLink, getOrganizationTypes, LoadingBlock, Pagination, OTHER, USER } from '@datagouv/components-next'
import type { DatasetV2, License, Organization, OrganizationTypes, RegisteredSchema, TranslatedBadge, OrganizationOrSuggest } from '@datagouv/components-next'
import { ref, computed } from 'vue'
import { RiCloseCircleLine, RiDownloadLine } from '@remixicon/vue'
import { computedAsync, debouncedRef, useUrlSearchParams } from '@vueuse/core'
import SearchInput from '~/components/Search/SearchInput.vue'
import type { PaginatedArray, SpatialGranularity, SpatialZone, Tag } from '~/types/types'
import type { DatasetSearchParams } from '~/types/form'

const props = defineProps<{
  organization?: Organization
}>()

type Facets = {
  organization?: { id: string } | null
  organizationType?: { type: OrganizationTypes } | null
  tag?: string | null
  license?: License | null
  format?: string | null
  geozone?: SpatialZone | null
  granularity?: SpatialGranularity | null
  schema?: RegisteredSchema | null
  badge?: TranslatedBadge | null
}

const { $api } = useNuxtApp()
const { t } = useTranslation()
const config = useRuntimeConfig()
const { toast } = useToast()

const route = useRoute()
const params = useUrlSearchParams<DatasetSearchParams>('history', {
  initialValue: route.query,
  removeNullishValues: true,
  removeFalsyValues: true,
})

const nonFalsyParams = computed(() => {
  const filteredParams = Object.entries(toValue(params)).filter(([_k, v]) => v)
  const propsParams = props.organization ? { organization: props.organization.id } : {}
  return { ...propsParams, ...Object.fromEntries(filteredParams), page_size: pageSize }
})

const { data: searchResults, status: searchResultsStatus, refresh } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets/search/', {
  params: nonFalsyParams,
  lazy: true,
})

const { data: allowedFormats, status: allowedFormatsStatus } = await useAPI<Array<string>>('/api/1/datasets/extensions/', { lazy: true })

const { data: spatialGranularities, status: spatialGranularitiesStatus } = await useAPI<Array<SpatialGranularity>>('/api/1/spatial/granularities/', { lazy: true })

const { data: schemas, status: schemasStatus } = await useAPI<Array<RegisteredSchema>>('api/1/datasets/schemas/', { lazy: true })

const { data: licenses, status: licensesStatus } = await useAPI<Array<License>>('api/1/datasets/licenses/', { lazy: true })

const { data: organizations, status: organizationsStatus } = await useAPI<PaginatedArray<Organization>>('/api/1/organizations/?sort=-followers', { lazy: true })

const { data: badgeRecord, status: badgeStatus } = await useAPI<Record<string, string>>('/api/1/datasets/badges/', { lazy: true })

const badges = computed(() => badgeRecord.value
  ? Object.entries(badgeRecord.value)
      .map(([kind, label]: Array<string>) => ({ kind, label }))
      .filter(({ kind }) => {
        const badges = Array.isArray(config.public.datasetBadges) ? config.public.datasetBadges : config.public.datasetBadges.split(',')
        return badges.includes(kind)
      })
  : [])

const organizationTypes = getOrganizationTypes()
  .filter(type => type.type !== OTHER && type.type !== USER)

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
    try {
      return await $api<Organization>(`/api/1/organizations/${params.organization}/`)
    }
    catch {
      return null
    }
  }
  return null
}, null)

const organizationTypeFromParams = organizationTypes.find(type => type.type === params.organization_badge) as (Omit<ReturnType<typeof getOrganizationTypes>[number], 'type'> & { type: OrganizationTypes }) | undefined

const licenseFromParams = computed(() => licenses.value?.find(license => license.id === params.license) ?? null)

const schemaFromParams = computed(() => schemas.value?.find(schema => schema.name === params.schema) ?? null)

const badgeFromParams = computed(() => badges.value?.find(badge => badge.kind === params.badge) ?? null)

let spatialCoverageFromSuggest: SpatialZone | undefined
if (params.geozone) {
  const suggested = await suggestSpatialCoverages(params.geozone)
  if (suggested && suggested.length > 0) {
    spatialCoverageFromSuggest = suggested[0]
  }
}

const granularityFromParams = computed(() => spatialGranularities.value?.find(granularity => granularity.id === params.granularity))

const facets = ref<Facets>({
  organization: null,
  organizationType: organizationTypeFromParams,
  tag: params.tag,
  format: params.format,
  license: null,
  schema: null,
  geozone: spatialCoverageFromSuggest,
  granularity: null,
  badge: null,
})

watchEffect(() => {
  facets.value.organization = props.organization ?? organizationFromParams.value ?? organizationFromSuggest.value
  facets.value.license = licenseFromParams.value
  facets.value.schema = schemaFromParams.value
  facets.value.granularity = granularityFromParams.value
  facets.value.badge = badgeFromParams.value
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

async function suggestSpatialCoverages(query: string) {
  return await $api<Array<SpatialZone>>('/api/1/spatial/zones/suggest/', {
    query: {
      q: query,
      size: 20,
    },
  })
}

async function suggestTags(query: string) {
  const tags = await $api<Array<Tag>>('/api/1/tags/suggest/', {
    query: {
      q: query,
      size: 20,
    },
  })
  return tags.map(tag => tag.text)
}

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
  for (const key in facets.value) {
    facets.value[key as keyof Facets] = null
  }
  if (props.organization) {
    facets.value.organization = props.organization
  }
  currentPage.value = 1
  searchSort.value = ''
}

function resetFilters() {
  reloadFilters()
}

function resetForm() {
  queryString.value = ''
  reloadFilters()
}

/**
 * Is any filter active ?
 * We don't count scoped search as being filtered
 */
const isFiltered = computed(() => {
  const keys = Object.keys(facets.value) as Array<keyof Facets>
  return keys.some(
    key => key in facets.value && facets.value[key] && (props.organization ? key !== 'organization' : true),
  )
})

const sortOptions = [
  { label: t('Date de création'), value: '-created' },
  { label: t('Dernière mise à jour'), value: '-last_update' },
  { label: t(`Nombre d'abonnés`), value: '-followers' },
  { label: t('Nombre de réutilisations'), value: '-reuses' },
]

// Update model params
watch([currentPage, facets, deboucedQuery, searchSort], ([newPage, newFacets, q, sort]) => {
  if (!props.organization) {
    params.organization = newFacets.organization?.id ?? undefined
    params.organization_badge = newFacets.organizationType?.type ?? undefined
  }
  params.tag = newFacets.tag
  params.format = newFacets.format ?? undefined
  params.organization_badge = newFacets.organizationType?.type ?? undefined
  params.license = newFacets.license?.id ?? undefined
  params.schema = newFacets.schema?.name ?? undefined
  params.geozone = newFacets.geozone?.id ?? undefined
  params.granularity = newFacets.granularity?.id ?? undefined
  params.badge = newFacets.badge?.kind ?? undefined
  if (newPage > 1 || params.page) params.page = newPage.toString()
  params.q = q ?? undefined
  params.sort = sort ?? null
  return params
}, { deep: true })

watch(searchResultsStatus, () => {
  if (searchResultsStatus.value === 'error') {
    toast.error(t(`La recherche a échoué`))
  }
})
</script>
