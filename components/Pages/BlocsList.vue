<template>
  <div class="relative">
    <!-- Before the first bloc: above the list, in the room the section or the accordion item
         leaves, as after the last one. -->
    <BlocInserter
      v-if="edit && blocs.length"
      class="absolute inset-x-0 bottom-full"
      :class="level === 'section' ? 'h-12' : 'h-6'"
      :level
      :label="$t('Ajouter un bloc ici')"
      :data-testid="`prepend-bloc-in-${level}`"
      @new-blocs="blocs.unshift(...($event as Array<T>))"
    />
    <!-- A grid of 12 columns, where each bloc takes its width, the blocs wrapping in rows.
         Below `sm`, the blocs are stacked. `min-h` keeps an empty list a drop target. -->
    <div
      ref="listRef"
      :data-blocs-level="level"
      data-drop-list
      class="@container grid grid-cols-1 sm:grid-cols-12 gap-x-(--grid-gap) [--grid-gap:1.25rem]"
      :class="{ 'min-h-8': edit }"
    >
      <!-- One element per bloc, holding the bloc and its controls: the drop item, whose
           position decides where a dragged bloc lands. A title or an image beside a taller bloc
           (a hero and its illustration) is centered on it; the others fill the height of the
           row, so that the cards of a row are as tall as each other. Beside an image covering
           several rows, which share what it adds to their height, the blocs gather on its
           middle: those of its first row at their bottom, the next ones at their top. -->
      <div
        v-for="(bloc, index) in blocs"
        :key="bloc.id"
        class="relative min-w-0 sm:col-span-(--span) sm:row-span-(--row-span) max-sm:mt-(--stacked-space) sm:mt-(--row-space)"
        :class="{
          'self-center': (bloc.class === 'TitleBloc' || bloc.class === 'ImageBloc') && !rows.beside[index],
          'sm:self-end': rows.beside[index] === 'first-row',
          'sm:self-start': rows.beside[index] === 'next-rows',
        }"
        :style="placement(index)"
        :data-bloc-class="bloc.class"
        :data-row-span="rows.spans[index] > 1 ? rows.spans[index] : undefined"
        :data-beside-image="rows.beside[index] ?? undefined"
        data-drop-item
      >
        <!-- In the gap above a row, across the list, or across the columns an image covering
             several rows leaves beside it: a new bloc lands right here, starting the row -->
        <BlocInserter
          v-if="edit && index > 0 && rows.starts.has(index)"
          class="absolute left-0 bottom-full w-[calc((100cqw+var(--grid-gap))*var(--inserter-columns)/12-var(--grid-gap))] h-(--row-space)"
          :level
          :label="$t('Ajouter un bloc ici')"
          :data-testid="`insert-bloc-in-${level}`"
          @new-blocs="insertAbove($event as Array<T>, index)"
        />
        <EditItem
          :edit
          :label="labels[bloc.class] ?? bloc.class"
          draggable
          :container="bloc.class === 'AccordionListBloc'"
          :data-testid="`bloc-${bloc.class}`"
          @delete="blocs.splice(index, 1)"
          @drag-start="startBlocsDrag($event, { list: listRef!, index, kind: 'bloc', blocClass: bloc.class, label: labels[bloc.class] ?? bloc.class })"
          @keyboard-move="moveWithKeyboard(blocs, $event, index, stepBloc)"
        >
          <template
            v-if="bloc.width"
            #actions
          >
            <MenuItem v-slot="{ active }">
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-1.5"
                :class="{ 'bg-gray-100': active }"
                @click="bloc.width = null"
              >
                <RiExpandHorizontalLine class="size-4" />
                {{ $t('Pleine largeur') }}
              </button>
            </MenuItem>
          </template>
          <component
            :is="BLOC_COMPONENTS[bloc.class]"
            v-if="BLOC_COMPONENTS[bloc.class]"
            v-model="(blocs[index] as any)"
            :edit
          />
          <!-- A bloc cdata does not render (the explorer, an unknown class): shown while
               editing only, so that it can be moved or removed -->
          <div
            v-else-if="edit"
            class="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-medium"
          >
            <RiErrorWarningLine class="size-4 shrink-0" />
            {{ $t('Le bloc « {name} » ne peut pas être affiché ici', { name: labels[bloc.class] ?? bloc.class }) }}
          </div>
        </EditItem>

        <!-- The boundary after the bloc, in the gap on its right: its line resizes the bloc
             (snapping to the allowed widths); between two blocs of a row, its button inserts
             a bloc there. Blocs are stacked below `sm`, so there is no boundary there. -->
        <div
          v-if="edit"
          class="hidden sm:block absolute inset-y-0 left-full w-(--grid-gap) group/boundary group/add"
          data-edit-control
        >
          <div
            role="separator"
            aria-orientation="vertical"
            tabindex="0"
            :aria-label="$t('Largeur du bloc')"
            :aria-valuetext="widthLabel(bloc.width)"
            :title="$t('Glisser pour redimensionner, double-clic pour la pleine largeur')"
            class="absolute inset-0 flex justify-center cursor-col-resize touch-none outline-none"
            data-testid="bloc-resize"
            @pointerdown="startResize($event, index)"
            @dblclick="bloc.width = null"
            @keydown="resizeWithKeyboard($event, index)"
          >
            <div
              class="w-0.5 h-full bg-new-primary transition-opacity"
              :class="resizing === index ? 'opacity-100' : 'opacity-0 group-hover/boundary:opacity-100 group-focus-within/boundary:opacity-100'"
            />
            <span
              v-if="resizing === index"
              class="absolute top-2 left-full ml-1 px-1.5 py-0.5 rounded bg-gray-title text-white text-xs tabular-nums whitespace-nowrap pointer-events-none"
            >
              {{ widthLabel(bloc.width) }}
            </span>
          </div>
          <!-- No transform on the way to the menu: it would trap the menu under the page -->
          <div
            v-if="index + 1 < blocs.length && !rows.starts.has(index + 1)"
            class="absolute inset-x-0 top-1/2 -mt-3 flex justify-center"
          >
            <AddBlocDropdown
              :level
              @new-blocs="insertBeside($event as Array<T>, index)"
            >
              <RoundAddButton
                :label="$t('Ajouter un bloc ici')"
                :data-testid="`insert-bloc-beside-in-${level}`"
              />
            </AddBlocDropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- After the last bloc: below the list, in the room the section or the accordion item
         leaves. -->
    <BlocInserter
      v-if="edit && blocs.length"
      class="absolute inset-x-0 top-full"
      :class="level === 'section' ? 'h-12' : 'h-6'"
      :level
      :label="$t('Ajouter un bloc ici')"
      :data-testid="`add-bloc-in-${level}`"
      @new-blocs="blocs.push(...($event as Array<T>))"
    />
    <!-- An empty list: the only thing it can hold -->
    <div
      v-else-if="edit"
      class="flex justify-center"
    >
      <AddBlocDropdown
        :level
        @new-blocs="blocs.push(...($event as Array<T>))"
      >
        <button
          type="button"
          class="flex items-center gap-1 text-sm whitespace-nowrap text-gray-400 hover:text-gray-600"
          :data-testid="`add-bloc-in-${level}`"
        >
          <RiAddLine class="size-4" />
          {{ $t('Ajouter un bloc') }}
        </button>
      </AddBlocDropdown>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends SectionContentBloc">
