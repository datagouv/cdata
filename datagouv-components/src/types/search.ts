import type { PaginatedArray } from './api'
import type { AccessType } from './access_types'
import type {
  CERTIFIED,
  PUBLIC_SERVICE,
  ASSOCIATION,
  COMPANY,
  LOCAL_AUTHORITY,
  USER,
  OrganizationTypes } from '../functions/organizations'

// Common types

export type LastUpdateRange = 'last_30_days' | 'last_12_months' | 'last_3_years'

export type ProducerType = Exclude<OrganizationTypes, 'other'> | typeof USER | 'not-specified'

export type OrganizationBadgeFilter = typeof CERTIFIED | typeof PUBLIC_SERVICE | typeof ASSOCIATION | typeof COMPANY | typeof LOCAL_AUTHORITY

// Base query params (common to all searches)

export type BaseSearchQueryParams<Sort extends string> = {
  q?: string
  sort?: Sort
  page?: number
  page_size?: number
}

// Facet types

export type FacetItem = {
  count: number
  name: string
}

// Dataset Search

export type DatasetBadgeFilter = 'pivotal-data' | 'spd' | 'inspire' | 'hvd' | 'sl' | 'sr'

export type DatasetFormatFamily = 'tabular' | 'machine_readable' | 'geographical' | 'documents' | 'other'

export type DatasetAccessTypeFilter = AccessType | 'all'

export type DatasetGranularityFilter
  = | 'other'
    | 'country'
    | 'country-group'
    | 'country-subset'
    | 'poi'
    | 'fr:commune'
    | 'fr:epci'
    | 'fr:departement'
    | 'fr:region'
    | 'fr:canton'
    | 'fr:collectivite'
    | 'fr:iris'
    | 'fr:arrondissement'

export type DatasetLicenseFilter
  = | 'lov2'
    | 'notspecified'
    | 'fr-lo'
    | 'odc-odbl'
    | 'other-at'
    | 'other-pd'
    | 'cc-by'
    | 'other-open'
    | 'cc-by-sa'
    | 'odc-by'
    | 'cc-zero'
    | 'odc-pddl'

export type DatasetSearchSort = 'created' | 'last_update' | 'reuses' | 'followers' | 'views' | '-created' | '-last_update' | '-reuses' | '-followers' | '-views'

export type DatasetSearchFilters = {
  tag?: string | string[]
  badge?: DatasetBadgeFilter
  organization?: string
  organization_badge?: OrganizationBadgeFilter
  license?: DatasetLicenseFilter | string
  geozone?: string
  granularity?: DatasetGranularityFilter | DatasetGranularityFilter[]
  format?: string | string[]
  schema?: string | string[]
  temporal_coverage?: string
  featured?: boolean
  topic?: string
  access_type?: DatasetAccessTypeFilter
  format_family?: DatasetFormatFamily
  producer_type?: ProducerType
  last_update_range?: LastUpdateRange
}

export type DatasetSearchQueryParams = BaseSearchQueryParams<DatasetSearchSort> & DatasetSearchFilters

export type DatasetSearchFacets = {
  access_type: FacetItem[]
  badge: FacetItem[]
  format: FacetItem[]
  format_family: FacetItem[]
  geozone: FacetItem[]
  granularity: FacetItem[]
  last_update: FacetItem[]
  license: FacetItem[]
  organization_id_with_name: FacetItem[]
  producer_type: FacetItem[]
  schema: FacetItem[]
  tag: FacetItem[]
  topics: FacetItem[]
}

// Dataservice Search

export type DataserviceAccessTypeFilter = AccessType | 'all'

export type DataserviceSearchSort = 'created' | 'views' | 'followers' | '-created' | '-views' | '-followers'

export type DataserviceSearchFilters = {
  tag?: string | string[]
  topic?: string
  organization?: string
  archived?: boolean
  featured?: boolean
  access_type?: DataserviceAccessTypeFilter
  producer_type?: ProducerType
  last_update_range?: LastUpdateRange
  is_restricted?: boolean
}

export type DataserviceSearchQueryParams = BaseSearchQueryParams<DataserviceSearchSort> & DataserviceSearchFilters

