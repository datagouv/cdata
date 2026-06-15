<template>
  <CdataLink
    :to="to"
    :external="external"
    class="rounded-sm border border-gray-silver hover:border-gray-medium transition-colors bg-white bg-none"
  >
    <slot />
  </CdataLink>
</template>

<script setup lang="ts">
import CdataLink from '~/components/CdataLink.vue'

// Clickable card chrome (border, hover, rounded, background) shared by the
// onboarding link cards. Layout and padding are left to each caller through
// fall-through classes; the inner content is provided via the default slot.
defineProps<{
  to: string
  external?: boolean
}>()
</script>
