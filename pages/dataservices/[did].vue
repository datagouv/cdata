<template>
  <div>
    <div class="container">
      <div
        v-if="dataservice"
        class="mt-4 flex gap-4 flex-wrap md:flex-nowrap items-center justify-between"
      >
        <Breadcrumb class="md:mb-0 md:mt-0">
          <BreadcrumbItem
            to="/"
          >
            {{ $t('Accueil') }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/dataservices">
            {{ $t('API') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ dataservice.title }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="flex-none flex gap-2.5 items-center">
          <FollowButton
            v-if="dataservice"
            :url="`/api/1/dataservices/${dataservice.id}/followers/`"
          />
          <EditButton
            v-if="dataservice.permissions.edit"
            :id="dataservice.id"
            type="dataservices"
          />
          <ReportModal
            v-if="!isOrganizationCertified(dataservice.organization)"
            :subject="{ id: dataservice.id, class: 'Dataservice' }"
          />
        </div>
      </div>
      <PendingReportsBanner
        v-if="dataservice"
        :subject="{ class: 'Dataservice', value: dataservice }"
        with-object-actions
        class="mt-4"
        @refresh="refresh"
      />
    </div>
    <LoadingBlock
      v-if="dataservice"
      v-slot="{ data: dataservice }"
      :status
      :data="dataservice"
    >
      <div class="space-y-8">
        <div class="container pt-3 min-h-32">
          <div class="flex flex-col md:space-x-10 md:flex-row md:items-start">
            <div class="flex-1 overflow-x-hidden">
              <div ref="header">
                <div class="flex gap-3 mb-2">
                  <DataserviceBadge
                    v-if="getDataserviceStatus(dataservice) !== 'public'"
                    :dataservice
                  />
                </div>
                <h1 class="text-2xl text-gray-title mb-6 font-extrabold">
                  {{ dataservice.title }}
                </h1>
              </div>
              <ReadMore :wanted-height="sidebarHeight - headerHeight">
                <MarkdownViewer
                  size="md"
                  :content="dataservice.description"
                  :min-heading="3"
                />
              </ReadMore>
            </div>
            <DataserviceSidebar
              ref="sidebar"
              class="shrink-0 md:w-[384px]"
              :dataservice
            />
          </div>
        </div>

        <div class="container space-y-4">
          <SimpleBanner
            v-if="dataservice.machine_documentation_url"
            type="primary-frame"
          >
            <button
              type="button"
              class="min-h-[42px] w-full flex items-center justify-between"
              @click="showProperties"
            >
              <div class="text-datagouv-dark font-bold text-xl">
                {{ $t('Données renvoyées') }}
              </div>
              <RiArrowUpSLine
                v-if="openProperties"
                class="size-6 text-gray-title"
              />
              <RiArrowDownSLine
                v-else
                class="size-6 text-gray-title"
              />
            </button>
            <OpenApiProperties
              v-if="openProperties"
              :url="dataservice.machine_documentation_url"
              :title="dataservice.title"
            />
          </SimpleBanner>
          <div v-if="dataservice.machine_documentation_url">
            <SimpleBanner type="primary-frame">
              <button
                type="button"
                class="min-h-[42px] w-full flex items-center justify-between"
                @click="showSwagger"
              >
                <div class="text-datagouv-dark font-bold text-xl">
                  {{ $t('Swagger') }}
                </div>
                <RiArrowUpSLine
                  v-if="openSwagger"
                  class="size-6 text-gray-title"
                />
                <RiArrowDownSLine
                  v-else
                  class="size-6 text-gray-title"
                />
              </button>
              <OpenApiViewer
                v-if="openSwagger"
                :url="dataservice.machine_documentation_url"
                data-testid="swagger-viewer"
              />
            </SimpleBanner>
          </div>
        </div>

        <FullPageTabs
          class="mt-12"
          :links="[
            { label: $t('Informations'), href: `/dataservices/${route.params.did}` },
            { label: $t('Réutilisations'), href: `/dataservices/${route.params.did}/reuses`, count: dataservice.metrics.reuses ?? 0 },
            { label: $t('Discussions'), href: `/dataservices/${route.params.did}/discussions`, count: dataservice.metrics.discussions ?? 0 },
          ]"
        />
        <div class="bg-white pt-5 pb-8 lg:pb-24">
          <NuxtPage
            v-if="dataservice"
            class="container"
            :dataservice
          />
        </div>
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { isOrganizationCertified, LoadingBlock, OpenApiViewer, ReadMore, SimpleBanner, type Dataservice, MarkdownViewer, getDescriptionShort, DataserviceBadge, getDataserviceStatus } from '@datagouv/components-next'
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import PendingReportsBanner from '~/components/Spam/PendingReportsBanner.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'
import DataserviceSidebar from '~/components/Dataservices/DataserviceSidebar.vue'
import { useElementSize } from '@vueuse/core'
import { keepScrollWithinPage } from '~/utils/scroll'

definePageMeta({
  scrollToTop: keepScrollWithinPage,
})

const config = useRuntimeConfig()
const route = useRoute()
const { $matomo } = useNuxtApp()

const sidebar = useTemplateRef('sidebar')
const header = useTemplateRef('header')
// The sidebar is a component: measure its root element.
const { height: sidebarHeight } = useElementSize(() => sidebar.value?.$el)
const { height: headerHeight } = useElementSize(header)

const url = computed(() => `/api/1/dataservices/${route.params.did}/`)
const { data: dataservice, status, refresh } = await useAPI<Dataservice>(url, { showErrorPage: true, redirectOnSlug: 'did' })

const title = computed(() => `API - ${dataservice.value?.title} | ${config.public.title}`)
const description = computed(() => normalizeSeoDescription(dataservice.value ? getDescriptionShort(dataservice.value) : undefined))
const robots = computed(() => dataservice.value && dataservice.value.archived_at ? 'noindex' : 'all')

useSeoMeta({
  title,
  robots,
  description,
})
defineOgImage('ObjectPage.takumi', {
  objectTitle: dataservice.value?.title,
  orgName: dataservice.value?.organization?.name,
  orgLogo: dataservice.value?.organization?.logo_thumbnail ?? null,
  ownerName: dataservice.value?.owner ? `${dataservice.value.owner.first_name} ${dataservice.value.owner.last_name}` : null,
  ownerAvatar: dataservice.value?.owner?.avatar_thumbnail ?? null,
  views: dataservice.value?.metrics?.views ?? 0,
  reuses: dataservice.value?.metrics?.reuses ?? 0,
  followers: dataservice.value?.metrics?.followers ?? 0,
})
await useJsonLd('dataservice', route.params.did as string)

const openProperties = ref(false)
const openSwagger = ref(false)

function showProperties() {
  openProperties.value = !openProperties.value
  if (openProperties.value) {
    $matomo.trackEvent('API', `Accéder à l'api`, 'Bouton : ouvrir données renvoyées')
  }
}

function showSwagger() {
  openSwagger.value = !openSwagger.value
  if (openSwagger.value) {
    $matomo.trackEvent('API', `Accéder à l'api`, 'Bouton : ouvrir swagger')
  }
}

onMounted(async () => {
  await redirectLegacyHashes([
    { from: 'discussions', to: `/dataservices/${route.params.did}/discussions`, queryParam: 'discussion_id' },
    { from: 'discussion', to: `/dataservices/${route.params.did}/discussions`, queryParam: 'discussion_id' },
  ])
})
</script>
