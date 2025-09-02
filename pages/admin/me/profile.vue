<template>
  <AdminUserProfilePage
    :user="me"
    @refresh="refresh"
  />
</template>

<script setup lang="ts">
import AdminUserProfilePage from '~/components/User/AdminUserProfilePage.vue'

const me = useMe()

const refresh = () => {
  loadMe(me)
}
</script>
