<template>
  <div class="bg-gray-lower flex items-center justify-center">
    <component
      :is="icon"
      class="size-1/2 text-[#c9c9c9]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiBuilding2Line, RiDatabase2Line, RiLineChartLine } from '@remixicon/vue'

const props = defineProps<{
  type: 'Dataset' | 'Reuse' | 'Organization'
}>()

const icon = computed(() => {
  return {
    Dataset: RiDatabase2Line,
    Reuse: RiLineChartLine,
    Organization: RiBuilding2Line,
  }[props.type]
})
</script>
