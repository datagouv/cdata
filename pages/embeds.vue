<template>
  <NuxtPage :page-key="route => route.fullPath" />
</template>

<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'bg-transparent',
  },
})
</script>
