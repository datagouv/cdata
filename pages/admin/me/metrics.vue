<template>
  <MetricsAdminPage :user="me" />
</template>

<script setup lang="ts">
definePageMeta({
  keepScroll: true,
})

const me = useMe()
</script>
