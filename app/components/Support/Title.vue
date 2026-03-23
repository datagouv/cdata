<template>
  <h3
    :id
    class="text-xl font-extrabold mb-2.5"
  >
    <slot />
  </h3>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
}>()
</script>
