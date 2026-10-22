<template>
  <!-- The whole gap is the hover area; the line and its button show where the new bloc
       will land. Neither z-index nor transform on the way to the menu: they would trap it
       under the page's other controls. -->
  <div
    class="group/add flex items-center justify-center"
    data-edit-control
  >
    <div class="absolute inset-x-0 top-1/2 h-0.5 -mt-px bg-new-primary opacity-0 group-hover/add:opacity-100 group-focus-within/add:opacity-100 transition-opacity" />
    <AddBlocDropdown
      :level
      @new-blocs="emit('newBlocs', $event as Array<SectionContentBloc>)"
    >
      <RoundAddButton :label />
    </AddBlocDropdown>
  </div>
</template>

<script setup lang="ts">
import AddBlocDropdown from './AddBlocDropdown.vue'
import RoundAddButton from './RoundAddButton.vue'
import type { SectionContentBloc } from '~/types/pages'
import type { BlocsLevel } from '~/utils/blocsLayout'

defineProps<{
  level: BlocsLevel
  label: string
}>()

const emit = defineEmits<{
  newBlocs: [Array<SectionContentBloc>]
}>()
</script>
