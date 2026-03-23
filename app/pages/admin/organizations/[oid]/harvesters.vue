<template>
  <AdminHarvestersPage :organization="organization as Organization" />
</template>

<script setup lang="ts">
import AdminHarvestersPage from '~/components/Harvesters/AdminHarvestersPage.vue'
import type { Organization } from '@datagouv/components-next'

const { currentOrganization: organization } = useCurrentOwned()
</script>
