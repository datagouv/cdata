<template>
  <div class="relative">
    <div
      ref="listRef"
      class="flex flex-wrap gap-(--grid-gap) [--grid-gap:1.25rem]"
      data-drop-list
    >
      <EditItem
        v-for="(cell, index) in bloc.cells"
        :key="cell.id"
        :edit
        :label="cellLabel(cell)"
        draggable
        :container="cell.blocs.length > 1"
        class="group/cell"
        :class="[cellClass(cell), { 'rounded-lg outline-1 outline-dashed outline-gray-300 p-3': edit && !cell.blocs.length }]"
        :style="cellStyle(cell)"
        data-testid="grid-cell"
        data-drop-item
        @delete="bloc.cells.splice(index, 1)"
        @drag-start="startBlocsDrag($event, { list: listRef!, index, kind: 'cell', classes: cell.blocs.map(cellBloc => cellBloc.class), label: cellLabel(cell) })"
        @keyboard-move="moveWithKeyboard(bloc.cells, $event, index)"
      >
        <template
          v-if="cell.width"
          #actions
        >
          <MenuItem v-slot="{ active }">
            <button
              type="button"
              class="flex w-full items-center gap-2 px-3 py-1.5"
              :class="{ 'bg-gray-100': active }"
              @click="cell.width = null"
            >
              <RiExpandHorizontalLine class="size-4" />
              {{ $t('Largeur automatique') }}
            </button>
          </MenuItem>
        </template>

        <BlocsList
          v-model="cell.blocs"
          :edit
          level="cell"
        />

        <!-- The boundary after the column, in the gap on its right: its line resizes the
             column (snapping to the allowed widths), its button inserts a column there.
             Columns are full width below `sm`, so there is no boundary there. -->
        <div
          v-if="edit"
          class="hidden sm:block absolute inset-y-0 left-full w-(--grid-gap) group/boundary"
          data-edit-control
        >
          <div
            role="separator"
            aria-orientation="vertical"
            tabindex="0"
            :aria-label="$t('Largeur de la colonne')"
            :aria-valuetext="widthLabel(cell.width)"
            :title="$t('Glisser pour redimensionner, double-clic pour la largeur automatique')"
            class="absolute inset-0 flex justify-center cursor-col-resize touch-none outline-none"
            data-testid="grid-cell-resize"
            @pointerdown="startResize($event, index)"
            @dblclick="cell.width = null"
            @keydown="resizeWithKeyboard($event, index)"
          >
            <div
              class="w-0.5 h-full bg-new-primary transition-opacity"
              :class="resizing === index ? 'opacity-100' : 'opacity-0 group-hover/cell:opacity-40 group-hover/boundary:opacity-100 group-focus-within/boundary:opacity-100 delay-400 group-hover/cell:delay-0 group-hover/boundary:delay-0'"
            />
            <span
              v-if="resizing === index"
              class="absolute top-2 left-full ml-1 px-1.5 py-0.5 rounded bg-gray-title text-white text-xs tabular-nums whitespace-nowrap pointer-events-none"
            >
              {{ widthLabel(cell.width) }}
            </span>
          </div>
          <!-- No transform on the way to the menu: it would trap the menu under the page -->
          <div class="absolute inset-x-0 top-1/2 -mt-3 flex justify-center">
            <AddBlocDropdown
              level="cell"
              @new-blocs="addCells($event as Array<SectionContentBloc>, index + 1)"
            >
              <button
                type="button"
                class="relative inline-flex items-center justify-center size-6 rounded-full bg-new-primary text-white shadow-sm opacity-0 group-hover/boundary:opacity-100 focus-visible:opacity-100 transition-opacity delay-400 group-hover/boundary:delay-0 focus-visible:delay-0"
                :title="$t('Ajouter une colonne ici')"
                :aria-label="$t('Ajouter une colonne ici')"
                :data-testid="index === bloc.cells.length - 1 ? 'add-grid-cell' : 'insert-grid-cell'"
              >
                <RiAddLine class="size-4" />
              </button>
            </AddBlocDropdown>
          </div>
        </div>
      </EditItem>
    </div>

    <!-- An empty grid: its first column, the only thing it can hold -->
    <div
      v-if="edit && !bloc.cells.length"
      class="flex justify-center rounded-lg outline-1 outline-dashed outline-gray-300 py-6"
    >
      <AddBlocDropdown
        level="cell"
        @new-blocs="addCells($event as Array<SectionContentBloc>, 0)"
      >
        <button
          type="button"
          class="flex items-center gap-1 text-sm whitespace-nowrap text-gray-400 hover:text-gray-600"
          data-testid="add-grid-cell"
        >
          <RiAddLine class="size-4" />
          {{ $t('Ajouter une colonne') }}
        </button>
      </AddBlocDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { MenuItem } from '@headlessui/vue'
