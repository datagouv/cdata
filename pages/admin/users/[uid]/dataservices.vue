<template>
  <AdminDataservicesPage :user />
</template>

<script setup lang="ts">
import AdminDataservicesPage from '~/components/Dataservices/AdminDataservicesPage.vue'

const { currentUser: user } = useCurrentOwned()
</script>
