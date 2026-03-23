<template>
  <AdminReusesPage :user />
</template>

<script setup lang="ts">
import AdminReusesPage from '~/components/Reuses/AdminReusesPage.vue'

const { currentUser: user } = useCurrentOwned()
</script>
