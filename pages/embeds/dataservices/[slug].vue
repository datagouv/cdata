<template>
  <DataserviceEmbeddedCard :slug="($route.params.slug as string)" />
</template>

<script setup lang="ts">
import DataserviceEmbeddedCard from '~/components/Dataservices/DataserviceEmbeddedCard.global.vue'

definePageMeta({
  layout: false,
})
</script>
