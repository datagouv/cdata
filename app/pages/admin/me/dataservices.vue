<template>
  <AdminDataservicesPage :user="me" />
</template>

<script setup lang="ts">
import AdminDataservicesPage from '~/components/Dataservices/AdminDataservicesPage.vue'

const me = useMe()
</script>
