<template>
  <AdminDatasetsPage :user />
</template>

<script setup lang="ts">
import AdminDatasetsPage from '~/components/Datasets/AdminDatasetsPage.vue'

const { currentUser: user } = useCurrentOwned()
</script>
