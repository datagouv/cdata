<template>
  <div class="padding-list-reuse">
    <EmbedsListReuse :slug="($route.params.slug as string)" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>

  <style>
  .padding-list-reuse {
      padding: 10px;
  }
  </style>
