<template>
  <button
    class="text-neutral-700 h-8 p-2 rounded-full leading-none hover:!bg-neutral-200"
    role="menuitem"
    type="button"
  >
    <component
      :is="icon"
      class="size-4"
    />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
}>()
</script>
