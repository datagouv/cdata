<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Thématiques') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-extrabold text-gray-title mb-5">
      {{ t("Thématiques") }}
    </h1>
    <div
      v-if="pageData"
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle"
    >
      <div class="fr-col">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t('{n} thématiques', pageData.total) }}
        </h2>
      </div>
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <AdminInput
          v-model="q"
          type="search"
          :icon="RiSearchLine"
          :placeholder="$t('Recherche')"
        />
      </div>
    </div>

    <LoadingBlock
      v-slot="{ data: pageData }"
      :status
      :data="pageData"
    >
      <div v-if="pageData && pageData.total">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh scope="col">
                {{ t("Nom") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Créé le") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Jeux de données") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ t("Réutilisations") }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="topic in pageData.data"
              :key="topic.id"
            >
              <td>
                <CdataLink :to="`/admin/topics/${topic.id}`">
                  {{ topic.name }}
                </CdataLink>
              </td>
              <td>{{ formatDate(topic.created_at) }}</td>
              <td>{{ elementsCounts[topic.id]?.['Dataset'] ?? "..." }}</td>
              <td>{{ elementsCounts[topic.id]?.['Reuse'] ?? "..." }}</td>
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
          {{ t(`Pas de résultats pour « {q} »`, { q }) }}
        </p>
        <BrandedButton
          color="primary"
          @click="q = qDebounced = ''"
        >
          {{ $t('Réinitialiser les filtres') }}
        </BrandedButton>
      </template>
      <p
        v-else
        class="fr-text--bold fr-my-3v"
      >
        {{ t(`Aucune thématique`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopicV2, TopicElement, TopicElementClass } from '@datagouv/components-next'
import { useFormatDate, LoadingBlock, Pagination, BrandedButton } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { RiSearchLine } from '@remixicon/vue'
import type { DiscussionSortedBy } from '~/types/discussions'
import type { PaginatedArray, SortDirection } from '~/types/types'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import AdminInput from '~/components/AdminInput.vue'

const { t } = useTranslation()
const { formatDate } = useFormatDate()

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DiscussionSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config
const elementsCounts = ref<Record<string, Record<TopicElementClass, number>>>({})

const query = computed(() => {
  return {
    q: qDebounced.value,
    sort: sortDirection.value,

    page_size: pageSize.value,
    page: page.value,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<TopicV2>>('/api/2/topics/', { query, lazy: true })

const countElements = async (topic: TopicV2, _class: 'Dataset' | 'Reuse') => {
  const data = await $fetch<PaginatedArray<TopicElement>>(topic.elements.href, {
    query: { page_size: 1, class: _class },
  })
  return data.total
}

watch(pageData, async (data) => {
  if (!data) return
  for (const topic of data.data) {
    elementsCounts.value[topic.id] = {
      Dataset: await countElements(topic, 'Dataset'),
      Reuse: await countElements(topic, 'Reuse'),
    }
  }
}, { immediate: true })
</script>
