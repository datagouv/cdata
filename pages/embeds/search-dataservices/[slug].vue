<template>
  <div class="padding-search-dataservice">
    <EmbedsSearchDataservice :slug="($route.params.slug as string)" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>

<style>
.padding-search-dataservice {
    padding: 10px;
}
</style>
