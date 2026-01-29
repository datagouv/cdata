import type { Dataservice, DatasetV2, Organization, PaginatedArray, Post, Reuse, Thread, TopicV2 } from '@datagouv/components-next'

export function useDesignData() {
  const { settings } = useDesignSettings()
  const { $api } = useNuxtApp()

  const datasetUrl = computed(() => `/api/2/datasets/${settings.value.datasetSlug}/`)
  const dataserviceUrl = computed(() => `/api/1/dataservices/${settings.value.dataserviceSlug}/`)
  const organizationUrl = computed(() => `/api/1/organizations/${settings.value.organizationSlug}/`)
  const reuseUrl = computed(() => `/api/1/reuses/${settings.value.reuseSlug}/`)
  const tabularDatasetUrl = computed(() => `/api/2/datasets/${settings.value.tabularDatasetSlug}/`)

  const { data: dataset, status: datasetStatus, refresh: refreshDataset } = useLazyFetch<DatasetV2>(datasetUrl, {
    $fetch: $api,
    server: false,
    watch: [datasetUrl],
  })

  const { data: dataservice, status: dataserviceStatus, refresh: refreshDataservice } = useLazyFetch<Dataservice>(dataserviceUrl, {
    $fetch: $api,
    server: false,
    watch: [dataserviceUrl],
  })

  const { data: organization, status: organizationStatus, refresh: refreshOrganization } = useLazyFetch<Organization>(organizationUrl, {
    $fetch: $api,
    server: false,
    watch: [organizationUrl],
  })

  const { data: reuse, status: reuseStatus, refresh: refreshReuse } = useLazyFetch<Reuse>(reuseUrl, {
    $fetch: $api,
    server: false,
    watch: [reuseUrl],
  })

  const { data: tabularDataset, status: tabularDatasetStatus, refresh: refreshTabularDataset } = useLazyFetch<DatasetV2>(tabularDatasetUrl, {
    $fetch: $api,
    server: false,
    watch: [tabularDatasetUrl],
  })

  const { data: discussionsData, status: discussionsStatus, refresh: refreshDiscussions } = useLazyFetch<PaginatedArray<Thread>>('/api/1/discussions/', {
    $fetch: $api,
    server: false,
    query: { page_size: 4 },
  })

  const { data: postsData, status: postsStatus, refresh: refreshPosts } = useLazyFetch<PaginatedArray<Post>>('/api/1/posts/', {
    $fetch: $api,
    server: false,
    query: { page_size: 4 },
  })

  const { data: topicsData, status: topicsStatus, refresh: refreshTopics } = useLazyFetch<PaginatedArray<TopicV2>>('/api/2/topics/', {
    $fetch: $api,
    server: false,
    query: { page_size: 4 },
  })

  const { data: reusesData, status: reusesStatus, refresh: refreshReuses } = useLazyFetch<PaginatedArray<Reuse>>('/api/1/reuses/', {
    $fetch: $api,
    server: false,
    query: { page_size: 4 },
  })

  const discussions = computed(() => discussionsData.value?.data ?? [])
  const posts = computed(() => postsData.value?.data ?? [])
  const topics = computed(() => topicsData.value?.data ?? [])
  const reuses = computed(() => reusesData.value?.data ?? [])

  const isLoading = computed(() =>
    datasetStatus.value === 'pending'
    || dataserviceStatus.value === 'pending'
    || organizationStatus.value === 'pending'
    || reuseStatus.value === 'pending',
  )

  const refreshAll = async () => {
    await Promise.all([
      refreshDataset(),
      refreshDataservice(),
      refreshOrganization(),
      refreshReuse(),
      refreshTabularDataset(),
      refreshDiscussions(),
      refreshPosts(),
      refreshTopics(),
      refreshReuses(),
    ])
  }

  return {
    dataset,
    datasetStatus,
    refreshDataset,

    dataservice,
    dataserviceStatus,
    refreshDataservice,

    organization,
    organizationStatus,
    refreshOrganization,

    reuse,
    reuseStatus,
    refreshReuse,

    tabularDataset,
    tabularDatasetStatus,
    refreshTabularDataset,

    discussions,
    discussionsStatus,
    refreshDiscussions,

    posts,
    postsStatus,
    refreshPosts,

    topics,
    topicsStatus,
    refreshTopics,

    reuses,
    reusesStatus,
    refreshReuses,

    isLoading,
    refreshAll,
  }
}
