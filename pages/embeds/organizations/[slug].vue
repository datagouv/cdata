<template>
  <OrganizationEmbeddedCard :slug="($route.params.slug as string)" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>
