<template>
  <MetricsAdminPage :user />
</template>

<script setup lang="ts">
definePageMeta({
  keepScroll: true,
})

const { currentUser: user } = useCurrentOwned()
</script>
