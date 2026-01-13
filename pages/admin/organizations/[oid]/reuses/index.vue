<template>
  <AdminReusesPage :organization="organization as Organization" />
</template>

<script setup lang="ts">
import AdminReusesPage from '~/components/Reuses/AdminReusesPage.vue'
import type { Organization } from '@datagouv/components-next'

const { currentOrganization: organization } = useCurrentOwned()
</script>
