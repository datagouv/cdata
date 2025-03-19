<template>
  <div class="bg-white fr-p-3w">
    <div class="flex flex-wrap justify-between items-center">
      <h2
        v-if="pageData"
        class="text-sm font-bold uppercase m-0"
      >
        {{ t('{n} discussions', pageData.total) }}
      </h2>
    </div>

    <LoadingBlock :status>
      <AdminDiscussionsTable
        v-if="pageData && pageData.data.length"
        :discussions="pageData.data"
        :sort-direction="direction"
        :sorted-by
        :subject
        @sort="sort"
      />
      <Pagination
        v-if="pageData && pageData.total > pageSize"
        :page="page"
        :page-size="pageSize"
        :total-results="pageData.total"
        @change="(changedPage: number) => page = changedPage"
      />
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { Pagination } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import AdminDiscussionsTable from '../AdminTable/AdminDiscussionsTable/AdminDiscussionsTable.vue'
import type { PaginatedArray, SortDirection } from '~/types/types'
import type { DiscussionSortedBy, DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = defineProps<{
  subject: DiscussionSubjectTypes
}>()

const { t } = useI18n()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DiscussionSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)

function sort(column: DiscussionSortedBy, newDirection: SortDirection) {
  sortedBy.value = column
  direction.value = newDirection
}

const params = computed(() => {
  return {
    for: props.subject.id,

    sort: sortDirection.value,

    page_size: pageSize.value,
    page: page.value,
  }
})
const { data: pageData, status } = await useAPI<PaginatedArray<Thread>>('/api/1/discussions/', { lazy: true, query: params })
</script>
