<template>
  <div class="relative group/grid">
    <div
      ref="sortableRef"
      class="flex flex-wrap gap-(--grid-gap) [--grid-gap:1.25rem]"
    >
      <EditItem
        v-for="(cell, index) in bloc.cells"
        :key="cell.id"
        :edit
        :label="cell.blocs.length === 1 ? labels[cell.blocs[0].class] ?? labels.GridCell : labels.GridCell"
        group="cells"
        class="group/cell"
        :class="[cellClass(cell), { 'rounded-lg outline-1 outline-dashed outline-gray-300 p-3': edit && !cell.blocs.length }]"
        :style="cellStyle(cell)"
        data-testid="grid-cell"
        data-sortable-item
        @delete="bloc.cells.splice(index, 1)"
        @keyboard-move="moveWithKeyboard($event, index)"
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

        <!-- Resize handle on the right edge, snapping to the allowed widths. Cells are
               full width below `sm`, so there is nothing to resize there. -->
        <div
          v-if="edit"
          role="separator"
          aria-orientation="vertical"
          tabindex="0"
          :aria-label="$t('Largeur de la cellule')"
          :aria-valuetext="widthLabel(cell.width)"
          :title="$t('Glisser pour redimensionner, double-clic pour la largeur automatique')"
          class="hidden sm:flex absolute -right-[calc(var(--grid-gap)/2+0.375rem)] top-0 bottom-0 w-3 cursor-col-resize items-center justify-center z-20 touch-none opacity-0 group-hover/cell:opacity-100 focus-visible:opacity-100"
          :class="{ 'opacity-100': resizing === index }"
          data-testid="grid-cell-resize"
          @pointerdown="startResize($event, index)"
          @dblclick="cell.width = null"
          @keydown="resizeWithKeyboard($event, index)"
        >
          <div class="h-10 w-1 rounded-full bg-new-primary" />
          <span
            v-if="resizing === index"
            class="absolute top-1/2 left-4 -translate-y-1/2 px-1.5 py-0.5 rounded bg-gray-title text-white text-xs tabular-nums whitespace-nowrap pointer-events-none"
          >
            {{ widthLabel(cell.width) }}
          </span>
        </div>
      </EditItem>
    </div>

    <!-- Bottom right corner, out of the way of the resize handles, shown on hover: the cell
         is created with its content -->
    <div
      v-if="edit"
      class="absolute right-0 -bottom-3.5 opacity-0 group-hover/grid:opacity-100 focus-within:opacity-100 transition-opacity"
      :class="{ 'opacity-100': !bloc.cells.length }"
    >
      <AddBlocDropdown
        level="cell"
        @new-blocs="addCells($event as Array<SectionContentBloc>)"
      >
        <button
          type="button"
          class="inline-flex items-center justify-center size-7 rounded-full bg-white text-gray-medium hover:text-gray-title shadow-sm ring-1 ring-gray-300"
          :title="$t('Ajouter une cellule')"
          :aria-label="$t('Ajouter une cellule')"
          data-testid="add-grid-cell"
        >
          <RiAddLine class="size-4" />
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
import { OBJECT_CELL_WIDTH } from '~/utils/pages'

const props = defineProps<{
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

const { sortableRef, moveWithKeyboard } = useBlocSortable(
  () => bloc.value.cells,
  toRef(props, 'edit'),
  { group: 'cells' },
)

// Each picked bloc gets a cell of its own: an object at the width of its former list of
// cards, anything else like the last cell (automatic in a row of automatic cells).
function addCells(blocs: Array<SectionContentBloc>) {
  for (const newBloc of blocs) {
    const width = newBloc.class in OBJECT_CELL_WIDTH
      ? OBJECT_CELL_WIDTH[newBloc.class as keyof typeof OBJECT_CELL_WIDTH]
      : bloc.value.cells.at(-1)?.width ?? null
    bloc.value.cells.push({ id: uuidv4(), width, blocs: [newBloc as LeafBloc] })
  }
}

const resizing = ref<number | null>(null)

function nearestWidth(fraction: number): GridCellWidth {
  return WIDTHS.reduce((best, width) => Math.abs(FRACTIONS[width] - fraction) < Math.abs(FRACTIONS[best] - fraction) ? width : best)
}

// Share of the row the cell takes on screen, whether it has a width or not.
function renderedFraction(cellElement: HTMLElement, right: number) {
  const row = sortableRef.value!
  const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0
  return (right - cellElement.getBoundingClientRect().left + gap) / (row.getBoundingClientRect().width + gap)
}

function startResize(event: PointerEvent, index: number) {
  const handle = event.currentTarget as HTMLElement
  const cellElement = handle.closest<HTMLElement>('[data-sortable-item]')!

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
  const cellElement = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-sortable-item]')!
  // An automatic cell starts from the width it has on screen.
  const current = cell.width ?? nearestWidth(renderedFraction(cellElement, cellElement.getBoundingClientRect().right))
  const next = WIDTHS[WIDTHS.indexOf(current) + step]
  if (next) cell.width = next
}
</script>
