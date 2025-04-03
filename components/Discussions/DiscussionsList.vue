<template>
  <div>
    <div
      v-if="status === 'success'"
      class="flex flex-wrap justify-between items-center mb-5"
    >
      <h2 class="text-sm font-bold uppercase m-0 text-gray-title">
        {{ t('{n} discussions', pageData.total) }}
      </h2>

      <div>
        <BrandedButton
          color="secondary"
          size="xs"
          :icon="RiAddLine"
          @click="newDiscussion = true"
        >
          {{ t("Start a new discussion") }}
        </BrandedButton>
      </div>
    </div>

    <NewDiscussionForm
      v-if="newDiscussion"
      class="mb-5"
      :subject="{ class: type, id: subject.id }"
      @new="refresh(); newDiscussion = false"
      @close="newDiscussion = false"
    />

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <div class="space-y-2.5">
          <DiscussionCard
            v-for="thread in pageData.data"
            :key="thread.id"
            :thread
            :subject
            @change="refresh"
          />
        </div>

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
import { BrandedButton, Pagination } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { RiAddLine } from '@remixicon/vue'
import NewDiscussionForm from './NewDiscussionForm.vue'
import DiscussionCard from './DiscussionCard.vue'
import type { PaginatedArray, SortDirection } from '~/types/types'
import type { DiscussionSortedBy, DiscussionSubject, DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = defineProps<{
  type: DiscussionSubject['class']
  subject: DiscussionSubjectTypes
}>()

const { t } = useI18n()

const isClosed = ref(null as null | true | false)

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DiscussionSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)

const newDiscussion = ref(false)

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

  return query
})
const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Thread>>('/api/1/discussions/', { lazy: true, query: params })
</script>
