<template>
  <div class="relative">
    <!-- `min-h` keeps an empty list a drop target -->
    <div
      ref="sortableRef"
      :data-blocs-level="level"
      :data-merged-with-cell="mergedWithCell ? '' : undefined"
      :class="{ 'min-h-8': edit }"
    >
      <!-- One element per bloc, holding the bloc and the inserter above it: a fragment
           would leave behind the nodes delimiting it when the bloc is dragged away. -->
      <div
        v-for="(bloc, index) in blocs"
        :key="bloc.id"
        class="relative"
        :class="spacingBefore(index)"
        :data-bloc-class="bloc.class"
        data-sortable-item
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
          group="blocs"
          :container="bloc.class === 'GridBloc' || bloc.class === 'AccordionListBloc'"
          :data-testid="`bloc-${bloc.class}`"
          @delete="blocs.splice(index, 1)"
          @keyboard-move="moveWithKeyboard($event, index)"
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
import { RiAddLine } from '@remixicon/vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import BlocInserter from './BlocInserter.vue'
import EditItem from './EditItem.vue'
import MissingObjectBloc from './MissingObjectBloc.vue'
import type { GridCell, SectionContentBloc } from '~/types/pages'
import { BLOC_COMPONENTS, acceptsDroppedItem, type BlocsLevel } from '~/utils/pages'

const props = defineProps<{
  edit: boolean
  // Restricts the blocs offered in the "add" menu, see `AddBlocDropdown`.
  level: Exclude<BlocsLevel, 'page'>
}>()

const blocs = defineModel<Array<T>>({ required: true })

const labels = useBlocLabels()

// A cell holding a single bloc is that bloc for the editor: one tab, not two.
const mergedWithCell = computed(() => props.level === 'cell' && blocs.value.length === 1)

// One group for every list of blocs, so that a bloc moves between sections, cells and
// accordion items, where it is allowed. A grid cell dropped here leaves its blocs: that is
// how a bloc alone in its cell (dragged with the cell's handle) moves out of the grid.
const { sortableRef, moveWithKeyboard } = useBlocSortable(
  () => blocs.value,
  toRef(props, 'edit'),
  {
    group: 'blocs',
    accepts: acceptsDroppedItem,
    receive: (item, fromGroup) => fromGroup === 'cells' ? (item as GridCell).blocs : [item],
  },
)

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
