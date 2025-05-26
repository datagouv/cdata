<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Topics') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="fr-h3 fr-mb-5v">
      {{ t("Topics") }}
    </h1>
    <div
      v-if="pageData"
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle"
    >
      <div class="fr-col">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t('{n} topics', pageData.total) }}
        </h2>
      </div>
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <AdminInput
          v-model="q"
          type="search"
          :icon="RiSearchLine"
          :placeholder="$t('Search')"
        />
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh scope="col">
                {{ t("Name") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Created at") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Datasets") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Reuses") }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="topic in pageData.data"
              :key="topic.id"
            >
              <td>
                <NuxtLinkLocale :to="`/admin/topics/${topic.id}`">
                  {{ topic.name }}
                </NuxtLinkLocale>
              </td>
              <td>{{ formatDate(topic.created_at) }}</td>
              <td>{{ topic.datasets.total }}</td>
              <td>{{ topic.reuses.total }}</td>
            </tr>
          </tbody>
        </AdminTable>
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
        src="/illustrations/users.svg"
        class="h-20"
      />
      <template v-if="q">
        <p class="fr-text--bold fr-my-3v">
          {{ t(`No results for "{q}"`, { q }) }}
        </p>
        <BrandedButton
          color="primary"
          @click="q = qDebounced = ''"
        >
          {{ $t('Reset filters') }}
        </BrandedButton>
      </template>
      <p
        v-else
        class="fr-text--bold fr-my-3v"
      >
        {{ t(`No topics`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate, Pagination, type TopicV2 } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RiSearchLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import type { DiscussionSortedBy } from '~/types/discussions'
import type { PaginatedArray, SortDirection } from '~/types/types'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import AdminInput from '~/components/AdminInput.vue'

const { t } = useI18n()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DiscussionSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config

const query = computed(() => {
  return {
    q: qDebounced.value,
    sort: sortDirection.value,

    page_size: pageSize.value,
    page: page.value,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<TopicV2>>('/api/2/topics', { query, lazy: true })
</script>
