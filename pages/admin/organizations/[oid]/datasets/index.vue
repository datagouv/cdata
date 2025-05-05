<template>
  <AdminDatasetsPage
    v-if="organization"
    :organization
  />
</template>

<script setup lang="ts">
import AdminDatasetsPage from '~/components/Datasets/AdminDatasetsPage.vue'

const { currentOrganization: organization } = useCurrentOwned()
</script>