import * as Sentry from '@sentry/nuxt'
import { MenuItem } from '@headlessui/vue'
import { RiAddLine, RiErrorWarningLine, RiExpandHorizontalLine } from '@remixicon/vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import BlocInserter from './BlocInserter.vue'
import EditItem from './EditItem.vue'
import RoundAddButton from './RoundAddButton.vue'
import type { BlocWidth, SectionColor, SectionContentBloc } from '~/types/pages'
import { SECTION_COLOR } from '~/utils/blocs'
import { BLOC_COMPONENTS, OBJECT_WIDTH } from '~/utils/pages'
import { BLOCS_LEVEL, BLOC_SPANS, acceptsDropped, columnGap, imageRows, rowShare, rowSpacings, rowStarts, stepBloc, type BlocsLevel, type RowSpacing, type RowWidth } from '~/utils/blocsLayout'
import { moveWithKeyboard, startBlocsDrag, useDropList } from '~/composables/useBlocsDrag'

const props = defineProps<{
  edit: boolean
  // Restricts the blocs offered in the "add" menu, see `AddBlocDropdown`.
  level: BlocsLevel
  // The background of the section, for the blocs it holds, down to its accordions.
  color?: SectionColor | null
}>()

const blocs = defineModel<Array<T>>({ required: true })

provide(BLOCS_LEVEL, props.level)
if (props.level === 'section') provide(SECTION_COLOR, toRef(() => props.color ?? null))