import { RiAddLine, RiExpandHorizontalLine } from '@remixicon/vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import BlocsList from './BlocsList.vue'
import EditItem from './EditItem.vue'
import type { GridBloc, GridCell, GridCellWidth, LeafBloc, SectionContentBloc } from '~/types/pages'
import { OBJECT_CELL_WIDTH, acceptsDropped } from '~/utils/pages'
import { moveWithKeyboard, startBlocsDrag, useDropList } from '~/composables/useBlocsDrag'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<GridBloc>({ required: true })

const { t } = useTranslation()
const labels = useBlocLabels()

// Share of the row, from the narrowest.
const FRACTIONS: Record<GridCellWidth, number> = { '1/4': 1 / 4, '1/3': 1 / 3, '1/2': 1 / 2, '2/3': 2 / 3, '3/4': 3 / 4, '1': 1 }
const WIDTHS = Object.keys(FRACTIONS) as Array<GridCellWidth>

function widthLabel(width: GridCellWidth | null) {
  if (!width) return t('Automatique')
  return width === '1' ? t('Pleine largeur') : width
}

// Below `sm`, every cell takes the full width. Above, a cell with a width takes that share
// of the row (minus its share of the gaps); the others share what is left, and go to the
// next row rather than getting narrower than 12rem.
function cellClass(cell: GridCell) {
  return [
    'relative min-w-0 w-full',
    cell.width
      ? 'sm:flex-none sm:basis-[calc(var(--cell-fraction)*100%-(1-var(--cell-fraction))*var(--grid-gap))]'
      : 'sm:w-auto sm:flex-[1_1_12rem]',
  ]
}

function cellStyle(cell: GridCell) {
  return cell.width ? { '--cell-fraction': FRACTIONS[cell.width] } : undefined
}

// A cell holding a single bloc goes by the name of that bloc: for the editor, it is the bloc.
function cellLabel(cell: GridCell) {
  return cell.blocs.length === 1 ? labels[cell.blocs[0].class] ?? labels.GridCell : labels.GridCell
}

// A bloc dropped between the cells becomes a cell of its own, at the automatic width.
const listRef = ref<HTMLElement | null>(null)
useDropList(listRef, {
  orientation: 'horizontal',
  items: () => bloc.value.cells,
  accepts: dragged => acceptsDropped('grid', dragged),
  receive: (item, dragged): Array<GridCell> => dragged.kind === 'bloc'
    ? [{ id: uuidv4(), width: null, blocs: [item as LeafBloc] }]
    : [item as GridCell],
})

// Each picked bloc gets a cell of its own, inserted at `at`: an object at the width of its
// former list of cards, anything else like the cell before (automatic in a row of
// automatic cells).
function addCells(blocs: Array<SectionContentBloc>, at: number) {
  const before = bloc.value.cells[at - 1]?.width ?? null
  const cells: Array<GridCell> = blocs.map(newBloc => ({
    id: uuidv4(),
    width: newBloc.class in OBJECT_CELL_WIDTH ? OBJECT_CELL_WIDTH[newBloc.class as keyof typeof OBJECT_CELL_WIDTH] : before,
    blocs: [newBloc as LeafBloc],
  }))
  bloc.value.cells.splice(at, 0, ...cells)
}

const resizing = ref<number | null>(null)

function nearestWidth(fraction: number): GridCellWidth {
  return WIDTHS.reduce((best, width) => Math.abs(FRACTIONS[width] - fraction) < Math.abs(FRACTIONS[best] - fraction) ? width : best)
}

// Share of the row the cell takes on screen, whether it has a width or not.
function renderedFraction(cellElement: HTMLElement, right: number) {
  const row = listRef.value!
  const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0
  return (right - cellElement.getBoundingClientRect().left + gap) / (row.getBoundingClientRect().width + gap)
}

function startResize(event: PointerEvent, index: number) {
  const handle = event.currentTarget as HTMLElement
  const cellElement = handle.closest<HTMLElement>('[data-drop-item]')!

  handle.setPointerCapture(event.pointerId)
  resizing.value = index

  const onMove = (moveEvent: PointerEvent) => {
    bloc.value.cells[index].width = nearestWidth(renderedFraction(cellElement, moveEvent.clientX))
  }
  const onUp = () => {
    resizing.value = null
    handle.removeEventListener('pointermove', onMove)
    handle.removeEventListener('pointerup', onUp)
    handle.removeEventListener('pointercancel', onUp)
  }
  handle.addEventListener('pointermove', onMove)
  handle.addEventListener('pointerup', onUp)
  handle.addEventListener('pointercancel', onUp)
}

function resizeWithKeyboard(event: KeyboardEvent, index: number) {
  const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key]
  if (!step) return
  event.preventDefault()
  const cell = bloc.value.cells[index]
  const cellElement = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-drop-item]')!
  // An automatic cell starts from the width it has on screen.
  const current = cell.width ?? nearestWidth(renderedFraction(cellElement, cellElement.getBoundingClientRect().right))
  const next = WIDTHS[WIDTHS.indexOf(current) + step]
  if (next) cell.width = next
}
</script>
