<template>
  <AdminReusesPage :user="me" />
</template>

<script setup lang="ts">
import AdminReusesPage from '~/components/Reuses/AdminReusesPage.vue'

const me = useMe()
</script>
