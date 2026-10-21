<template>
  <!-- Shown while its `group/add` ancestor (the area where it inserts) is hovered -->
  <button
    type="button"
    class="relative inline-flex items-center justify-center size-6 rounded-full bg-new-primary text-white shadow-sm opacity-0 group-hover/add:opacity-100 focus-visible:opacity-100 transition-opacity delay-400 group-hover/add:delay-0 focus-visible:delay-0"
    :title="label"
    :aria-label="label"
  >
    <RiAddLine class="size-4" />
  </button>
</template>

<script setup lang="ts">
import { RiAddLine } from '@remixicon/vue'

defineProps<{
  label: string
}>()
</script>