const { t } = useTranslation()
const labels = useBlocLabels()

// A bloc moves between sections and accordion items, where it is allowed.
const listRef = ref<HTMLElement | null>(null)
useDropList(listRef, {
  orientation: 'grid',
  items: () => blocs.value,
  accepts: dragged => acceptsDropped(props.level, dragged),
})

watchEffect(() => {
  for (const bloc of blocs.value) {
    if (!BLOC_COMPONENTS[bloc.class]) {
      Sentry.captureMessage(`Unknown bloc type: "${bloc.class}"`, 'warning')
    }
  }
})

// The space above a row; the inserter above a row covers all of it.
const ROW_SPACES: Record<RowSpacing, string> = { 'none': '0', 'column-gap': 'var(--grid-gap)', 'after-title': '1.5rem', 'between-rows': '3rem' }

const rows = computed(() => ({
  starts: new Set(rowStarts(blocs.value.map(bloc => bloc.width))),
  spacing: rowSpacings(blocs.value),
  ...imageRows(blocs.value),
}))

// The columns a bloc takes, and the space above it. Stacked below `sm`, the blocs of a row keep
// the column gap between them.
function placement(index: number) {
  const spacing = rows.value.spacing[index]
  const stacked = index === 0 || rows.value.starts.has(index) ? spacing : 'column-gap'
  return {
    '--span': BLOC_SPANS[blocs.value[index].width ?? 'whole'],
    '--row-span': rows.value.spans[index],
    '--row-space': ROW_SPACES[spacing],
    '--stacked-space': ROW_SPACES[stacked],
    '--inserter-columns': besideImage(index) ?? 12,
  }
}

// The columns an image covering several rows leaves beside the row starting at `index`, when
// it stands beside that row: not above it, as for the first of its rows.
function besideImage(index: number): number | null {
  return rows.value.beside[index] === 'next-rows' ? rows.value.freeColumns[index] : null
}

// Blocs inserted above a row start it: beside an image covering several rows, at the width
// it leaves (an object keeping its own, as narrower), so as not to cut through it.
function insertAbove(newBlocs: Array<T>, index: number) {
  const columns = besideImage(index)
  const width = WIDTHS.find(width => BLOC_SPANS[width] === columns)
  if (width) {
    for (const newBloc of newBlocs) {
      if (!(newBloc.class in OBJECT_WIDTH)) newBloc.width = width === 'whole' ? null : width
    }
  }
  blocs.value.splice(index, 0, ...newBlocs)
}

// Blocs inserted between two blocs of a row join it: an object at its own width, anything
// else at the width of the bloc it follows.
function insertBeside(newBlocs: Array<T>, index: number) {
  const width = blocs.value[index].width
  for (const newBloc of newBlocs) {
    if (!(newBloc.class in OBJECT_WIDTH)) newBloc.width = width
  }
  blocs.value.splice(index + 1, 0, ...newBlocs)
}

// Share of the row, from the narrowest.
const WIDTHS = Object.keys(BLOC_SPANS) as Array<RowWidth>

function widthLabel(width: BlocWidth | null) {
  return width ?? t('Pleine largeur')
}

const resizing = ref<number | null>(null)

function nearestWidth(fraction: number): RowWidth {
  return WIDTHS.reduce((best, width) => Math.abs(BLOC_SPANS[width] / 12 - fraction) < Math.abs(BLOC_SPANS[best] / 12 - fraction) ? width : best)
}

// The whole row is stored as no width at all, which is what a new bloc has.
function setWidth(index: number, width: RowWidth) {
  blocs.value[index].width = width === 'whole' ? null : width
}

function startResize(event: PointerEvent, index: number) {
  const handle = event.currentTarget as HTMLElement
  const blocElement = handle.closest<HTMLElement>('[data-drop-item]')!

  handle.setPointerCapture(event.pointerId)
  resizing.value = index
  // From where the bloc started: widened past what is left of its row, it wraps to the next
  // one, and measured from its new left edge, it would jump to the whole row.
  const left = blocElement.getBoundingClientRect().left

  const onMove = (moveEvent: PointerEvent) => {
    const list = listRef.value!
    setWidth(index, nearestWidth(rowShare(moveEvent.clientX - left, list.getBoundingClientRect().width, columnGap(list))))
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
  const next = WIDTHS[WIDTHS.indexOf(blocs.value[index].width ?? 'whole') + step]
  if (next) setWidth(index, next)
}
</script>
