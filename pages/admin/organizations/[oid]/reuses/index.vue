<template>
  <AdminReusesPage :organization />
</template>

<script setup lang="ts">
import AdminReusesPage from '~/components/Reuses/AdminReusesPage.vue'

const { currentOrganization: organization } = useCurrentOwned()
</script>
