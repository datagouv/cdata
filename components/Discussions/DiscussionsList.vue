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
      <div class="flex flex-wrap justify-between items-center mb-5 gap-2">
        <h2
          v-if="pageData"
          class="text-sm font-bold uppercase m-0 text-gray-title"
        >
          {{ t('{n} discussions | {n} discussion | {n} discussions', pageData.total) }}
          <template v-if="closed">
            {{ t('dont {n} clotûrées | dont {n} clotûrée | dont {n} clotûrées', closed) }}
          </template>
        </h2>

        <div class="flex flex-wrap items-center md:gap-x-6 gap-2">
          <AdminInput
            v-model="q"
            type="search"
            :icon="RiSearchLine"
            :placeholder="$t('Recherche')"
          />
          <div>
            <BrandedButton
              color="secondary"
              size="xs"
              :icon="RiAddLine"
              @click="showDiscussionForm"
            >
              {{ t("Démarrer une nouvelle discussion") }}
            </BrandedButton>
          </div>
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
        v-if="status != 'pending' && pageData && !pageData.total"
        class="flex flex-col items-center fr-my-3v"
      >
        <nuxt-img
          src="/illustrations/discussion.svg"
          class="h-20"
        />

        <template v-if="q">
          <p class="fr-text--bold fr-my-3v">
            {{ t(`Pas de résultats pour « {q} »`, { q }) }}
          </p>
          <BrandedButton
            color="primary"
            @click="resetFilters"
          >
            {{ $t('Réinitialiser la recherche') }}
          </BrandedButton>
        </template>
        <template v-else>
          <p class="fr-text--bold fr-my-3v">
            {{ t(`Il n'y a pas encore de discussion`) }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Pagination, SimpleBanner } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { RiAddLine, RiCloseCircleLine, RiSearchLine } from '@remixicon/vue'
import { refDebounced } from '@vueuse/core'
import NewDiscussionForm from './NewDiscussionForm.vue'
import DiscussionCard from './DiscussionCard.vue'
import type { PaginatedArray, SortDirection } from '~/types/types'
import type { DiscussionSortedBy, DiscussionSubject, DiscussionSubjectTypes, Thread } from '~/types/discussions'

const props = defineProps<{
  type: DiscussionSubject['class']
  subject: DiscussionSubjectTypes
  closed?: number
}>()

const { t } = useI18n()

const isClosed = ref(null as null | true | false)

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DiscussionSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config

const me = useMaybeMe()
const localePath = useLocalePath()

const newDiscussion = ref(false)

const resetFilters = () => {
  q.value = ''
  qDebounced.value = ''
}

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

    q: qDebounced.value,
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
