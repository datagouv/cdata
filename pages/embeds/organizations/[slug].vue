<template>
  <OrganizationEmbeddedCard :slug="($route.params.slug as string)" />
</template>

<script setup lang="ts">
import OrganizationEmbeddedCard from '~/components/Organization/OrganizationEmbeddedCard.global.vue'

definePageMeta({
  layout: false,
})
</script>
