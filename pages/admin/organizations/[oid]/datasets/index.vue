<template>
  <AdminDatasetsPage
    v-if="organization"
    :organization="organization as Organization"
  />
</template>

<script setup lang="ts">
import AdminDatasetsPage from '~/components/Datasets/AdminDatasetsPage.vue'
import type { Organization } from '@datagouv/components-next'

const { currentOrganization: organization } = useCurrentOwned()
</script>