export type DataserviceSearchFacets = {
  access_type: FacetItem[]
  badge: FacetItem[]
  last_update: FacetItem[]
  organization_id_with_name: FacetItem[]
  producer_type: FacetItem[]
  tag: FacetItem[]
}

// Reuse Search

export type ReuseTopicFilter
  = | 'others'
    | 'health'
    | 'transport_and_mobility'
    | 'politics_and_public_life'
    | 'housing_and_development'
    | 'environment_and_energy'
    | 'culture_and_recreation'
    | 'society_and_demography'
    | 'economy_and_business'
    | 'open_data_tools'
    | 'education_and_research'
    | 'food_and_agriculture'
    | 'law_and_justice'
    | 'safety_and_security'
    | 'work_and_training'

export type ReuseTypeFilter
  = | 'visualization'
    | 'application'
    | 'post'
    | 'news_article'
    | 'api'
    | 'paper'
    | 'idea'
    | 'hardware'

export type ReuseSearchSort = 'created' | 'datasets' | 'followers' | 'views' | '-created' | '-datasets' | '-followers' | '-views'

export type ReuseSearchFilters = {
  tag?: string | string[]
  organization?: string
  organization_badge?: OrganizationBadgeFilter
  owner?: string
  type?: ReuseTypeFilter
  badge?: string
  featured?: boolean
  topic?: ReuseTopicFilter
  archived?: boolean
  producer_type?: ProducerType
  last_update_range?: LastUpdateRange
}

export type ReuseSearchQueryParams = BaseSearchQueryParams<ReuseSearchSort> & ReuseSearchFilters

export type ReuseSearchFacets = {
  badge: FacetItem[]
  last_update: FacetItem[]
  organization_id_with_name: FacetItem[]
  producer_type: FacetItem[]
  tag: FacetItem[]
  topic: FacetItem[]
  type: FacetItem[]
}

// Organization Search

export type OrganizationSearchSort = 'reuses' | 'datasets' | 'followers' | 'views' | 'created' | '-reuses' | '-datasets' | '-followers' | '-views' | '-created'

export type OrganizationSearchFilters = {
  badge?: OrganizationBadgeFilter
}

export type OrganizationSearchQueryParams = BaseSearchQueryParams<OrganizationSearchSort> & OrganizationSearchFilters

export type OrganizationSearchFacets = {
  producer_type: FacetItem[]
}

// Post Search

export type PostSearchSort = 'created' | 'last_modified' | 'published' | '-created' | '-last_modified' | '-published'

export type PostSearchFilters = {
  tag?: string | string[]
  last_update_range?: LastUpdateRange
}

export type PostSearchQueryParams = BaseSearchQueryParams<PostSearchSort> & PostSearchFilters

export type PostSearchFacets = {
  last_update: FacetItem[]
}

// Discussion Search

export type DiscussionObjectType = 'Dataset' | 'Dataservice'

export type DiscussionSearchSort = 'created' | 'closed' | '-created' | '-closed'

export type DiscussionSearchFilters = {
  closed?: boolean
  last_update_range?: LastUpdateRange
}

export type DiscussionSearchQueryParams = BaseSearchQueryParams<DiscussionSearchSort> & DiscussionSearchFilters

export type DiscussionSearchFacets = {
  last_update: FacetItem[]
  object_type: FacetItem[]
}

// Topic Search

export type TopicSearchSort = 'name' | 'created' | 'last_modified' | '-name' | '-created' | '-last_modified'

export type TopicSearchFilters = {
  tag?: string | string[]
  featured?: boolean
  last_update_range?: LastUpdateRange
  organization?: string
  producer_type?: ProducerType
}

export type TopicSearchQueryParams = BaseSearchQueryParams<TopicSearchSort> & TopicSearchFilters

export type TopicSearchFacets = {
  last_update: FacetItem[]
  organization_id_with_name: FacetItem[]
  producer_type: FacetItem[]
  tag: FacetItem[]
}

// Search response with facets

export type SearchResponseWithFacets<T, F> = PaginatedArray<T> & {
  facets: F
}

