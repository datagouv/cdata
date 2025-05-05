<template>
  <AdminUserProfilePage
    v-if="user"
    :user
  />
</template>

<script setup lang="ts">
import AdminUserProfilePage from '~/components/User/AdminUserProfilePage.vue'

const { currentUser: user } = useCurrentOwned()
</script>
