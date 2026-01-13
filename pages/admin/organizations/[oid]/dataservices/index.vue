<template>
  <AdminDataservicesPage :organization="organization as Organization" />
</template>

<script setup lang="ts">
import AdminDataservicesPage from '~/components/Dataservices/AdminDataservicesPage.vue'
import type { Organization } from '@datagouv/components-next'

const { currentOrganization: organization } = useCurrentOwned()
</script>
