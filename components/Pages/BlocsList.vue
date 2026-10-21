<template>
  <div
    class="relative"
    :data-blocs-list="edit ? '' : undefined"
  >
    <!-- `min-h` keeps an empty list a drop target -->
    <div
      ref="sortableRef"
      :data-blocs-level="level"
      :class="{ 'min-h-8': edit }"
    >
      <!-- Alone in its cell, the bloc is edited as the cell (see `GridBloc`) -->
      <EditItem
        v-for="(bloc, index) in blocs"
        :key="bloc.id"
        :edit="edit && !mergedWithCell"
        :label="labels[bloc.class] ?? bloc.class"
        group="blocs"
        :class="spacingBefore(index)"
        :data-testid="`bloc-${bloc.class}`"
        :data-bloc-class="bloc.class"
        data-sortable-item
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

    <!-- Always shown in an empty list, the only thing it can hold. Otherwise, on the bottom
         edge of the innermost hovered list, so that it takes no room in the page. Neither
         z-index nor transform: they would trap the menu it opens under the page's other
         controls. -->
    <div
      v-if="edit"
      class="flex justify-center"
      :class="blocs.length ? 'absolute inset-x-0 -bottom-3 pointer-events-none *:pointer-events-auto' : ''"
      :data-add-bloc="blocs.length ? '' : undefined"
    >
      <AddBlocDropdown
        :level
        @new-blocs="blocs.push(...($event as Array<T>))"
      >
        <button
          type="button"
          class="flex items-center gap-1 text-sm whitespace-nowrap"
          :class="blocs.length ? 'rounded-full bg-white px-2.5 py-0.5 text-gray-medium hover:text-gray-title shadow-sm ring-1 ring-gray-200' : 'text-gray-400 hover:text-gray-600'"
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
import EditItem from './EditItem.vue'
import MissingObjectBloc from './MissingObjectBloc.vue'
import type { SectionContentBloc } from '~/types/pages'
import { BLOC_COMPONENTS, acceptsDroppedBloc, type BlocsLevel } from '~/utils/pages'

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
// accordion items, where it is allowed.
const { sortableRef, moveWithKeyboard } = useBlocSortable(
  () => blocs.value,
  toRef(props, 'edit'),
  { group: 'blocs', accepts: acceptsDroppedBloc },
)

watchEffect(() => {
  for (const bloc of blocs.value) {
    if (!BLOC_COMPONENTS[bloc.class]) {
      Sentry.captureMessage(`Unknown bloc type: "${bloc.class}"`, 'warning')
    }
  }
})

// A title stays close to what it introduces; other blocs are further apart.
function spacingBefore(index: number) {
  if (index === 0) return ''
  const afterTitle = blocs.value[index - 1].class === 'TitleBloc'
  if (props.level === 'cell') return afterTitle ? 'mt-4' : 'mt-6'
  return afterTitle ? 'mt-6' : 'mt-12'
}
</script>

<style>
/* Same rule as the tabs of `EditItem`: only the innermost hovered (or focused) list. */
[data-add-bloc] {
  opacity: 0;
  transition: opacity 100ms;
}

[data-blocs-list]:is(:hover, :focus-within):not(:has([data-blocs-list]:is(:hover, :focus-within))) > [data-add-bloc] {
  opacity: 1;
}
</style>
