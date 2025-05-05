<template>
  <AdminUserProfilePage :user="me" />
</template>

<script setup lang="ts">
import AdminUserProfilePage from '~/components/User/AdminUserProfilePage.vue'

const me = useMe()
</script>
