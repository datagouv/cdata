<template>
  <button
    class="rounded-full p-2 border-solid border border-neutral-400 text-xs w-8 h-8 leading-none text-neutral-800 !bg-neutral-50 hover:!bg-neutral-200 flex items-center justify-center"
    type="button"
    @click="emit('click')"
  >
    <component :is="icon" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
}>()

const emit = defineEmits<{ click: [] }>()
</script>
