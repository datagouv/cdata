<template>
  <div class="relative">
    <!-- `min-h` keeps an empty list a drop target -->
    <div
      ref="listRef"
      :data-blocs-level="level"
      data-drop-list
      :class="{ 'min-h-8': edit }"
    >
      <!-- One element per bloc, holding the bloc and the inserter above it: the drop item,
           whose position decides where a dragged item lands. -->
      <div
        v-for="(bloc, index) in blocs"
        :key="bloc.id"
        class="relative"
        :class="spacingBefore(index)"
        :data-bloc-class="bloc.class"
        data-drop-item
      >
        <!-- In the gap above the bloc (its top margin): a new bloc lands right here -->
        <BlocInserter
          v-if="edit && index > 0"
          class="absolute inset-x-0 bottom-full"
          :class="GAP_HEIGHTS[spacingBefore(index)]"
          :level
          :label="$t('Ajouter un bloc ici')"
          :data-testid="`insert-bloc-in-${level}`"
          @new-blocs="blocs.splice(index, 0, ...($event as Array<T>))"
        />
        <!-- Alone in its cell, the bloc is edited as the cell (see `GridBloc`) -->
        <EditItem
          :edit="edit && !mergedWithCell"
          :label="labels[bloc.class] ?? bloc.class"
          draggable
          :container="bloc.class === 'GridBloc' || bloc.class === 'AccordionListBloc'"
          :data-testid="`bloc-${bloc.class}`"
          @delete="blocs.splice(index, 1)"
          @drag-start="startBlocsDrag($event, { list: listRef!, index, kind: 'bloc', classes: draggedClasses(bloc), label: labels[bloc.class] ?? bloc.class })"
          @keyboard-move="moveWithKeyboard(blocs, $event, index)"
        >
          <component
            :is="BLOC_COMPONENTS[bloc.class]"
            v-if="BLOC_COMPONENTS[bloc.class]"
            v-model="(blocs[index] as any)"
            :edit
          />
          <MissingObjectBloc
            v-else-if="edit"
            :label="$t('Ce bloc ne peut pas être affiché ici')"
          />
        </EditItem>
      </div>
    </div>

    <!-- After the last bloc: below the list, in the room the section or the accordion item
         leaves; in a cell, whose bottom is the next row, along its bottom edge. -->
    <BlocInserter
      v-if="edit && blocs.length"
      class="absolute inset-x-0"
      :class="level === 'cell' ? 'bottom-0 h-5' : level === 'section' ? 'top-full h-12' : 'top-full h-6'"
      :level
      :label="level === 'cell' ? $t('Ajouter un bloc dans la colonne') : $t('Ajouter un bloc ici')"
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
        <EmptyListAddButton :data-testid="`add-bloc-in-${level}`">
          {{ $t('Ajouter un bloc') }}
        </EmptyListAddButton>
      </AddBlocDropdown>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends SectionContentBloc">
import * as Sentry from '@sentry/nuxt'
import AddBlocDropdown from './AddBlocDropdown.vue'
import BlocInserter from './BlocInserter.vue'
import EditItem from './EditItem.vue'
import EmptyListAddButton from './EmptyListAddButton.vue'
import MissingObjectBloc from './MissingObjectBloc.vue'
import type { GridCell, SectionContentBloc } from '~/types/pages'
import { BLOC_COMPONENTS } from '~/utils/pages'
import { BLOCS_LEVEL, IN_ACCORDION, acceptsDropped, draggedClasses, type BlocsLevel } from '~/utils/blocsLayout'
import { moveWithKeyboard, startBlocsDrag, useDropList } from '~/composables/useBlocsDrag'

const props = defineProps<{
  edit: boolean
  // Restricts the blocs offered in the "add" menu, see `AddBlocDropdown`.
  level: Exclude<BlocsLevel, 'page'>
}>()

const blocs = defineModel<Array<T>>({ required: true })

provide(BLOCS_LEVEL, props.level)

const labels = useBlocLabels()

// A cell holding a single bloc is that bloc for the editor: one tab, not two.
const mergedWithCell = computed(() => props.level === 'cell' && blocs.value.length === 1)

// A bloc moves between sections, cells and accordion items, where it is allowed. A grid cell
// dropped here leaves its blocs: that is how a bloc alone in its cell (dragged with the
// cell's handle) moves out of the grid. A cell holding a single bloc is that bloc: what is
// dropped on it lands next to it, as a cell of the grid, not inside it.
const listRef = ref<HTMLElement | null>(null)
const inAccordion = inject(IN_ACCORDION, false)
useDropList(listRef, {
  orientation: 'vertical',
  items: () => blocs.value,
  accepts: dragged => !mergedWithCell.value && acceptsDropped(props.level, dragged, inAccordion),
  receive: (item, dragged) => dragged.kind === 'cell' ? (item as GridCell).blocs : [item],
})

watchEffect(() => {
  for (const bloc of blocs.value) {
    if (!BLOC_COMPONENTS[bloc.class]) {
      Sentry.captureMessage(`Unknown bloc type: "${bloc.class}"`, 'warning')
    }
  }
})

type Spacing = '' | 'mt-4' | 'mt-6' | 'mt-12'

// The inserter between two blocs covers the whole gap the spacing leaves.
const GAP_HEIGHTS: Record<Spacing, string> = { '': '', 'mt-4': 'h-4', 'mt-6': 'h-6', 'mt-12': 'h-12' }

// A title stays close to what it introduces; other blocs are further apart.
function spacingBefore(index: number): Spacing {
  if (index === 0) return ''
  const afterTitle = blocs.value[index - 1].class === 'TitleBloc'
  if (props.level === 'cell') return afterTitle ? 'mt-4' : 'mt-6'
  return afterTitle ? 'mt-6' : 'mt-12'
}
</script>
