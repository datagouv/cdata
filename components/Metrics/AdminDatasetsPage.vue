<template>
  <div>
    <div
      v-if="downloadStatsUrl"
      class="flex justify-end -mt-14 pt-0.5 mb-5"
    >
      <BrandedButton
        color="secondary"
        :disabled="!downloadStatsUrl"
        :href="downloadStatsUrl || ''"
        :external="true"
        download="stats.csv"
        :icon="RiDownloadLine"
        size="xs"
      >
        {{ $t('Télécharger le catalogue') }}
      </BrandedButton>
    </div>
    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh
                :sorted="sorted('title')"
                scope="col"
                @sort="(direction: SortDirection) => sort('title', direction)"
              >
                {{ $t('Titre du jeu de données') }}
              </AdminTableTh>
              <AdminTableTh
                class="w-16"
                scope="col"
              >
                <Tooltip>
                  <span
                    class="fr-icon--sm fr-icon-chat-3-line"
                    aria-hidden="true"
                  />
                  <template #tooltip>
                    {{ $t('Discussions') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                class="w-16"
                :sorted="sorted('views')"
                scope="col"
                @sort="(direction: SortDirection) => sort('views', direction)"
              >
                <Tooltip>
                  <RiEyeLine class="size-4" />
                  <template #tooltip>
                    {{ $t('Vues') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                class="w-16"
                scope="col"
              >
                <Tooltip>
                  <RiDownloadLine class="size-4" />
                  <template #tooltip>
                    {{ $t('Téléchargements') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                class="w-16"
                :sorted="sorted('reuses')"
                scope="col"
                @sort="(direction: SortDirection) => sort('reuses', direction)"
              >
                <Tooltip>
                  <RiLineChartLine class="size-4" />
                  <template #tooltip>
                    {{ $t('Réutilisations') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                class="w-16"
                :sorted="sorted('followers')"
                scope="col"
                @sort="(direction: SortDirection) => sort('followers', direction)"
              >
                <Tooltip>
                  <RiStarSLine class="size-4" />
                  <template #tooltip>
                    {{ $t('Favoris') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                class="w-8"
                scope="col"
              >
                <div class="sr-only">
                  {{ $t('Actions') }}
                </div>
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="dataset in pageData.data"
              :key="dataset.id"
            >
              <td>
                <AdminContentWithTooltip>
                  <CdataLink
                    class="fr-link fr-reset-link"
                    :to="getDatasetAdminUrl(dataset)"
                  >
                    <TextClamp
                      :text="dataset.title"
                      :auto-resize="true"
                      :max-lines="2"
                    />
                  </CdataLink>
                </AdminContentWithTooltip>
              </td>
              <td class="font-mono text-right">
                {{ summarize(dataset.metrics.discussions) }}
              </td>
              <td class="font-mono text-right">
                {{ summarize(dataset.metrics.views) }}
              </td>
              <td class="font-mono text-right">
                {{ summarize(dataset.metrics.resources_downloads ?? 0) }}
              </td>
              <td class="font-mono text-right">
                {{ summarize(dataset.metrics.reuses) }}
              </td>
              <td class="font-mono text-right">
                {{ summarize(dataset.metrics.followers) }}
              </td>
              <td>
                <BrandedButton
                  size="xs"
                  color="tertiary"
                  :href="getCsvUrl(dataset)"
                  :icon="RiDownloadLine"
                  icon-only
                  external
                  keep-margins-even-without-borders
                >
                  {{ $t('Télécharger les statistiques du jeu de données') }}
                </BrandedButton>
              </td>
            </tr>
          </tbody>
        </AdminTable>
        <Pagination
          :page="page"
          :page-size="pageSize"
          :total-results="pageData.total"
          @change="(changedPage: number) => page = changedPage"
        />
      </div>
    </LoadingBlock>

    <div
      v-if="status != 'pending' && pageData && !pageData.total"
      class="flex flex-col items-center fr-my-3v"
    >
      <nuxt-img
        src="/illustrations/dataset.svg"
        class="h-20"
      />
      <p class="fr-text--bold fr-my-3v">
        {{ $t(`Vous n'avez pas encore publié de jeu de données.`) }}
      </p>
      <AdminPublishButton type="dataset" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, LoadingBlock, Pagination, summarize, Tooltip, type DatasetV2, type Organization, type User } from '@datagouv/components-next'
import { RiDownloadLine, RiEyeLine, RiLineChartLine, RiStarSLine } from '@remixicon/vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import type { DatasetSortedBy, PaginatedArray, SortDirection } from '~/types/types'

const props = defineProps<{
  organization?: Organization
  user?: User
}>()

const config = useRuntimeConfig()
const page = ref(1)
const pageSize = ref(20)

const sortedBy = ref<DatasetSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const downloadStatsUrl = computed(() => props.organization ? `/api/1/organizations/${props.organization.id}/datasets.csv` : null)

const params = computed(() => {
  const query = {
    organization: props.organization?.id,
    owner: props.user?.id,
    user: props.user?.id,
    sort: sortDirection.value,
    page_size: pageSize.value,
    page: page.value,
  }

  return query
})

const { data: pageData, status } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets/', { lazy: true, server: false, query: params })

function getCsvUrl(dataset: DatasetV2) {
  return `${config.public.metricsApi}/api/datasets/data/csv/?dataset_id__exact=${dataset.id}&metric_month__sort=asc`
}

function sort(column: DatasetSortedBy, newDirection: SortDirection) {
  sortedBy.value = column
  direction.value = newDirection
}

function sorted(column: DatasetSortedBy) {
  if (!sortedBy.value) {
    return undefined
  }
  if (sortedBy.value === column) {
    return direction.value
  }
  return null
}
</script>
