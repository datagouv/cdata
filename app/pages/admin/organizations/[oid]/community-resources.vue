<template>
  <AdminCommunityResourcesPage :organization="organization as Organization" />
</template>

<script setup lang="ts">
import AdminCommunityResourcesPage from '~/components/CommunityResources/AdminCommunityResourcesPage.vue'
import type { Organization } from '@datagouv/components-next'

const { currentOrganization: organization } = useCurrentOwned()
</script>
