<template>
  <h4 class="w-full text-base mb-0 flex">
    <AppLink
      :to="url"
      class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
    >
      <component
        :is="icon"
        aria-hidden="true"
        class="size-4 flex-none"
      />
      <span class="block truncate flex-1">
        <slot />
      </span>
      <span class="absolute inset-0" />
    </AppLink>
  </h4>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import AppLink from './AppLink.vue'

defineProps<{
  icon: Component
  url: RouteLocationRaw
}>()
</script>
