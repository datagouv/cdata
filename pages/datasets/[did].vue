<template>
  <div>
    <div class="container">
      <div
        v-if="dataset"
        class="mt-4 flex gap-4 flex-wrap md:flex-nowrap items-center justify-between"
      >
        <Breadcrumb class="md:my-0">
          <BreadcrumbItem
            to="/"
          >
            {{ $t("Accueil") }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/datasets">
            {{ $t("Jeux de données") }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ dataset.title }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="md:flex-none flex flex-wrap md:flex-nowrap gap-2.5 md:max-w-6/12">
          <FollowButton
            v-if="dataset"
            :url="`/api/1/datasets/${dataset.id}/followers/`"
          />
          <ReportModal
            v-if="!isOrganizationCertified(dataset.organization)"
            :subject="{ id: dataset.id, class: 'Dataset' }"
          />
          <BrandedButton
            v-if="exploreHref"
            :href="exploreHref"
            :icon="newExplorerEnabled ? RiFullscreenLine : RiExternalLinkFill"
            icon-right
            size="xs"
            :new-tab="!newExplorerEnabled"
            @click="$matomo.trackEvent('Jeux de données', 'Explorer les données', 'Bouton : explorer les données')"
          >
            {{ $t("Explorer les données") }}
          </BrandedButton>
          <EditButton
            v-if="dataset.permissions.edit"
            :id="dataset.id"
            type="datasets"
          />
        </div>
      </div>
      <PendingReportsBanner
        v-if="dataset"
        :subject="{ class: 'Dataset', value: dataset }"
        with-object-actions
        class="mt-4"
        @refresh="refresh"
      />
    </div>
    <LoadingBlock
      v-if="dataset"
      v-slot="{ data: dataset }"
      :status
      :data="dataset"
    >
      <div class="space-y-8">
        <div class="container pt-3 min-h-32">
          <div class="flex flex-col md:space-x-10 md:flex-row md:items-start">
            <div class="flex-1 overflow-x-hidden">
              <div ref="header">
                <div class="flex gap-3 mb-2">
                  <DatasetBadge
                    v-if="getDatasetStatus(dataset) !== 'public'"
                    :dataset
                  />
                </div>
                <h1 class="text-2xl text-gray-title font-extrabold mb-6">
                  {{ dataset.title }}

                  <span
                    v-if="dataset.acronym"
                    class="text-xs text-gray-title font-bold"
                  >
                    {{ dataset.acronym }}
                  </span>
                </h1>
              </div>
              <div class="text-sm text-gray-plain font-bold mb-1 pb-0">
                {{ $t("Description") }}
              </div>
              <ReadMore :wanted-height="sidebarHeight - headerHeight">
                <MarkdownViewer
                  size="sm"
                  :content="dataset.description"
                  :no-headings="true"
                />
              </ReadMore>
            </div>
            <DatasetSidebar
              ref="sidebar"
              class="shrink-0 md:w-[384px]"
              :dataset
            />
          </div>
        </div>

        <RecommendationExternal
          v-if="dataset"
          :dataset
        />

        <div
          v-if="dataset.access_type === 'restricted'"
          class="container"
        >
          <SimpleBanner
            type="pink"
            class="p-4 flex justify-between items-center"
          >
            <div class="space-y-3.5">
              <div>
                <AccessTypeBadge
                  :access-type="dataset.access_type"
                  size="xs"
                />
              </div>
              <p class="font-bold text-xl">
                {{ $t('Ces données ne sont accessibles que sur habilitation') }}
              </p>
              <p
                v-if="dataset.access_type_reason"
                class="text-sm"
              >
                {{ dataset.access_type_reason }}
              </p>
              <template v-else-if="category">
                <p class="font-bold text-sm mb-1">
                  {{ category.label }}
                </p>
                <p class="text-sm">
                  {{ category.definition }}
                </p>
              </template>
              <p
                v-if="config.public.datasetRestrictedGuideUrl"
                class="mb-0"
              >
                <AppLink
                  :to="config.public.datasetRestrictedGuideUrl"
                  external
                >
                  En savoir plus
                </AppLink>
              </p>
            </div>
            <div v-if="dataset.authorization_request_url">
              <BrandedButton
                color="secondary"
                :icon="RiExternalLinkLine"
                icon-right
                :href="dataset.authorization_request_url"
                rel="ugc nofollow noopener"
              >
                {{ $t('Faire une demande d\'habilitation') }}
              </BrandedButton>
            </div>
          </SimpleBanner>
        </div>

        <FullPageTabs
          class="mt-12"
          :links="[
            {
              label: dataset.access_type === 'open' ? $t('Fichiers') : $t('Fichiers publics'),
              href: `/datasets/${route.params.did}`,
              count: dataset.resources.total,
            },
            {
              label: $t('Réutilisations et API'),
              href: `/datasets/${route.params.did}/reuses_and_dataservices`,
              count:
                (dataset.metrics.dataservices || 0)
                + (dataset.metrics.reuses || 0),
            },
            {
              label: $t('Discussions'),
              href: `/datasets/${route.params.did}/discussions`,
              count: dataset.metrics.discussions ?? 0,
            },
            {
              label: $t('Ressources communautaires'),
              href: `/datasets/${route.params.did}/community-resources`,
            },
            {
              label: $t('Informations'),
              href: `/datasets/${route.params.did}/informations`,
            },
          ]"
        />
        <div class="bg-white pt-5 pb-8 lg:pb-24">
          <NuxtPage
            v-if="dataset"
            class="container"
            :dataset
          />
        </div>
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { ReadMore, type DatasetV2WithFullObject, SimpleBanner, isOrganizationCertified, LoadingBlock, BrandedButton, AppLink, MarkdownViewer, getDescriptionShort, type Resource, RESOURCE_EXPLORER_PAGE_SIZE, AccessTypeBadge, DatasetBadge, getDatasetStatus } from '@datagouv/components-next'
import {
  RiExternalLinkFill,
  RiExternalLinkLine,
  RiFullscreenLine,
} from '@remixicon/vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import PendingReportsBanner from '~/components/Spam/PendingReportsBanner.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'
import type { PaginatedArray } from '~/types/types'
import DatasetSidebar from '~/components/Datasets/DatasetSidebar.vue'
import { useElementSize } from '@vueuse/core'
import { keepScrollWithinPage } from '~/utils/scroll'

