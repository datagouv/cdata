<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        :external="true"
      >
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Réutilisations') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <ListPage
      :link="getLink"
      :reuses
      :initial-q="q"
      :sort
      :status
      :topic
      :topics
      :total-reuses="site.metrics.reuses"
      @change="change"
    />
  </div>
</template>

<script setup lang="ts">
import type { Reuse, ReuseTopic, Site } from '@datagouv/components-next'
import type { LocationQueryValue } from 'vue-router'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ListPage from '~/components/Reuses/ListPage.vue'
import type { PaginatedArray } from '~/types/types'

const { t } = useI18n()

useSeoMeta({
  title: t('Réutilisations'),
})

const route = useRoute()
const q = ref('')
watchEffect(() => {
  if (Array.isArray(route.query.q)) return
  if (!route.query.q) return
  q.value = route.query.q
})
const sort = ref((route.query.sort as string | null) || undefined)
const tag = ref((route.query.tag as string | null) || undefined)
const topic = ref((route.query.topic as string | null) || undefined)
const page = ref(parseInt(route.query.page as LocationQueryValue ?? '1', 10))
const pageSize = 21

function change(newQs: string, newTopic: string | undefined, newSort: string | undefined, newPage: number) {
  q.value = newQs
  sort.value = newSort
  page.value = newPage
  topic.value = newTopic
  return navigateTo({
    ...route,
    query: {
      ...route.query,
      q: q.value,
      page: page.value,
      sort: sort.value,
      tag: tag.value,
      topic: topic.value,
    },
  })
}

const { data: site } = await useAPI<Site>('/api/1/site')

const { data: topics } = await useAPI<Array<ReuseTopic>>('/api/1/reuses/topics/')

const { data: reuses, status } = await useAPI<PaginatedArray<Reuse>>(`/api/2/reuses/search/`, {
  headers: {
    'X-Fields': reusesXFields,
  },
  params: {
    q,
    page,
    page_size: pageSize,
    sort,
    tag,
    topic,
  },
})
</script>
