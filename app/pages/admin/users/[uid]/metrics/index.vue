<template>
  <MetricsAdminIndexPage :user="user" />
</template>

<script setup lang="ts">
const { currentUser: user } = useCurrentOwned()
</script>
