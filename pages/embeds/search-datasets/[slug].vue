<template>
  <div class="padding-search-dataset">
    <EmbedsSearchDataset :slug="($route.params.slug as string)" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>

<style>
.padding-search-dataset {
    padding: 10px;
}
</style>
