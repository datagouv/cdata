<template>
  <div class="object-card-badge" :data-tone="tone">
    <span class="object-card-badge__content">
      <component :is="icon" aria-hidden="true" class="object-card-badge__icon" />
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    icon: Component
    tone?: 'neutral' | 'warning' | 'danger' | 'yellow'
  }>(),
  { tone: 'neutral' },
)
</script>

<style scoped>
.object-card-badge {
  display: inline-flex;
  max-width: 100%;
}
.object-card-badge__content {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  max-width: 100%;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 0.25rem;
  background: var(--background-contrast-grey);
  color: var(--text-default-grey);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem;
}
.object-card-badge__icon {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
}
.object-card-badge[data-tone='warning'] .object-card-badge__content {
  background: var(--background-contrast-warning);
  color: var(--text-default-warning);
}
.object-card-badge[data-tone='danger'] .object-card-badge__content {
  background: var(--background-contrast-error);
  color: var(--text-default-error);
}
.object-card-badge[data-tone='yellow'] .object-card-badge__content {
  background: var(--background-contrast-yellow-tournesol);
  color: var(--text-label-yellow-tournesol);
}
</style>
