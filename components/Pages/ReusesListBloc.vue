<template>
  <div
    ref="sortableRef"
    class="grid sm:grid-cols-3 gap-5"
  >
    <div
      v-for="(reuse, i) in bloc.reuses"
      :key="reuse.id"
      class="relative"
      :class="{ 'cursor-grab active:cursor-grabbing': edit }"
    >
      <button
        v-if="edit"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
        :title="$t('Supprimer')"
        @click="bloc.reuses.splice(i, 1)"
      >
        <RiDeleteBinLine class="size-5" />
      </button>
      <ReuseCard
        class="min-w-0"
        :reuse
      />
    </div>
    <AddObjectCard
      v-if="edit"
      :label="$t('Ajouter une réutilisation')"
      @click="openSelector"
    />
  </div>

  <ModalWithButton
    v-model="isSelectorOpen"
    :title="$t('Sélectionner des réutilisations')"
    size="lg"
  >
    <ReusesSelect v-model="selectedReuses" />
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
import { toast } from 'vue-sonner'
import { BrandedButton, ReuseCard } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'
import AddObjectCard from './AddObjectCard.vue'
import type { Reuse } from '@datagouv/components-next'
import type { ReusesListBloc } from '~/types/pages'

const props = defineProps<{
  edit: boolean
}>()

const bloc = defineModel<ReusesListBloc>({ required: true })

const { $api } = useNuxtApp()
const { t } = useTranslation()

const { sortableRef } = useBlocSortable(
  computed(() => bloc.value.reuses),
  toRef(props, 'edit'),
)

// Reuse selector modal
const isSelectorOpen = ref(false)
const selectedReuses = ref<Reuse[]>([])

function isFullReuse(obj: Reuse): boolean {
  return 'datasets' in obj
}

function openSelector() {
  selectedReuses.value = [...bloc.value.reuses]
  isSelectorOpen.value = true
}

async function validateSelection() {
  try {
    const fullReuses = await Promise.all(
      selectedReuses.value.map(async (reuse) => {
        if (isFullReuse(reuse)) {
          return reuse
        }
        return await $api<Reuse>(`/api/1/reuses/${reuse.id}/`)
      }),
    )
    bloc.value.reuses = fullReuses
  }
  catch {
    toast.error(t('Erreur lors du chargement des réutilisations'))
  }
  isSelectorOpen.value = false
}
</script>
