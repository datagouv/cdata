<template>
  <div class="flex flex-col">
    <div class="mb-3">
      <component
        :is="icon"
        v-if="icon"
        class="size-6 text-[#3A3A3A]"
        aria-hidden="true"
      />
    </div>
    <h3 class="text-lg font-bold leading-6 text-[#3A3A3A] mb-2">
      {{ title }}
    </h3>
    <p class="text-base font-normal leading-normal text-[#3C4043] mb-0">
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
