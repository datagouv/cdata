<template>
  <AdminCommunityResourcesPage :user="me" />
</template>

<script setup lang="ts">
import AdminCommunityResourcesPage from '~/components/CommunityResources/AdminCommunityResourcesPage.vue'

const me = useMe()
</script>
