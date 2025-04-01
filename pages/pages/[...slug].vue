<template>
  <p>{{ $route.params.slug }}</p>
</template>

<script setup lang="ts">
const route = useRoute()
useFetch(`/nuxt-api/pages/${route.params.slug ? route.params.slug.join('/') : ''}`)
</script>
