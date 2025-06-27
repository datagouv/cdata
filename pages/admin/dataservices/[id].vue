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
      <div class="flex flex-wrap items-center justify-between mb-3 gap-x-4 gap-y-2">
        <h1 class="flex-none w-full md:flex-1 font-bold text-2xl !mb-0">
          {{ dataservice.title }}
        </h1>
        <BrandedButton
          :href="dataservice.self_web_url"
          color="secondary"
          size="xs"
          :icon="RiEyeLine"
        >
          {{ t("Voir la page publique de l'API") }}
        </BrandedButton>
      </div>

      <div class="text-sm text-mentionGrey space-y-1.5 mb-5">
        <div class="space-x-1">
          <span>{{ $t('Statut') }}:</span>
          <AdminBadge
            size="xs"
            :type="getDataserviceStatus(dataservice).type"
          >
            {{ getDataserviceStatus(dataservice).label }}
          </AdminBadge>
        </div>
        <div class="space-x-1">
          <RiBarChartBoxLine class="inline size-3" />
          <span>{{ $t('Statistiques:') }}</span>
          <span class="space-x-2">
            <Tooltip class="inline">
              <span class="space-x-0.5 text-sm">
                <RiEyeLine class="inline size-3.5" />
                <span>{{ summarize(dataservice.metrics.views ?? 0) }}</span>
              </span>
              <template #tooltip>
                {{ $t('Vues') }}
              </template>
            </Tooltip>
            <Tooltip class="inline">
              <span class="space-x-0.5 text-sm">
                <RiStarLine class="inline size-3.5" />
                <span>{{ summarize(dataservice.metrics.followers) }}</span>
              </span>
              <template #tooltip>
                {{ $t('Abonnés') }}
              </template>
            </Tooltip>
          </span>
        </div>
      </div>

      <TabLinks
        class="mb-5"
        :links="[
          { href: getDataserviceAdminUrl(dataservice), label: t('Métadonnées') },
          { href: `${getDataserviceAdminUrl(dataservice)}/datasets`, label: t('Jeux de données associés') },
          { href: `${getDataserviceAdminUrl(dataservice)}/discussions`, label: t('Discussions') },
          { href: `${getDataserviceAdminUrl(dataservice)}/activities`, label: t('Activités') },
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
import { BrandedButton, summarize } from '@datagouv/components-next'
import type { Dataservice } from '@datagouv/components-next'
import { RiBarChartBoxLine, RiEyeLine, RiStarLine } from '@remixicon/vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import TabLinks from '~/components/TabLinks.vue'

const { t } = useI18n()

const route = useRoute()
const { getDataserviceStatus } = useDataserviceStatus()
const me = useMe()
const url = computed(() => `/api/1/dataservices/${route.params.id}`)
const { data: dataservice } = await useAPI<Dataservice>(url, { lazy: true })
</script>
