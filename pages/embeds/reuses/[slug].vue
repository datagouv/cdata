<template>
  <ReuseEmbeddedCard :slug="($route.params.slug as string)" />
</template>

<script setup lang="ts">
import ReuseEmbeddedCard from '~/components/Reuses/ReuseEmbeddedCard.global.vue'

definePageMeta({
  layout: false,
})
</script>
