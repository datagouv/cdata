<template>
  <div class="p-2.5">
    <EmbedsSearchDataset :slug="($route.params.slug as string)" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>
