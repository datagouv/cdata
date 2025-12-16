<template>
  <div>
    <div
      v-if="status === 'success' && pageData?.total"
      class="flex flex-wrap justify-between items-center"
    >
      <h2 class="text-sm font-bold uppercase m-0">
        {{ t('{n} discussions | {n} discussion | {n} discussions', pageData.total) }}
      </h2>

      <div>
        <SelectGroup
          v-model="isClosed"
          hide-label
          :label="$t('Type')"
          :required="true"
          :options="[
            { label: $t('Toutes les discussions'), value: null },
            { label: $t('Discussions clôturées'), value: true },
            { label: $t('Discussions ouvertes'), value: false },
          ]"
          hide-null-option
        />
      </div>
    </div>

    <LoadingBlock
      v-slot="{ data: pageData }"
      :status
      :data="pageData"
    >
      <div v-if="pageData && pageData.total > 0">
        <AdminDiscussionsTable
          :discussions="pageData.data"
          :sort-direction="direction"
          :sorted-by
          :subject
          @sort="sort"
          @refresh="refresh"
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
        {{ t(`Il n'y a pas encore de discussion`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoadingBlock, Pagination, type Organization } from '@datagouv/components-next'
import AdminDiscussionsTable from '../AdminTable/AdminDiscussionsTable/AdminDiscussionsTable.vue'
import SelectGroup from '../Form/SelectGroup/SelectGroup.vue'
import type { PaginatedArray, SortDirection } from '~/types/types'
import type { DiscussionSortedBy, DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = defineProps<{
  organization?: Organization
  subject?: DiscussionSubjectTypes
}>()

const { t } = useTranslation()

const isClosed = ref(null as null | true | false)

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
  const query = {
    sort: sortDirection.value,

    page_size: pageSize.value,
    page: page.value,
  } as Record<string, string | number | null | boolean>

  if (isClosed.value !== null) {
    query['closed'] = isClosed.value ? 'true' : 'false'
  }

  if (props.subject) {
    query['for'] = props.subject.id
  }

  if (props.organization) {
    query['org'] = props.organization.id
  }

  return query
})
const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Thread>>('/api/1/discussions/', { lazy: true, query: params })
</script>
