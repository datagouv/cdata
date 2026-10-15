<template>
  <div>
    <h3 class="text-sm font-bold uppercase mt-5 mb-3">
      {{ t('Choisir les jeux de données éditables par ce membre') }}
    </h3>

    <TabGroup
      size="sm"
      :default-index="defaultTabIndex"
      @change="onTabChange"
    >
      <TabList class="mb-3">
        <Tab>{{ t('Assignés ({n})', { n: selectedIds.size }) }}</Tab>
        <Tab>{{ t('Ajouter') }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <LoadingBlock
            v-slot="{ data: datasets }"
            :status="assignedStatus"
            :data="assignedDatasets"
          >
            <DatasetAssignmentTable
              v-if="datasets.length > 0"
              v-model="selectedIds"
              :datasets
            />
          </LoadingBlock>
        </TabPanel>
        <TabPanel>
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
            <div v-if="slotData.total > 0">
              <DatasetAssignmentTable
                v-model="selectedIds"
                :datasets="slotData.data"
              />
              <Pagination
                :page="page"
                :page-size="pageSize"
                :total-results="slotData.total"
                @change="(changedPage: number) => page = changedPage"
              />
            </div>
            <p
              v-else-if="q"
              class="text-sm text-gray-medium text-center py-4"
            >
              {{ t('Aucun résultat pour « {q} »', { q }) }}
            </p>
            <p
              v-else
              class="text-sm text-gray-medium text-center py-4"
            >
              {{ t("Aucun jeu de données dans cette organisation") }}
            </p>
          </LoadingBlock>
        </TabPanel>
      </TabPanels>
    </TabGroup>

    <SimpleBanner
      v-if="selectedIds.size === 0"
      type="primary"
      class="mt-2 text-sm"
    >
      {{ t("Aucun jeu de données sélectionné : ce membre ne pourra modifier aucun jeu de données tant que vous ne lui en aurez pas assigné.") }}
    </SimpleBanner>
  </div>
</template>

<script setup lang="ts">
import { LoadingBlock, Pagination, SimpleBanner, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@datagouv/components-next'
import type { DatasetV2 } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref, shallowReactive, watch } from 'vue'
import { RiSearchLine } from '@remixicon/vue'
import DatasetAssignmentTable from '~/components/DatasetAssignmentTable.vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  organizationId: string
}>()

const selectedIds = defineModel<Set<string>>({ required: true })

const { t } = useTranslation()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()

const ASSIGNED_TAB_INDEX = 0
const ADD_TAB_INDEX = 1
// A member without any dataset has nothing to review: go straight to adding some.
const defaultTabIndex = selectedIds.value.size > 0 ? ASSIGNED_TAB_INDEX : ADD_TAB_INDEX

// Rows of the assigned tab: the selection as it was when the tab was opened, so that a
// dataset unchecked by mistake stays on screen and can be checked again.
const assignedIds = ref([...selectedIds.value])

function onTabChange(index: number) {
  if (index === ASSIGNED_TAB_INDEX) {
    assignedIds.value = [...selectedIds.value]
  }
}

const page = ref(1)
const pageSize = 10
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

// Datasets checked from the add tab are already loaded; only the ones assigned before the
// form was opened have to be fetched, since an assignment only references its dataset id.
const knownDatasets = shallowReactive(new Map<string, DatasetV2>())

watch(pageData, (data) => {
  for (const dataset of data?.data ?? []) {
    knownDatasets.set(dataset.id, dataset)
  }
}, { immediate: true })

const assignedStatus = ref<'pending' | 'success' | 'error'>('success')

watch(assignedIds, async (ids) => {
  const missingIds = ids.filter(id => !knownDatasets.has(id))
  if (missingIds.length === 0) return

  assignedStatus.value = 'pending'
  try {
    const datasets = await Promise.all(missingIds.map(id => $api<DatasetV2>(`/api/2/datasets/${id}/`)))
    for (const dataset of datasets) {
      knownDatasets.set(dataset.id, dataset)
    }
    assignedStatus.value = 'success'
  }
  catch {
    assignedStatus.value = 'error'
  }
}, { immediate: true })

const assignedDatasets = computed(() => assignedIds.value
  .map(id => knownDatasets.get(id))
  .filter(dataset => dataset !== undefined),
)
</script>
