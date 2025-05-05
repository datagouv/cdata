<template>
  <AdminHarvestersPage :organization />
</template>

<script setup lang="ts">
import AdminHarvestersPage from '~/components/Harvesters/AdminHarvestersPage.vue'

const { currentOrganization: organization } = useCurrentOwned()
</script>
