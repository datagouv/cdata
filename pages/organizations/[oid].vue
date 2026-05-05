<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="bg-blue-lightest">
    <div class="container">
      <div
        v-if="organization"
        class="flex items-center justify-between"
      >
        <Breadcrumb>
          <BreadcrumbItem
            to="/"
          >
            {{ $t('Accueil') }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/organizations">
            {{ $t('Organisations') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ organization.name }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="flex gap-3 items-center">
          <EditButton
            v-if="organization.permissions.edit"
            :id="organization.id"
            type="organizations"
          />
          <ReportModal
            v-if="!isOrganizationCertified(organization)"
            :subject="{ id: organization.id, class: 'Organization' }"
          />
        </div>
      </div>
    </div>
    <LoadingBlock
      v-if="organization"
      v-slot="{ data: organization }"
      :status
      :data="organization"
    >
      <div class="container relative">
        <div class="bg-white p-1 rounded-sm border border-gray-default object-contain size-20 -mb-10 mt-14 relative z-1">
          <OrganizationLogo
            :organization
            size-class="size-full"
          />
        </div>
      </div>
      <div class="bg-white">
        <div class="container pt-14 pb-4 sm:pb-6">
          <p
            v-if="organization.deleted"
            class="fr-badge mb-2 flex gap-1 items-center"
          >
            <RiDeleteBinLine class="size-3.5" />
            {{ $t('Supprimée') }}
          </p>
          <h1 class="leading-[1.2] font-extrabold text-gray-title mb-2.5">
            <OrganizationNameWithCertificate
              :certifier="config.public.title"
              :organization
              :show-acronym="true"
              :show-type="false"
              color-class="text-gray-title"
              size="xl"
            />
          </h1>
          <OwnerType
            :type
            size="base"
            color="gray"
            class="text-sm sm:text-base text-gray-medium"
          />
          <ReadMore
            v-if="organization.description"
            class="mt-2.5 text-sm text-new-gray-medium leading-6"
            :wanted-height="100"
          >
            <MarkdownViewer
              :content="organization.description"
              :min-heading="3"
            />
          </ReadMore>
        </div>
        <FullPageTabs
          :links="[
            { label: $t('Jeux de données'), href: `/organizations/${route.params.oid}/datasets`, count: organization.metrics.datasets },
            { label: $t('API'), href: `/organizations/${route.params.oid}/dataservices`, count: organization.metrics.dataservices },
            { label: $t('Réutilisations'), href: `/organizations/${route.params.oid}/reuses`, count: organization.metrics.reuses },
            { label: $t('Informations'), href: `/organizations/${route.params.oid}/information` },
          ]"
        >
          <form
            class="flex items-center"
            @submit.prevent="submitSearch"
          >
            <label
              for="org-search"
              class="sr-only"
            >
              {{ $t('Rechercher dans l\'organisation') }}
            </label>
            <div class="flex items-center h-10 w-60 sm:w-80">
              <RiSearchLine class="ml-3 shrink-0 size-4 text-new-primary" />
              <input
                id="org-search"
                v-model="searchQuery"
                type="search"
                class="bg-transparent flex-1 h-full pl-2 pr-6 text-sm sm:text-base placeholder:text-gray-medium outline-none"
                :placeholder="$t('Rechercher dans l\'organisation')"
              >
            </div>
          </form>
        </FullPageTabs>
      </div>
      <div class="bg-white pt-5 pb-8 lg:pb-24">
        <NuxtPage
          v-if="organization"
          class="container"
          :organization
        />
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { isOrganizationCertified, LoadingBlock, MarkdownViewer, OrganizationNameWithCertificate, OwnerType, ReadMore, getOrganizationType, type Organization, OrganizationLogo } from '@datagouv/components-next'
import { RiDeleteBinLine, RiSearchLine } from '@remixicon/vue'
import { watchDebounced } from '@vueuse/core'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'

const config = useRuntimeConfig()
const route = useRoute()

const url = computed(() => `/api/1/organizations/${route.params.oid}/`)
const { data: organization, status } = await useAPI<Organization>(url, { redirectOn404: true, redirectOnSlug: 'oid' })

const title = computed(() => `Organisation - ${organization.value?.name} | ${config.public.title}`)
const robots = computed(() => organization.value && !organization.value.metrics.dataservices && !organization.value.metrics.datasets && !organization.value.metrics.reuses ? 'noindex, nofollow' : 'all')

useSeoMeta({
  title,
  robots,
})
defineOgImage('ObjectPage.takumi', {
  orgName: organization.value?.name,
  orgLogo: organization.value?.logo_thumbnail ?? null,
  datasets: organization.value?.metrics?.datasets ?? 0,
  dataservices: organization.value?.metrics?.dataservices ?? 0,
  reuses: organization.value?.metrics?.reuses ?? 0,
})
await useJsonLd('organization', route.params.oid as string)

const type = computed(() => organization.value ? getOrganizationType(organization.value) : 'other')

const searchQuery = ref((route.query.q as string) || '')
const searchPath = computed(() => `/organizations/${route.params.oid}/search`)

const currentSearchType = computed(() => {
  const path = route.path
  if (path.endsWith('/dataservices')) return 'dataservices'
  if (path.endsWith('/reuses')) return 'reuses'
  return 'datasets'
})

function submitSearch() {
  const q = searchQuery.value.trim()
  if (q) {
    navigateTo({ path: searchPath.value, query: { q, type: currentSearchType.value } })
  }
}

watchDebounced(searchQuery, (value) => {
  const q = value.trim()
  if (q) {
    navigateTo({ path: searchPath.value, query: { q, type: currentSearchType.value } })
  }
  else if (route.path.endsWith('/search')) {
    navigateTo({ path: `/organizations/${route.params.oid}` })
  }
}, { debounce: 300 })
</script>
