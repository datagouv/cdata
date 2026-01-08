<template>
  <div
    :ref="el => initSortable(el as HTMLElement)"
    class="grid sm:grid-cols-2 gap-5"
  >
    <div
      v-for="(dataservice, i) in bloc.dataservices"
      :key="dataservice.id"
      class="relative"
      :class="{ 'cursor-grab active:cursor-grabbing': edit }"
    >
      <button
        v-if="edit"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
        :title="$t('Supprimer')"
        @click="bloc.dataservices.splice(i, 1)"
      >
        <RiDeleteBinLine class="size-5" />
      </button>
      <DataserviceCard
        class="min-w-0"
        :dataservice
      />
    </div>
    <AddObjectCard
      v-if="edit"
      :label="$t('Ajouter une API')"
      @click="openSelector"
    />
  </div>

  <ModalWithButton
    v-model="isSelectorOpen"
    :title="$t('Sélectionner des APIs')"
    size="lg"
  >
    <DataservicesSelect v-model="selectedDataservices" />
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
import { BrandedButton, DataserviceCard } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'
import AddObjectCard from './AddObjectCard.vue'
import type { Dataservice } from '@datagouv/components-next'
import type { DataservicesListBloc } from '~/types/pages'

const props = defineProps<{
  edit: boolean
}>()

const bloc = defineModel<DataservicesListBloc>({ required: true })

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

      const item = bloc.value.dataservices.splice(evt.oldIndex, 1)[0]
      bloc.value.dataservices.splice(evt.newIndex, 0, item)
    },
  })
}

// Dataservice selector modal
const isSelectorOpen = ref(false)
const selectedDataservices = ref<Dataservice[]>([])

function openSelector() {
  selectedDataservices.value = [...bloc.value.dataservices]
  isSelectorOpen.value = true
}

function validateSelection() {
  bloc.value.dataservices = selectedDataservices.value
  isSelectorOpen.value = false
}
</script>
