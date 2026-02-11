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
            :external="true"
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
      :status
    >
      <div class="container pt-14">
        <p
          v-if="organization.deleted"
          class="fr-badge mb-2 flex gap-1 items-center"
        >
          <RiDeleteBinLine class="size-3.5" />
          {{ $t('Supprimée') }}
        </p>
        <Placeholder
          :src="organization.logo_thumbnail"
          type="organization"
          alt=""
          :size="80"
          class="bg-white p-1 rounded-sm border border-gray-default object-contain mb-2.5"
        />
        <h1 class="text-2xl font-extrabold text-gray-title mb-2.5">
          <OrganizationNameWithCertificate
            :certifier="config.public.title"
            :organization
            :show-acronym="true"
            :show-type="false"
          />
        </h1>
        <OwnerType
          :type
          size="base"
          color="gray"
        />
      </div>
      <FullPageTabs
        class="mt-12"
        :links="[
          { label: $t('Présentation'), href: `/organizations/${route.params.oid}/` },
          { label: $t('Jeux de données'), href: `/organizations/${route.params.oid}/datasets`, count: organization.metrics.datasets },
          { label: $t('API'), href: `/organizations/${route.params.oid}/dataservices`, count: organization.metrics.dataservices },
          { label: $t('Réutilisations'), href: `/organizations/${route.params.oid}/reuses`, count: organization.metrics.reuses },
          { label: $t('Informations'), href: `/organizations/${route.params.oid}/information` },
        ]"
      />
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
import { isOrganizationCertified, OrganizationNameWithCertificate, OwnerType, getOrganizationType, type Organization } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import Placeholder from '~/components/Placeholder/Placeholder.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'

const config = useRuntimeConfig()
const route = useRoute()

const url = computed(() => `/api/1/organizations/${route.params.oid}/`)
const { data: organization, status } = await useAPI<Organization>(url, { redirectOn404: true })

const title = computed(() => organization.value?.name)
const robots = computed(() => organization.value && !organization.value.metrics.dataservices && !organization.value.metrics.datasets && !organization.value.metrics.reuses ? 'noindex, nofollow' : 'all')

useSeoMeta({
  title,
  robots,
})
await useJsonLd('organization', route.params.oid)

const type = computed(() => organization.value ? getOrganizationType(organization.value) : 'other')
</script>
