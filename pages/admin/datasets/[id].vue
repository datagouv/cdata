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
          <h1 class="flex-none w-full md:flex-1 font-extrabold text-gray-title text-2xl !mb-0">
            {{ dataset.title }}
          </h1>
          <BrandedButton
            :href="dataset.page"
            color="secondary"
            size="xs"
            :icon="RiEyeLine"
          >
            {{ t('Voir la page publique du jeu de données') }}
          </BrandedButton>
        </div>

        <div class="text-sm text-mentionGrey space-y-1.5">
          <p class="space-x-1">
            <span>{{ $t('Statut') }}:</span>
            <AdminBadge
              size="xs"
              :type="getDatasetStatus(dataset).type"
            >
              {{ getDatasetStatus(dataset).label }}
            </AdminBadge>
          </p>
          <p class="space-x-1 flex items-center">
            <RiPriceTag3Line class="inline size-3" />
            <span>{{ $t('Métadonnées:') }}</span>
            <Tooltip>
              <DatasetQualityScore
                class="w-32"
                :score="dataset.quality.score"
              />
              <template #tooltip>
                <DatasetQualityTooltipContent :quality="dataset.quality" />
              </template>
            </Tooltip>
          </p>
          <p class="space-x-1">
            <RiBarChartBoxLine class="inline size-3" />
            <span>{{ $t('Statistiques:') }}</span>
            <span class="space-x-2">
              <Tooltip class="inline">
                <span class="space-x-0.5 text-sm">
                  <RiEyeLine class="inline size-3.5" />
                  <span>{{ summarize(dataset.metrics.views ?? 0) }}</span>
                </span>
                <template #tooltip>
                  {{ $t('Vues') }}
                </template>
              </Tooltip>
              <Tooltip class="inline">
                <span class="space-x-0.5 text-sm">
                  <RiDownloadLine class="inline size-3.5" />
                  <span>{{ summarize(dataset.metrics.resources_downloads ?? 0) }}</span>
                </span>
                <template #tooltip>
                  {{ $t('Téléchargements') }}
                </template>
              </Tooltip>
              <Tooltip class="inline">
                <span class="space-x-0.5 text-sm">
                  <RiLineChartLine class="inline size-3.5" />
                  <span>{{ summarize(dataset.metrics.reuses) }}</span>
                </span>
                <template #tooltip>
                  {{ $t('Réutilisations') }}
                </template>
              </Tooltip>
              <Tooltip class="inline">
                <span class="space-x-0.5 text-sm">
                  <RiStarLine class="inline size-3.5" />
                  <span>{{ summarize(dataset.metrics.followers) }}</span>
                </span>
                <template #tooltip>
                  {{ $t('Abonnés') }}
                </template>
              </Tooltip>
            </span>
          </p>
          <p
            v-if="activities && activities.data.length"
            class="space-x-1"
          >
            <RiCalendarLine class="inline size-3" />
            <span>{{ $t('Dernière activité :') }}</span>
            <span class="inline-flex items-center">
              <AvatarWithName
                class="fr-ml-1v"
                :user="activities.data[0].actor"
              />
            </span>
            &mdash;
            <span>{{ getActivityTranslation(activities.data[0]) }}</span>
            &mdash;
            <span class="text-gray-medium">{{ formatDate(activities.data[0].created_at) }}</span>
          </p>
        </div>
      </div>

      <TabLinks
        class="mb-5"
        :links="[
          { href: getDatasetAdminUrl(dataset), label: t('Métadonnées') },
          { href: `${getDatasetAdminUrl(dataset)}/files`, label: t('Fichiers') },
          { href: `${getDatasetAdminUrl(dataset)}/discussions`, label: t('Discussions') },
          { href: `${getDatasetAdminUrl(dataset)}/activities`, label: t('Activités') },
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
import { BrandedButton, DatasetQualityTooltipContent, type DatasetV2, DatasetQualityScore, summarize, useFormatDate, AvatarWithName, Tooltip } from '@datagouv/components-next'
import { RiBarChartBoxLine, RiCalendarLine, RiDownloadLine, RiEyeLine, RiLineChartLine, RiPriceTag3Line, RiStarLine } from '@remixicon/vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import TabLinks from '~/components/TabLinks.vue'
import type { Activity } from '~/types/activity'
import type { PaginatedArray } from '~/types/types'

const { t } = useI18n()
const me = useMe()

const route = useRoute()
const { getDatasetStatus } = useDatasetStatus()
const { formatDate } = useFormatDate()
const url = computed(() => `/api/2/datasets/${route.params.id}/`)
const { data: dataset } = await useAPI<DatasetV2>(url, { redirectOn404: true })
const { data: activities } = await useAPI<PaginatedArray<Activity>>('/api/1/activity/', {
  params: {
    related_to: route.params.id,
    sort: '-created_at',
  },
})
</script>
