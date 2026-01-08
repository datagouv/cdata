<template>
  <button
    type="button"
    class="add-object-card min-h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
    @click="emit('click')"
  >
    <RiAddLine class="size-8" />
    <span class="text-sm">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { RiAddLine } from '@remixicon/vue'

defineProps<{
  label: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>
