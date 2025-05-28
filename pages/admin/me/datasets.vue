<template>
  <AdminDatasetsPage :user="me" />
</template>

<script setup lang="ts">
import AdminDatasetsPage from '~/components/Datasets/AdminDatasetsPage.vue'

const me = useMe()
</script>
