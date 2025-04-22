<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        :external="true"
      >
        {{ $t('Home') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Organizations') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <OrganizationListPage
      v-if="organizations"
      :link="getLink"
      :organizations
      :q
      :sort
      :status
      @change="change"
    />
  </div>
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import type { LocationQueryValue } from 'vue-router'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import type { PaginatedArray } from '~/types/types'

const { t } = useI18n()

useSeoMeta({
  title: t('Organizations'),
})
const route = useRoute()
const q = ref(route.query.q ?? '')
const sort = ref((route.query.sort as string | null) || undefined)
const page = ref(parseInt(route.query.page as LocationQueryValue ?? '1', 10))
const pageSize = 21

function change(newQs: string, newSort: string | undefined, newPage: number) {
  q.value = newQs
  sort.value = newSort
  page.value = newPage
  return navigateTo({
    ...route,
    query: {
      ...route.query,
      q: q.value,
      page: page.value,
      sort: sort.value,
    },
  })
}

const { data: organizations, status } = await useAPI<PaginatedArray<Organization>>(`/api/2/organizations/search/`, { params:
  {
    q,
    page,
    page_size: pageSize,
    sort,
  },
})
</script>
