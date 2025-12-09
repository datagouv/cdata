<template>
  <section class="py-8">
    <p
      v-if="label"
      class="text-xs text-gray-low uppercase tracking-wide mb-4"
    >
      {{ label }}
    </p>
    <div class="flex flex-wrap items-center justify-between">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>
