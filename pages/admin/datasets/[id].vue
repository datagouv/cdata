<template>
  <div>
    <AdminBreadcrumb v-if="dataset">
      <BreadcrumbItem
        v-if="dataset.owner"
        :to="me.id === dataset.owner.id ? `/admin/me/datasets` : `/admin/users/${dataset.owner.id}/datasets`"
      >
        {{ t('Jeux de données') }}
      </BreadcrumbItem>
      <BreadcrumbItem
        v-else-if="dataset.organization"
        :to="`/admin/organizations/${dataset.organization.id}/datasets`"
      >
        {{ t('Jeux de données') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ dataset.title }}
      </BreadcrumbItem>
    </AdminBreadcrumb>

    <div v-if="dataset">
      <div class="mb-5">
        <div class="flex flex-wrap items-center justify-between mb-3 gap-x-4 gap-y-2">
          <h1 class="flex-none w-full md:flex-1 font-bold text-2xl !mb-0">
            {{ dataset.title }}
          </h1>
          <BrandedButton
            :href="dataset.page"
            color="secondary"
            size="xs"
            :icon="RiEyeLine"
          >
            {{ t('See the dataset page') }}
          </BrandedButton>
        </div>

        <div class="text-sm text-mentionGrey space-y-1.5">
          <div class="space-x-1">
            <span>{{ $t('Statut') }}:</span>
            <AdminBadge
              size="xs"
              :type="getDatasetStatus(dataset).type"
            >
              {{ getDatasetStatus(dataset).label }}
            </AdminBadge>
          </div>
          <div class="space-x-1 flex items-center">
            <RiPriceTag3Line class="inline size-3" />
            <span>{{ $t('Metadata:') }}</span>
            <Tooltip>
              <DatasetQualityScore
                class="w-32"
                :score="dataset.quality.score"
              />
              <template #tooltip>
                <DatasetQualityTooltipContent :quality="dataset.quality" />
              </template>
            </Tooltip>
          </div>
          <div class="space-x-1">
            <RiInformationLine class="inline size-3" />
            <span>{{ $t('Informations:') }}</span>
            <span class="space-x-2">
              <Tooltip class="inline">
                <span class="space-x-0.5 text-sm">
                  <RiEyeLine class="inline size-3.5" />
                  <span>{{ summarize(dataset.metrics.views ?? 0) }}</span>
                </span>
                <template #tooltip>
                  {{ $t('Views') }}
                </template>
              </Tooltip>
              <Tooltip class="inline">
                <span class="space-x-0.5 text-sm">
                  <RiDownloadLine class="inline size-3.5" />
                  <span>{{ summarize(dataset.metrics.resources_downloads ?? 0) }}</span>
                </span>
                <template #tooltip>
                  {{ $t('Downloads') }}
                </template>
              </Tooltip>
              <Tooltip class="inline">
                <span class="space-x-0.5 text-sm">
                  <RiLineChartLine class="inline size-3.5" />
                  <span>{{ summarize(dataset.metrics.reuses) }}</span>
                </span>
                <template #tooltip>
                  {{ $t('Reuses') }}
                </template>
              </Tooltip>
            </span>
          </div>
        </div>
      </div>

      <TabLinks
        class="mb-5"
        :links="[
          { href: getDatasetAdminUrl(dataset), label: t('Metadata') },
          { href: `${getDatasetAdminUrl(dataset)}/files`, label: t('Files') },
          { href: `${getDatasetAdminUrl(dataset)}/discussions`, label: t('Discussions') },
          { href: `${getDatasetAdminUrl(dataset)}/activities`, label: t('Activities') },
        ]"
      />

      <NuxtPage
        :page-key="route => route.fullPath"
        :dataset
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, DatasetQualityTooltipContent, type DatasetV2, DatasetQualityScore, summarize } from '@datagouv/components-next'
import { RiDownloadLine, RiEyeLine, RiInformationLine, RiLineChartLine, RiPriceTag3Line } from '@remixicon/vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import TabLinks from '~/components/TabLinks.vue'

const { t } = useI18n()
const me = useMe()

const route = useRoute()
const { getDatasetStatus } = useDatasetStatus()
const url = computed(() => `/api/2/datasets/${route.params.id}/`)
const { data: dataset } = await useAPI<DatasetV2>(url)
</script>
