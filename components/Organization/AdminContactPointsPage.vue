<template>
  <div>
    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminContactPointsTable
          :contact-points="pageData ? pageData.data : []"
          :organization
          :sort-direction="direction"
          :sorted-by
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
      v-if="status != 'pending' && pageData && !pageData.total"
      class="flex flex-col items-center"
    >
      <nuxt-img
        src="/illustrations/people.svg"
        class="h-40"
      />
      <p class="font-bold my-3 text-center">
        {{ t(`Vous n'avez pas encore créé de points de contact.`) }}
        <br>
        {{ t('Vous pouvez le faire un éditant un jeu de données ou une API.') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination, type Organization } from '@datagouv/components-next'
import AdminContactPointsTable from '~/components/AdminTable/AdminContactPointsTable/AdminContactPointsTable.vue'
import type { ContactPoint, PaginatedArray, SortDirection } from '~/types/types'

const props = defineProps<{
  organization: Organization
}>()

const { t } = useI18n()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref('created')
const direction = ref<SortDirection>('desc')

const params = computed(() => {
  return {
    page_size: pageSize.value,
    page: page.value,
  }
})

const { data: pageData, status, refresh } = await useAPI<PaginatedArray<ContactPoint>>(`/api/1/organizations/${props.organization.id}/contacts/`, { lazy: true, params })
</script>
