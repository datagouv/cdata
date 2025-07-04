<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design/">
        {{ $t('Design System') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/organization-search">
        {{ $t('Organization Search') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Organization Search
    </h1>

    <div class="bg-white py-4 px-4 -mx-4">
      <OrganizationListPage
        v-if="organizations"
        :link="getLink"
        :organizations
        :initial-q="q"
        :sort
        :status
        @change="change"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import type { LocationQueryValue } from 'vue-router'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import type { PaginatedArray } from '~/types/types'

const route = useRoute()
const q = ref('')
watchEffect(() => {
  if (Array.isArray(route.query.q)) return
  if (!route.query.q) return
  q.value = route.query.q
})
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
