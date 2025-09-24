<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Ressources communautaires') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t("Ressources communautaires") }}
    </h1>
    <h2
      v-if="pageData && pageData.total"
      class="text-sm font-bold uppercase m-0"
    >
      {{ t('{n} ressources communautaires', pageData.total) }}
    </h2>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminCommunityResourcesTable
          :community-resources="pageData ? pageData.data : []"
          :sort-direction="direction"
          :sorted-by
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
        src="/illustrations/schema.svg"
        class="h-20"
      />
      <p class="fr-text--bold fr-my-3v">
        {{ t(`Vous n'avez pas encore publié de ressource communautaire`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination, type CommunityResource, type Organization, type User } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import AdminCommunityResourcesTable from '../AdminTable/AdminCommunityResourcesTable/AdminCommunityResourcesTable.vue'
import AdminBreadcrumb from '../Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '../Breadcrumbs/BreadcrumbItem.vue'
import type { CommunityResourceSortedBy, PaginatedArray, SortDirection } from '~/types/types'

const props = defineProps<{
  organization?: Organization | null
  user?: User | null
}>()
const { t } = useTranslation()
const config = useRuntimeConfig()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<CommunityResourceSortedBy>('created_at_internal')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config

function sort(column: CommunityResourceSortedBy, newDirection: SortDirection) {
  sortedBy.value = column
  direction.value = newDirection
}

const url = computed(() => {
  const url = new URL(`/api/1/datasets/community_resources/`, config.public.apiBase)
  if (props.organization) {
    url.searchParams.set('organization', props.organization.id)
  }
  else if (props.user) {
    url.searchParams.set('owner', props.user.id)
  }

  url.searchParams.set('sort', sortDirection.value)
  url.searchParams.set('q', qDebounced.value)
  url.searchParams.set('page_size', pageSize.value.toString())
  url.searchParams.set('page', page.value.toString())

  return url.toString()
})

const { data: pageData, status, refresh } = await useAPI<PaginatedArray<CommunityResource>>(url, { lazy: true })
</script>
