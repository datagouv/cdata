<template>
  <div
    :ref="el => initSortable(el as HTMLElement)"
    class="grid sm:grid-cols-2 gap-5"
  >
    <div
      v-for="(dataset, i) in bloc.datasets"
      :key="dataset.id"
      class="relative"
      :class="{ 'cursor-grab active:cursor-grabbing': edit }"
    >
      <button
        v-if="edit"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
        :title="$t('Supprimer')"
        @click="bloc.datasets.splice(i, 1)"
      >
        <RiDeleteBinLine class="size-5" />
      </button>
      <DatasetCardLg
        class="min-w-0"
        :dataset
      />
    </div>
    <AddObjectCard
      v-if="edit"
      :label="$t('Ajouter un jeu de données')"
      @click="openSelector"
    />
  </div>

  <ModalWithButton
    v-model="isSelectorOpen"
    :title="$t('Sélectionner des jeux de données')"
    size="lg"
  >
    <DatasetsSelect v-model="selectedDatasets" />
    <template #footer>
      <div class="flex-1 flex justify-end">
        <BrandedButton @click="validateSelection">
          {{ $t('Valider') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import Sortable, { type MoveEvent, type SortableEvent } from 'sortablejs'
import { toast } from 'vue-sonner'
import { BrandedButton } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'
import AddObjectCard from './AddObjectCard.vue'
import type { Dataset, DatasetV2 } from '@datagouv/components-next'
import type { DatasetsListBloc } from '~/types/pages'
import type { DatasetSuggest } from '~/types/types'

const props = defineProps<{
  edit: boolean
}>()

const bloc = defineModel<DatasetsListBloc>({ required: true })

const { $api } = useNuxtApp()
const { t } = useTranslation()

// Sortable
let sortableInstance: Sortable | null = null

function initSortable(el: HTMLElement | null) {
  if (!el) return

  if (!props.edit) {
    sortableInstance?.destroy()
    sortableInstance = null
    return
  }

  if (sortableInstance) return

  sortableInstance = Sortable.create(el, {
    animation: 150,
    ghostClass: 'opacity-50',
    filter: '.add-object-card',
    onMove: (evt: MoveEvent) => {
      if (evt.related?.classList.contains('add-object-card')) {
        return false
      }
      return true
    },
    onEnd: (evt: SortableEvent) => {
      if (evt.oldIndex === undefined || evt.newIndex === undefined) return
      if (evt.oldIndex === evt.newIndex) return

      const item = bloc.value.datasets.splice(evt.oldIndex, 1)[0]
      bloc.value.datasets.splice(evt.newIndex, 0, item)
    },
  })
}

// Dataset selector modal
const isSelectorOpen = ref(false)
const selectedDatasets = ref<Array<Dataset | DatasetV2 | DatasetSuggest>>([])

function isFullDataset(obj: Dataset | DatasetV2 | DatasetSuggest): obj is DatasetV2 {
  return 'harvest' in obj || 'metrics' in obj
}

function openSelector() {
  selectedDatasets.value = [...bloc.value.datasets]
  isSelectorOpen.value = true
}

async function validateSelection() {
  try {
    const fullDatasets = await Promise.all(
      selectedDatasets.value.map(async (dataset) => {
        if (isFullDataset(dataset)) {
          return dataset
        }
        return await $api<DatasetV2>(`/api/2/datasets/${dataset.id}/`)
      }),
    )
    bloc.value.datasets = fullDatasets
  }
  catch {
    toast.error(t('Erreur lors du chargement des jeux de données'))
  }
  isSelectorOpen.value = false
}
</script>
