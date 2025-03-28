<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Reuses') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-bold text-2xl mb-5">
      {{ t("Reuses") }}
    </h1>
    <TransferRequestList
      v-if="props.organization || props.user"
      type="Reuse"
      :recipient="props.organization || props.user"
      @done="refresh"
    />
    <div
      v-if="pageData"
      class="flex flex-wrap gap-x-4 gap-y-2 items-center"
    >
      <div class="w-full flex-none md:flex-1">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t('{n} reuses', pageData.total) }}
        </h2>
      </div>
      <div class="flex-none">
        <AdminInput
          v-model="q"
          type="search"
          :icon="RiSearchLine"
          :placeholder="$t('Search')"
        />
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminReusesTable
          :reuses="pageData ? pageData.data : []"
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
      class="flex flex-col items-center"
    >
      <nuxt-img
        src="/illustrations/reuse.svg"
        class="h-20"
      />
      <template v-if="q">
        <p class="fr-text--bold fr-my-3v">
          {{ t(`No results for "{q}"`, { q }) }}
        </p>
        <BrandedButton
          color="primary"
          @click="q = qDebounced = ''"
        >
          {{ $t('Reset filters') }}
        </BrandedButton>
      </template>
      <template v-else>
        <p class="fr-text--bold fr-my-3v">
          {{ t(`You haven't published a reuse yet`) }}
        </p>
        <AdminPublishButton type="reuse" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination, type Organization, type Reuse, type User } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RiSearchLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import AdminReusesTable from '../AdminTable/AdminReusesTable/AdminReusesTable.vue'
import AdminBreadcrumb from '../Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '../Breadcrumbs/BreadcrumbItem.vue'
import type { PaginatedArray, ReuseSortedBy, SortDirection } from '~/types/types'

const { t } = useI18n()

const props = defineProps<{
  organization?: Organization | null
  user?: User | null
}>()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<ReuseSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config

function sort(column: ReuseSortedBy, newDirection: SortDirection) {
  sortedBy.value = column
  direction.value = newDirection
}

const params = computed(() => {
  return {
    organization: props.organization?.id,
    owner: props.user?.id,

    sort: sortDirection.value,
    q: qDebounced.value,
    page_size: pageSize.value,
    page: page.value,
  }
})

const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Reuse>>('/api/1/reuses/', { lazy: true, query: params })
</script>
