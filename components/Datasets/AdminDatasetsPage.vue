<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Datasets') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-bold text-2xl mb-5">
      {{ t("Datasets") }}
    </h1>

    <TransferRequestList
      v-if="props.organization || props.user"
      type="Dataset"
      :recipient="props.organization || props.user"
      @done="refresh"
    />

    <DatasetsMetrics
      v-if="organization && pageData && pageData.total > 0"
      class="mb-8"
      :organization
    />

    <div
      v-if="pageData"
      class="flex flex-wrap gap-x-4 gap-y-2 items-center"
    >
      <div class="w-full flex-none md:flex-1">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t('{n} datasets', pageData.total) }}
        </h2>
      </div>
      <div class="flex-none flex flex-wrap items-center md:gap-x-6 gap-2">
        <SearchableSelect
          v-model="datasetsStatus"
          :placeholder="$t('Filter by status')"
          :options="statusOption"
          :display-value="(option) => option.label"
          class="mb-0"
        />
        <AdminInput
          v-model="q"
          type="search"
          :icon="RiSearchLine"
          :placeholder="$t('Search')"
        />
        <BrandedButton
          v-if="organization"
          :href="pageData.total ? `/organizations/${organization.id}/datasets.csv` : undefined"
          size="xs"
          :external="true"
          :icon="RiDownloadLine"
        >
          {{ t('Download catalog') }}
        </BrandedButton>
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminDatasetsTable
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
          {{ t(`No results for "{q}"`, { q }) }}
        </p>
        <p
          v-else
          class="fr-text--bold fr-my-3v"
        >
          {{ t('No results') }}
        </p>
        <BrandedButton
          color="primary"
          @click="resetFilters"
        >
          {{ $t('Reset filters') }}
        </BrandedButton>
      </template>
      <template v-else>
        <p class="fr-text--bold fr-my-3v">
          {{ t(`You haven't published a dataset yet`) }}
        </p>
        <AdminPublishButton type="dataset" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { Pagination, type Dataset, type Organization, type User } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RiDownloadLine, RiSearchLine } from '@remixicon/vue'
import TransferRequestList from '../TransferRequestList.vue'
import AdminBreadcrumb from '../Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '../Breadcrumbs/BreadcrumbItem.vue'
import DatasetsMetrics from './DatasetsMetrics.vue'
import AdminDatasetsTable from '~/components/AdminTable/AdminDatasetsTable/AdminDatasetsTable.vue'
import type { DatasetSortedBy, PaginatedArray, SortDirection } from '~/types/types'

const props = defineProps<{
  organization?: Organization | null
  user?: User | null
}>()
const { t } = useI18n()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DatasetSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config
const datasetsStatus = defineModel<string | null>()

const statusOption = [{
  label: t('public'),
  id: 'public',
}, {
  label: t('archived'),
  id: 'archived',
}, {
  label: t('draft'),
  id: 'private',
}, {
  label: t('deleted'),
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

const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Dataset>>('/api/1/datasets/', { lazy: true, query: params })
</script>
