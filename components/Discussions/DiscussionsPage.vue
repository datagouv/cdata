<template>
  <div>
    <div class="flex flex-wrap justify-between items-center">
      <h2
        v-if="status === 'success' && pageData.total"
        class="text-sm font-bold uppercase m-0"
      >
        {{ t('{n} discussions', pageData.total) }}
      </h2>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminDiscussionsTable
          :discussions="pageData.data"
          :sort-direction="direction"
          :sorted-by
          :subject
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
      v-if="pageData && !pageData.total"
      class="flex flex-col items-center"
    >
      <nuxt-img
        src="/illustrations/discussion.svg"
        class="h-20"
      />
      <p class="fr-text--bold fr-my-3v">
        {{ t(`There is no discussion yet`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination, type Organization } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { refDebounced } from '@vueuse/core'
import AdminDiscussionsTable from '../AdminTable/AdminDiscussionsTable/AdminDiscussionsTable.vue'
import type { PaginatedArray, SortDirection } from '~/types/types'
import type { DiscussionSortedBy, DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = defineProps<{
  organization?: Organization
  subject?: DiscussionSubjectTypes
}>()

const { t } = useI18n()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DiscussionSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config

function sort(column: DiscussionSortedBy, newDirection: SortDirection) {
  sortedBy.value = column
  direction.value = newDirection
}

const params = computed(() => {
  const query = {
    sort: sortDirection.value,
    q: qDebounced.value,

    page_size: pageSize.value,
    page: page.value,
  } as Record<string, string | number>

  if (props.subject) {
    query['subject'] = props.subject.id
  }

  if (props.organization) {
    query['org'] = props.organization.id
  }

  return query
})
const { data: pageData, status } = await useAPI<PaginatedArray<Thread>>('/api/1/discussions/', { lazy: true, query: params })
</script>
