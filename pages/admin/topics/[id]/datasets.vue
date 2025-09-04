<template>
  <div>
    <div
      v-if="pageData"
      class="flex flex-wrap gap-x-4 gap-y-2 items-center"
    >
      <div class="w-full flex-none md:flex-1">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ $t('{n} jeux de données', pageData.total) }}
        </h2>
      </div>
      <div class="flex-none flex flex-wrap items-center md:gap-x-6 gap-2">
        <ModalWithButton
          :title="$t('Ajouter des jeux de données')"
          size="xl"
        >
          <template #button="{ attrs, listeners }">
            <BrandedButton
              size="xs"
              :icon="RiAddLine"
              v-bind="attrs"
              v-on="listeners"
            >
              {{ $t('Ajouter des jeux de données') }}
            </BrandedButton>
          </template>

          <DatasetsSelect
            v-model="datasets"
            :allow-reorder="false"
          />

          <template #footer="{ close }">
            <div class="flex-1 flex justify-end">
              <BrandedButton
                color="primary"
                :disabled="!datasets.length"
                @click="save(close)"
              >
                {{ $t("Sauvegarder") }}
              </BrandedButton>
            </div>
          </template>
        </ModalWithButton>
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminDatasetsTable
          :datasets="pageData ? pageData.data : []"
        >
          <template #actions="{ dataset }">
            <BrandedButton
              icon-only
              color="secondary-softer"
              keep-margins-even-without-borders
              :icon="RiDeleteBinLine"
              size="xs"
              @click="removeDataset(dataset)"
            >
              {{ $t('Supprimer le jeu de données') }}
            </BrandedButton>
          </template>
        </AdminDatasetsTable>
        <Pagination
          :page="page"
          :total-results="pageData.total"
          @change="(changedPage: number) => page = changedPage"
        />
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import type { Dataset, DatasetV2, TopicV2 } from '@datagouv/components-next'
import { BrandedButton, Pagination } from '@datagouv/components-next'
import { RiAddLine, RiDeleteBinLine } from '@remixicon/vue'
import AdminDatasetsTable from '~/components/AdminTable/AdminDatasetsTable/AdminDatasetsTable.vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  topic: TopicV2
}>()

const datasets = ref<Array<Dataset | DatasetV2>>([])

const page = ref(1)
const params = computed(() => {
  return { page: page.value }
})
const { data: pageData, status, refresh } = await useAPI<PaginatedArray<DatasetV2>>(`/api/2/topics/${props.topic.id}/datasets/`, { lazy: true, query: params })

const { $api } = useNuxtApp()
const { toast } = useToast()
const { t } = useI18n()
const save = async (close: () => void) => {
  await $api(`/api/2/topics/${props.topic.id}/datasets/`, {
    method: 'POST',
    body: datasets.value,
  })

  toast.success(t('Sauvegardé.'))
  close()
  datasets.value = []
  await refresh()
}
const removeDataset = async (dataset: Dataset | DatasetV2) => {
  await $api(`/api/2/topics/${props.topic.id}/datasets/${dataset.id}/`, { method: 'DELETE' })

  toast.success(t('Supprimé.'))
  await refresh()
}
</script>
