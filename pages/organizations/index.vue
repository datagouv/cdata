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
        {{ $t('Organisations') }}
      </BreadcrumbItem>
    </Breadcrumb>
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
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import { useUrlSearchParams } from '@vueuse/core'
import type { LocationQueryValue } from 'vue-router'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import type { OrganizationSearchParams } from '~/types/form'
import type { PaginatedArray } from '~/types/types'

const { t } = await useTranslation()

useSeoMeta({
  title: t('Organisations'),
})
const route = useRoute()
const params = useUrlSearchParams<OrganizationSearchParams>('history', {
  initialValue: route.query,
  removeNullishValues: true,
  removeFalsyValues: true,
})
const nonFalsyParams = computed(() => {
  const filteredParams = Object.entries(toValue(params)).filter(([_k, v]) => v)
  return { ...Object.fromEntries(filteredParams), page_size: pageSize }
})

const q = ref('')
watchEffect(() => {
  if (Array.isArray(route.query.q)) return
  if (!route.query.q) return
  q.value = route.query.q
})

const sort = ref((route.query.sort as string | null) || undefined)
const page = ref(parseInt(route.query.page as LocationQueryValue ?? '1', 10))
const pageSize = 21

watchEffect(() => {
  if (page.value > 1 || params.page) params.page = page.value.toString()
  params.q = q.value
  params.sort = sort.value
})

function change(newQs: string, newSort: string | undefined, newPage: number) {
  q.value = newQs
  sort.value = newSort
  page.value = newPage
}

const { data: organizations, status } = await useAPI<PaginatedArray<Organization>>(`/api/2/organizations/search/`, {
  params: nonFalsyParams,
})
</script>
