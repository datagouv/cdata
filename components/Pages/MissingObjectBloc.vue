<template>
  <!-- Only shown while editing, so that the bloc of a deleted object can be removed -->
  <div class="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-medium">
    <RiErrorWarningLine class="size-4 shrink-0" />
    {{ label }}
  </div>
</template>

<script setup lang="ts">
import { RiErrorWarningLine } from '@remixicon/vue'

defineProps<{
  label: string
}>()
</script>
