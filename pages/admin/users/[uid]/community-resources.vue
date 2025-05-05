<template>
  <AdminCommunityResourcesPage :user />
</template>

<script setup lang="ts">
import AdminCommunityResourcesPage from '~/components/CommunityResources/AdminCommunityResourcesPage.vue'

const { currentUser: user } = useCurrentOwned()
</script>
