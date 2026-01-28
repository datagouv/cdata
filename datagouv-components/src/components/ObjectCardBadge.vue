<template>
  <div class="absolute top-0 left-4 fr-grid-row fr-grid-row--middle fr-mt-n3v">
    <p class="fr-badge fr-badge--sm fr-badge--mention-grey text-gray-medium">
      <component
        :is="icon"
        aria-hidden="true"
        class="size-4 mr-1"
      />
      <slot />
    </p>
  </div>
</template>

<script setup lang="ts">
// Only one ObjectCardBadge should be rendered at a time (use v-if/v-else-if),
// because the absolute positioning will cause multiple badges to overlap.
import type { Component } from 'vue'

defineProps<{
  icon: Component
}>()
</script>
