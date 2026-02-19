<template>
  <div>
    <h3 class="text-sm font-bold uppercase mt-5 mb-3">
      {{ t('Choisir les jeux de données éditables par ce membre') }}
    </h3>

    <div class="mb-3">
      <AdminInput
        v-model="q"
        type="search"
        :icon="RiSearchLine"
        :placeholder="$t('Rechercher un jeu de données')"
        class="w-full"
      />
    </div>

    <LoadingBlock
      v-slot="{ data: slotData }"
      :status
      :data="pageData"
    >
      <div v-if="slotData && slotData.total > 0">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh
                scope="col"
                class="w-10"
              />
              <AdminTableTh scope="col">
                {{ t('Titre') }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-24"
              >
                {{ t('Statut') }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-28"
              >
                {{ t('Créé le') }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-32"
              >
                {{ t('Mis à jour le') }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="dataset in slotData.data"
              :key="dataset.id"
              class="cursor-pointer"
              @click="toggle(dataset.id)"
            >
              <td class="text-center">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(dataset.id)"
                  class="size-4 cursor-pointer"
                  @click.stop="toggle(dataset.id)"
                >
              </td>
              <td>
                {{ dataset.title }}
              </td>
              <td>
                <DatasetBadge :dataset />
              </td>
              <td>{{ formatDate(dataset.created_at) }}</td>
              <td>{{ formatDate(dataset.last_modified) }}</td>
            </tr>
          </tbody>
        </AdminTable>
        <Pagination
          :page="page"
          :page-size="pageSize"
          :total-results="slotData.total"
          @change="(changedPage: number) => page = changedPage"
        />
      </div>
      <p
        v-else-if="slotData && slotData.total === 0 && q"
        class="text-sm text-gray-medium text-center py-4"
      >
        {{ t('Aucun résultat pour « {q} »', { q }) }}
      </p>
      <p
        v-else-if="slotData && slotData.total === 0"
        class="text-sm text-gray-medium text-center py-4"
      >
        {{ t("Aucun jeu de données dans cette organisation") }}
      </p>
    </LoadingBlock>

    <p class="text-sm text-gray-medium mt-2">
      {{ selectedIds.size === 0
        ? t('Aucun jeu de données sélectionné')
        : t('{n} jeu de données sélectionné | {n} jeu de données sélectionné | {n} jeux de données sélectionnés', { n: selectedIds.size })
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { LoadingBlock, Pagination, useFormatDate } from '@datagouv/components-next'
import type { DatasetV2 } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { RiSearchLine } from '@remixicon/vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import DatasetBadge from '~/components/AdminBadge/DatasetBadge.vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  organizationId: string
}>()

const selectedIds = defineModel<Set<string>>({ required: true })

const { t } = useTranslation()
const { formatDate } = useFormatDate()
const config = useRuntimeConfig()

const page = ref(1)
const pageSize = 20
const q = ref('')
const qDebounced = refDebounced(q, config.public.searchDebounce)

watch(qDebounced, () => {
  page.value = 1
})

const params = computed(() => ({
  organization: props.organizationId,
  page: page.value,
  page_size: pageSize,
  q: qDebounced.value,
  sort: '-created',
}))

const { data: pageData, status } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets/', {
  lazy: true,
  query: params,
})

function toggle(datasetId: string) {
  const next = new Set(selectedIds.value)
  if (next.has(datasetId)) {
    next.delete(datasetId)
  }
  else {
    next.add(datasetId)
  }
  selectedIds.value = next
}
</script>
