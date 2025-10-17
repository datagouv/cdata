<template>
  <MetricsAdminPage :user />
</template>

<script setup lang="ts">
const { currentUser: user } = useCurrentOwned()
</script>
