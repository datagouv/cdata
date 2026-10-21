<template>
  <button
    type="button"
    class="flex items-center gap-1 text-sm whitespace-nowrap text-gray-400 hover:text-gray-600"
  >
    <RiAddLine class="size-4" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { RiAddLine } from '@remixicon/vue'
</script>
