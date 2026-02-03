<template>
  <div class="bg-gray-lower flex items-center justify-center">
    <component
      :is="icon"
      class="size-1/2 text-gray-plain"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiBookShelfLine, RiBuilding2Line, RiDatabase2Line, RiLineChartLine, RiTerminalLine } from '@remixicon/vue'

const props = defineProps<{
  type: 'Dataset' | 'Dataservice' | 'Reuse' | 'Organization' | 'Topic'
}>()

const icon = computed(() => {
  return {
    Dataset: RiDatabase2Line,
    Dataservice: RiTerminalLine,
    Reuse: RiLineChartLine,
    Organization: RiBuilding2Line,
    Topic: RiBookShelfLine,
  }[props.type]
})
</script>
