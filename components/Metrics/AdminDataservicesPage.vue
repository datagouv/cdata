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
                {{ $t("Titre de l'API") }}
              </AdminTableTh>
              <AdminTableTh
                class="w-16"
                scope="col"
              >
                <Tooltip>
                  <RiChat3Line class="size-4" />
                  <template #tooltip>
                    {{ $t('Discussions') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                class="w-16"
                scope="col"
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
              v-for="dataservice in pageData.data"
              :key="dataservice.id"
            >
              <td>
                <AdminContentWithTooltip>
                  <CdataLink
                    class="fr-link fr-reset-link"
                    :to="getDataserviceAdminUrl(dataservice)"
                  >
                    <TextClamp
                      :text="dataservice.title"
                      :auto-resize="true"
                      :max-lines="2"
                    />
                  </CdataLink>
                </AdminContentWithTooltip>
              </td>
              <td class="font-mono text-right">
                {{ summarize(dataservice.metrics.discussions) }}
              </td>
              <td class="font-mono text-right">
                {{ summarize(dataservice.metrics.views) }}
              </td>
              <td class="font-mono text-right">
                {{ summarize(dataservice.metrics.followers) }}
              </td>
              <td>
                <BrandedButton
                  size="xs"
                  color="secondary-softer"
                  :href="getCsvUrl(dataservice)"
                  :icon="RiDownloadLine"
                  icon-only
                  external
                  keep-margins-even-without-borders
                >
                  {{ $t(`Télécharger les statistiques de l'API`) }}
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
      class="flex flex-col items-center"
    >
      <nuxt-img
        src="/illustrations/dataservice.svg"
        class="h-20"
      />
      <p class="fr-text--bold fr-my-3v">
        {{ $t(`Vous n'avez pas encore publié d'API`) }}
      </p>
      <AdminPublishButton type="dataservice" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, LoadingBlock, Pagination, summarize, Tooltip, type Dataservice, type Organization, type User } from '@datagouv/components-next'
import { RiChat3Line, RiDownloadLine, RiEyeLine, RiStarSLine } from '@remixicon/vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import type { DataserviceSortedBy, PaginatedArray, SortDirection } from '~/types/types'

const props = defineProps<{
  organization?: Organization
  user?: User
}>()

const config = useRuntimeConfig()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DataserviceSortedBy>('title')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const downloadStatsUrl = computed(() => props.organization ? `/api/1/organizations/${props.organization.id}/dataservices.csv` : null)

const params = computed(() => {
  return {
    organization: props.organization?.id,
    owner: props.user?.id,

    sort: sortDirection.value,
    page_size: pageSize.value,
    page: page.value,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<Dataservice>>('/api/1/dataservices/', { lazy: true, query: params })

function getCsvUrl(dataservice: Dataservice) {
  return `${config.public.metricsApi}/api/dataservices/data/csv/?dataservice_id__exact=${dataservice.id}&metric_month__sort=asc`
}

function sort(column: DataserviceSortedBy, newDirection: SortDirection) {
  sortedBy.value = column
  direction.value = newDirection
}

function sorted(column: DataserviceSortedBy) {
  if (!sortedBy.value) {
    return undefined
  }
  if (sortedBy.value === column) {
    return direction.value
  }
  return null
}
</script>
