<template>
  <AdminDataservicesPage :organization />
</template>

<script setup lang="ts">
import AdminDataservicesPage from '~/components/Dataservices/AdminDataservicesPage.vue'

const { currentOrganization: organization } = useCurrentOwned()
</script>
