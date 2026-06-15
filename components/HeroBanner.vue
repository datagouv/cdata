<template>
  <section :class="[heroBgColor(color), $slots.breadcrumb ? 'pt-4 pb-16' : 'py-16']">
    <div class="container text-white">
      <!-- The breadcrumb sits on the coloured background; its white styling lives
           in the global .hero-breadcrumb rule (assets/css/overrides.css), which
           also drops its own margin. The hero's pt-4 (16px) replaces it so the
           breadcrumb keeps the same 16px gap from the menu as on non-hero pages. -->
      <div
        v-if="$slots.breadcrumb"
        class="hero-breadcrumb mb-6"
      >
        <slot name="breadcrumb" />
      </div>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { heroBgColor } from '~/utils/hero'

withDefaults(defineProps<{
  color?: 'primary' | 'green' | 'purple' | 'brown' | 'dark'
}>(), {
  color: 'primary',
})
</script>
