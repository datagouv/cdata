<template>
  <AdminCommunityResourcesPage :organization />
</template>

<script setup lang="ts">
import AdminCommunityResourcesPage from '~/components/CommunityResources/AdminCommunityResourcesPage.vue'

const { currentOrganization: organization } = useCurrentOwned()
</script>
