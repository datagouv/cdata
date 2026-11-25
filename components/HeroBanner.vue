<template>
  <section :class="[heroBgColor(color), $slots.breadcrumb ? 'pt-4 pb-10' : 'py-16']">
    <div class="container text-white">
      <!-- The breadcrumb sits on the coloured background; its white styling lives
           in the global .hero-breadcrumb rule (assets/css/overrides.css), which
           also drops its own margin. pt-4 (16px) keeps the same 16px gap from the
           menu as on non-hero pages. The empty blue above the title is pt-4 + this
           mb-6 (16 + 24 = 40px), so the section uses pb-10 (40px) to match it and
           keep the perceived blue symmetric — the breadcrumb text fills the rest
           of the top zone. The content centring adds equally on both sides, so it
           cancels out. -->
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