export type DatasetSearchResponse<T> = SearchResponseWithFacets<T, DatasetSearchFacets>
export type DataserviceSearchResponse<T> = SearchResponseWithFacets<T, DataserviceSearchFacets>
export type ReuseSearchResponse<T> = SearchResponseWithFacets<T, ReuseSearchFacets>
export type OrganizationSearchResponse<T> = SearchResponseWithFacets<T, OrganizationSearchFacets>
export type PostSearchResponse<T> = SearchResponseWithFacets<T, PostSearchFacets>
export type DiscussionSearchResponse<T> = SearchResponseWithFacets<T, DiscussionSearchFacets>
export type TopicSearchResponse<T> = SearchResponseWithFacets<T, TopicSearchFacets>

// GlobalSearch configuration types

export type HiddenFilter<Filters> = {
  [K in keyof Filters]: { key: K, value: Filters[K] }
}[keyof Filters]

export type SortOption<Sort extends string> = {
  value: Sort
  label: string
}

export type DatasetSearchConfig = {
  class: 'datasets'
  name?: string
  hiddenFilters?: HiddenFilter<DatasetSearchFilters>[]
  basicFilters?: (keyof DatasetSearchFilters)[]
  advancedFilters?: (keyof DatasetSearchFilters)[]
  sortOptions?: SortOption<DatasetSearchSort>[]
}

export type DataserviceSearchConfig = {
  class: 'dataservices'
  name?: string
  hiddenFilters?: HiddenFilter<DataserviceSearchFilters>[]
  basicFilters?: (keyof DataserviceSearchFilters)[]
  advancedFilters?: (keyof DataserviceSearchFilters)[]
  sortOptions?: SortOption<DataserviceSearchSort>[]
}

export type ReuseSearchConfig = {
  class: 'reuses'
  name?: string
  hiddenFilters?: HiddenFilter<ReuseSearchFilters>[]
  basicFilters?: (keyof ReuseSearchFilters)[]
  advancedFilters?: (keyof ReuseSearchFilters)[]
  sortOptions?: SortOption<ReuseSearchSort>[]
}

export type SearchTypeConfig = DatasetSearchConfig | DataserviceSearchConfig | ReuseSearchConfig

export type GlobalSearchConfig = SearchTypeConfig[]

// Helper functions for default configs

export const defaultDatasetSortOptions: SortOption<DatasetSearchSort>[] = [
  { value: '-created', label: 'Date de création' },
  { value: '-last_update', label: 'Dernière mise à jour' },
  { value: '-followers', label: `Nombre d'abonnés` },
  { value: '-reuses', label: 'Nombre de réutilisations' },
]

export const defaultDataserviceSortOptions: SortOption<DataserviceSearchSort>[] = [
  { value: '-created', label: 'Date de création' },
]

export const defaultReuseSortOptions: SortOption<ReuseSearchSort>[] = [
  { value: '-created', label: 'Date de création' },
  { value: '-followers', label: `Nombre d'abonnés` },
  { value: '-datasets', label: 'Nombre de jeux de données' },
]

export function getDefaultDatasetConfig(overrides?: Partial<Omit<DatasetSearchConfig, 'class'>>): DatasetSearchConfig {
  return {
    class: 'datasets',
    basicFilters: ['format_family', 'access_type', 'last_update_range', 'producer_type', 'badge'],
    advancedFilters: ['organization', 'organization_badge', 'tag', 'format', 'license', 'schema', 'geozone', 'granularity'],
    sortOptions: defaultDatasetSortOptions,
    ...overrides,
  }
}

export function getDefaultDataserviceConfig(overrides?: Partial<Omit<DataserviceSearchConfig, 'class'>>): DataserviceSearchConfig {
  return {
    class: 'dataservices',
    basicFilters: ['access_type', 'last_update_range', 'producer_type'],
    advancedFilters: ['organization', 'tag'],
    sortOptions: defaultDataserviceSortOptions,
    ...overrides,
  }
}

export function getDefaultReuseConfig(overrides?: Partial<Omit<ReuseSearchConfig, 'class'>>): ReuseSearchConfig {
  return {
    class: 'reuses',
    basicFilters: ['type', 'topic', 'last_update_range', 'producer_type'],
    advancedFilters: ['organization', 'organization_badge', 'tag'],
    sortOptions: defaultReuseSortOptions,
    ...overrides,
  }
}

export function getDefaultGlobalSearchConfig(): GlobalSearchConfig {
  return [
    getDefaultDatasetConfig(),
    getDefaultDataserviceConfig(),
    getDefaultReuseConfig(),
  ]
}
