<template>
  <div>
    <div
      v-if="selectedDiscussion"
      ref="selectedDiscussionBannerRef"
      class="space-y-4"
    >
      <SimpleBanner

        type="primary"
        class="flex justify-between items-center"
      >
        <p class="!mb-0">
          {{ $t('Vous consultez une discussion spécifique sur {subject}.', {
            subject: {
              Dataservice: $t('cette API'),
              Dataset: $t('ce jeu de donnée'),
              Reuse: $t('cette réutilisation'),
              Post: $t('cet article'),
              Topic: $t('ce bouquet'),
              Organization: $t('cette organization'),
            }[type],
          }) }}
        </p>
        <BrandedButton
          color="secondary-softer"
          keep-margins-even-without-borders
          :icon="RiCloseCircleLine"
          :href="{ name: route.name, params: route.params, query: { ...route.query, discussion_id: undefined } }"
        >
          {{ $t("Voir toutes les discussions") }}
        </BrandedButton>
      </SimpleBanner>
      <DiscussionCard
        :thread="selectedDiscussion"
        :subject
      />
    </div>
    <div v-else>
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
            @click="showDiscussionForm"
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
        <div
          v-if="pageData && pageData.total > 0"
          class="space-y-5"
        >
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
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Pagination, SimpleBanner } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { RiAddLine, RiCloseCircleLine } from '@remixicon/vue'
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

const me = useMaybeMe()
const localePath = useLocalePath()

const newDiscussion = ref(false)

const showDiscussionForm = () => {
  if (me.value) {
    newDiscussion.value = true
  }
  else {
    navigateTo(localePath({ path: '/login', query: { next: route.fullPath } }), { external: true })
  }
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

  return query
})
const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Thread>>('/api/1/discussions/', { lazy: true, query: params })

const route = useRoute()
const { $api } = useNuxtApp()
const selectedDiscussion = ref<Thread | null>(null)
const selectedDiscussionBanner = useTemplateRef('selectedDiscussionBannerRef')
watchEffect(async () => {
  if ('discussion_id' in route.query && route.query.discussion_id) {
    selectedDiscussion.value = await $api<Thread>(`/api/1/discussions/${route.query.discussion_id}/`)
    nextTick(() => {
      selectedDiscussionBanner.value?.scrollIntoView({ behavior: 'smooth' })
    })
  }
  else {
    selectedDiscussion.value = null
  }
})
</script>
