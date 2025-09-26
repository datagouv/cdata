<template>
  <MetricsAdminDatasetsPage
    v-if="user"
    :user
  />
</template>

<script setup lang="ts">
const { currentUser: user } = useCurrentOwned()
</script>
