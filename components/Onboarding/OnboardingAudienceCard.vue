<template>
  <div class="flex flex-col">
    <div class="mb-3">
      <component
        :is="icon"
        v-if="icon"
        class="size-6 text-gray-title"
      />
    </div>
    <h3 class="text-base font-bold text-gray-title mb-2">
      {{ title }}
    </h3>
    <p class="text-gray-medium text-sm mb-0">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  description: string
  icon?: Component
}>()
</script>
