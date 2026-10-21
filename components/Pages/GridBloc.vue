<template>
  <div class="grid grid-cols-1 sm:grid-cols-12 gap-5">
    <div
      v-for="(cell, index) in bloc.cells"
      :key="cell.id"
      class="min-w-0"
      :class="[WIDTH_CLASSES[cell.width], { 'rounded-lg outline-1 outline-dashed outline-gray-300 p-3 pt-0': edit }]"
      data-testid="grid-cell"
    >
      <div
        v-if="edit"
        class="flex items-center justify-between gap-2 py-2 mb-2"
      >
        <select
          v-model="cell.width"
          class="text-sm text-gray-plain border rounded px-1 py-0.5 bg-white"
          :aria-label="$t('Largeur de la cellule')"
        >
          <option
            v-for="width in WIDTHS"
            :key="width"
            :value="width"
          >
            {{ width === '1' ? $t('Pleine largeur') : width }}
          </option>
        </select>
        <div class="flex gap-1">
          <BrandedButton
            color="tertiary"
            size="xs"
            :icon="RiArrowLeftLine"
            :disabled="index === 0"
            :title="$t('Déplacer vers la gauche')"
            @click="move(index, -1)"
          />
          <BrandedButton
            color="tertiary"
            size="xs"
            :icon="RiArrowRightLine"
            :disabled="index === bloc.cells.length - 1"
            :title="$t('Déplacer vers la droite')"
            @click="move(index, 1)"
          />
          <BrandedButton
            color="tertiary"
            size="xs"
            :icon="RiDeleteBinLine"
            :title="$t('Supprimer la cellule')"
            @click="bloc.cells.splice(index, 1)"
          />
        </div>
      </div>
      <BlocsList
        v-model="cell.blocs"
        :edit
        level="cell"
      />
    </div>

    <button
      v-if="edit"
      type="button"
      class="sm:col-span-3 min-h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
      @click="bloc.cells.push({ id: uuidv4(), width: '1/2', blocs: [] })"
    >
      <RiAddLine class="size-6" />
      <span class="text-sm">{{ $t('Ajouter une cellule') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiArrowLeftLine, RiArrowRightLine, RiDeleteBinLine } from '@remixicon/vue'
import BlocsList from './BlocsList.vue'
import type { GridBloc, GridCellWidth } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<GridBloc>({ required: true })

const WIDTHS: Array<GridCellWidth> = ['1/4', '1/3', '1/2', '2/3', '3/4', '1']

// On a 12 columns grid. Below `sm`, every cell takes the full width.
const WIDTH_CLASSES: Record<GridCellWidth, string> = {
  '1/4': 'sm:col-span-3',
  '1/3': 'sm:col-span-4',
  '1/2': 'sm:col-span-6',
  '2/3': 'sm:col-span-8',
  '3/4': 'sm:col-span-9',
  '1': 'sm:col-span-12',
}

function move(index: number, direction: -1 | 1) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= bloc.value.cells.length) return
  const moved = bloc.value.cells.splice(index, 1)[0]
  bloc.value.cells.splice(newIndex, 0, moved)
}
</script>
