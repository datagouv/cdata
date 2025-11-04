<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Jeux de données') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t("Jeux de données") }}
    </h1>

    <TransferRequestList
      v-if="props.organization || props.user"
      type="Dataset"
      :recipient="props.organization || props.user"
      @done="refresh"
    />

    <div
      v-if="pageData"
      class="flex flex-wrap gap-x-4 gap-y-2 items-center"
    >
      <div class="w-full flex-none md:flex-1">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t('{n} jeux de données', pageData.total) }}
        </h2>
      </div>
      <div class="flex-none flex flex-wrap items-center md:gap-x-6 gap-2">
        <SearchableSelect
          v-model="datasetsStatus"
          :placeholder="$t('Filtrer par statut')"
          :label="$t('Filtrer par statut')"
          :options="statusOption"
          :display-value="(option) => option.label"
          :multiple="false"
          class="mb-0"
          hide-label
        />
        <AdminInput
          v-model="q"
          type="search"
          :icon="RiSearchLine"
          :placeholder="$t('Recherche')"
        />
        <BrandedButton
          v-if="organization"
          :href="pageData.total ? `${config.public.apiBase}/api/1/organizations/${organization.id}/datasets.csv` : undefined"
          size="xs"
          :external="true"
          :icon="RiDownloadLine"
        >
          {{ t('Télécharger le catalogue') }}
        </BrandedButton>
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminDatasetsTable
          :activities="datasetActivities"
          :datasets="pageData ? pageData.data : []"
          :sort-direction="direction"
          :sorted-by
          @sort="sort"
        />
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
      <template v-if="q || datasetsStatus">
        <p
          v-if="q"
          class="fr-text--bold fr-my-3v"
        >
          {{ t(`Pas de résultats pour « {q} »`, { q }) }}
        </p>
        <p
          v-else
          class="fr-text--bold fr-my-3v"
        >
          {{ t('Pas de résultats') }}
        </p>
        <BrandedButton
          color="primary"
          @click="resetFilters"
        >
          {{ $t('Réinitialiser les filtres') }}
        </BrandedButton>
      </template>
      <template v-else>
        <p class="fr-text--bold fr-my-3v">
          {{ t(`Vous n'avez pas encore publié de jeu de données`) }}
        </p>
        <AdminPublishButton type="dataset" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, LoadingBlock, Pagination } from '@datagouv/components-next'
import type { Activity, DatasetV2, Organization, User } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { RiDownloadLine, RiSearchLine } from '@remixicon/vue'
import TransferRequestList from '../TransferRequestList.vue'
import AdminBreadcrumb from '../Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '../Breadcrumbs/BreadcrumbItem.vue'
import AdminDatasetsTable from '~/components/AdminTable/AdminDatasetsTable/AdminDatasetsTable.vue'
import type { DatasetSortedBy, PaginatedArray, SortDirection } from '~/types/types'

const props = defineProps<{
  organization?: Organization | null
  user?: User | null
}>()
const { t } = useTranslation()

const config = useRuntimeConfig()
const { $api } = useNuxtApp()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DatasetSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config
const datasetsStatus = ref<{ label: string, id: string } | null>(null)
const datasetActivities = ref<Record<DatasetV2['id'], Activity>>({})

const statusOption = [{
  label: t('Public'),
  id: 'public',
}, {
  label: t('Archivé'),
  id: 'archived',
}, {
  label: t('Brouillon'),
  id: 'private',
}, {
  label: t('Supprimé'),
  id: 'deleted',
}]

function sort(column: DatasetSortedBy, newDirection: SortDirection) {
  sortedBy.value = column
  direction.value = newDirection
}

function resetFilters() {
  q.value = ''
  qDebounced.value = ''
  datasetsStatus.value = null
}

const params = computed(() => {
  const query = {
    organization: props.organization?.id,
    owner: props.user?.id,

    sort: sortDirection.value,
    q: qDebounced.value,
    page_size: pageSize.value,
    page: page.value,
  }

  if (datasetsStatus.value) {
    if (datasetsStatus.value.id === 'public') {
      query['archived'] = 'false'
      query['deleted'] = 'false'
      query['private'] = 'false'
    }
    if (datasetsStatus.value.id === 'deleted') {
      query['deleted'] = 'true'
    }
    if (datasetsStatus.value.id === 'archived') {
      query['archived'] = 'true'
    }
    if (datasetsStatus.value.id === 'private') {
      query['private'] = 'true'
    }
  }

  return query
})

const { data: pageData, status, refresh } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets/', { lazy: true, query: params })

watchEffect(async () => {
  if (pageData.value) {
    const activities = await getLatestActivitiesForObjects($api, pageData.value.data)
    datasetActivities.value = { ...datasetActivities.value, ...activities }
  }
})
</script>