const config = useRuntimeConfig()
const route = useRoute()
const { t } = useTranslation()

definePageMeta({
  scrollToTop: keepScrollWithinPage,
})

const sidebar = useTemplateRef('sidebar')
const header = useTemplateRef('header')

// The sidebar is a component: measure its root element.
const { height: sidebarHeight } = useElementSize(() => sidebar.value?.$el)
const { height: headerHeight } = useElementSize(header)

const url = computed(() => `/api/2/datasets/${route.params.did}/`)
const { data: dataset, status, refresh } = await useAPI<DatasetV2WithFullObject>(url, {
  headers: {
    'X-Get-Datasets-Full-Objects': 'True',
  },
  showErrorPage: true,
  redirectOnSlug: 'did',
})

const title = computed(() => t('Jeu de données - {title} | {site}', { title: dataset.value?.title ?? '', site: config.public.title }))
const robots = computed(() => dataset.value && dataset.value.archived ? 'noindex' : undefined)
const description = computed(() => normalizeSeoDescription(dataset.value ? getDescriptionShort(dataset.value) : undefined))

useSeoMeta({
  title,
  robots,
  description,
})

defineOgImage('ObjectPage.takumi', {
  objectTitle: dataset.value?.title,
  orgName: dataset.value?.organization?.name,
  orgLogo: dataset.value?.organization?.logo_thumbnail ?? null,
  ownerName: dataset.value?.owner ? `${dataset.value.owner.first_name} ${dataset.value.owner.last_name}` : null,
  ownerAvatar: dataset.value?.owner?.avatar_thumbnail ?? null,
  views: dataset.value?.metrics?.views ?? 0,
  downloads: dataset.value?.metrics?.resources_downloads ?? 0,
  reuses: dataset.value?.metrics?.reuses ?? 0,
  followers: dataset.value?.metrics?.followers ?? 0,
})

await useJsonLd('dataset', route.params.did as string)

onMounted(async () => {
  await redirectLegacyHashes([
    {
      from: 'resources',
      to: `/datasets/${route.params.did}`,
      queryParam: 'resource_id',
    },
    {
      from: 'resource',
      to: `/datasets/${route.params.did}`,
      queryParam: 'resource_id',
    },
    {
      from: 'community-reuses',
      to: `/datasets/${route.params.did}/reuses_and_dataservices`,
    },
    {
      from: 'discussions',
      to: `/datasets/${route.params.did}/discussions`,
      queryParam: 'discussion_id',
    },
    {
      from: 'discussion',
      to: `/datasets/${route.params.did}/discussions`,
      queryParam: 'discussion_id',
    },
    {
      from: 'community-resources',
      to: `/datasets/${route.params.did}/community-resources`,
      queryParam: 'resource_id',
    },
    { from: 'information', to: `/datasets/${route.params.did}/informations` },
  ])
})

const { enabled: newExplorerEnabled } = useNewExplorer()

// Use the same cache key as ResourceExplorer's `main` fetch (dataset id + identical params)
// so Nuxt dedupes the two into a single request on the resources tab. Every part of the key
// must stay byte-for-byte identical to the explorer's `mainParams`, otherwise the keys diverge
// and both requests fire again (silent perf regression, no error, no failing test):
//   - dataset id (not route.params.did, which can be a slug)
//   - page_size: shared RESOURCE_EXPLORER_PAGE_SIZE so the two stay in sync
//   - q: undefined mirrors the explorer's `q: searchDebounced || undefined` at rest
const { data: resources } = dataset.value
  ? await useAPI<PaginatedArray<Resource>>(
      `/api/2/datasets/${dataset.value.id}/resources/`,
      { query: { type: 'main', page_size: RESOURCE_EXPLORER_PAGE_SIZE, q: undefined } },
    )
  : { data: ref<PaginatedArray<Resource> | null>(null) }
const exploreUrl = computed(() => {
  if (!resources.value) return null
  for (const resource of resources.value.data) {
    if (!resource.preview_url) continue
    return resource.preview_url
  }
  return null
})

// A single "Explorer" entry point on every tab of the dataset, pointing at the explorer
// the visitor is actually on: the legacy one, external and limited to the resources it
// knows how to preview, or the fullscreen page, which handles any resource. Uses the slug
// so the fullscreen page doesn't answer with a slug redirect.
const exploreHref = computed(() => {
  if (!newExplorerEnabled.value) return exploreUrl.value
  return dataset.value?.resources.total ? `/explore/${dataset.value.slug}` : null
})

// Same reasoning as the badge labels above: only a restricted dataset names a
// reason category, which is 0.3% of them.
const { data: reasonCategories } = await useFetch('/nuxt-api/access-type-reason-categories', {
  immediate: Boolean(dataset.value?.access_type_reason_category),
})

const category = computed(() => {
  if (!dataset.value?.access_type_reason_category) return null
  return reasonCategories.value?.find(c => c.value === dataset.value?.access_type_reason_category)
})
</script>
