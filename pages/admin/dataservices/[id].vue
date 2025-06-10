<template>
  <div>
    <AdminBreadcrumb v-if="dataservice">
      <BreadcrumbItem
        v-if="dataservice.owner"
        :to="me.id === dataservice.owner.id ? `/admin/me/dataservices` : `/admin/users/${dataservice.owner.id}/dataservices`"
      >
        {{ t('API') }}
      </BreadcrumbItem>
      <BreadcrumbItem
        v-else-if="dataservice.organization"
        :to="`/admin/organizations/${dataservice.organization.id}/dataservices`"
      >
        {{ t('API') }}
      </BreadcrumbItem>
      <BreadcrumbItem v-if="dataservice">
        {{ dataservice.title }}
      </BreadcrumbItem>
    </AdminBreadcrumb>

    <div v-if="dataservice">
      <div class="flex flex-wrap items-center justify-between mb-5 gap-x-4 gap-y-2">
        <h1 class="flex-none w-full md:flex-1 font-bold text-2xl !mb-0">
          {{ dataservice.title }}
        </h1>
        <BrandedButton
          :href="dataservice.self_web_url"
          color="secondary"
          size="xs"
          :icon="RiEyeLine"
        >
          {{ t('See the dataservice page') }}
        </BrandedButton>
      </div>

      <TabLinks
        class="mb-5"
        :links="[
          { href: getDataserviceAdminUrl(dataservice), label: t('Metadata') },
          { href: `${getDataserviceAdminUrl(dataservice)}/datasets`, label: t('Associated datasets') },
          { href: `${getDataserviceAdminUrl(dataservice)}/discussions`, label: t('Discussions') },
          { href: `${getDataserviceAdminUrl(dataservice)}/activities`, label: t('Activities') },
        ]"
      />

      <NuxtPage
        :page-key="route => route.fullPath"
        :dataservice
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { Dataservice } from '@datagouv/components-next'
import { RiEyeLine } from '@remixicon/vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import TabLinks from '~/components/TabLinks.vue'

const { t } = useI18n()

const route = useRoute()
const me = useMe()
const url = computed(() => `/api/1/dataservices/${route.params.id}`)
const { data: dataservice } = await useAPI<Dataservice>(url, { lazy: true })
</script>
