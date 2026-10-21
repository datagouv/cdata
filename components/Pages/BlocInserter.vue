<template>
  <!-- The whole gap is the hover area; the line and its button show where the new bloc
       will land. Neither z-index nor transform on the way to the menu: they would trap it
       under the page's other controls. -->
  <div
    class="group/inserter flex items-center justify-center"
    data-edit-control
  >
    <div class="absolute inset-x-0 top-1/2 h-0.5 -mt-px bg-new-primary opacity-0 group-hover/inserter:opacity-100 group-focus-within/inserter:opacity-100 transition-opacity delay-400 group-hover/inserter:delay-0 group-focus-within/inserter:delay-0" />
    <AddBlocDropdown
      :level
      @new-blocs="emit('newBlocs', $event as Array<SectionContentBloc>)"
    >
      <button
        type="button"
        class="relative inline-flex items-center justify-center size-6 rounded-full bg-new-primary text-white shadow-sm opacity-0 group-hover/inserter:opacity-100 focus-visible:opacity-100 transition-opacity delay-400 group-hover/inserter:delay-0 focus-visible:delay-0"
        :title="label"
        :aria-label="label"
      >
        <RiAddLine class="size-4" />
      </button>
    </AddBlocDropdown>
  </div>
</template>

<script setup lang="ts">
import { RiAddLine } from '@remixicon/vue'
import AddBlocDropdown from './AddBlocDropdown.vue'
import type { SectionContentBloc } from '~/types/pages'
import type { BlocsLevel } from '~/utils/pages'

defineProps<{
  level: Exclude<BlocsLevel, 'page'>
  label: string
}>()

const emit = defineEmits<{
  newBlocs: [Array<SectionContentBloc>]
}>()
</script>
