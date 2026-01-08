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
import { BrandedButton, DataserviceCard } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'
import AddObjectCard from './AddObjectCard.vue'
import type { Dataservice } from '@datagouv/components-next'
import type { DataservicesListBloc } from '~/types/pages'

const props = defineProps<{
  edit: boolean
}>()

const bloc = defineModel<DataservicesListBloc>({ required: true })

const { initSortable } = useBlocSortable(
  computed(() => bloc.value.dataservices),
  toRef(props, 'edit'),
)

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
