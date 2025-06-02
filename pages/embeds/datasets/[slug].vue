<template>
  <DatasetEmbeddedCard :slug="($route.params.slug as string)" />
</template>

<script setup lang="ts">
import DatasetEmbeddedCard from '~/components/Datasets/DatasetEmbeddedCard.global.vue'

definePageMeta({
  layout: false,
})
</script>
