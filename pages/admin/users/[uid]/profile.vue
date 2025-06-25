<template>
  <AdminUserProfilePage
    v-if="user"
    :user
    @refresh="refresh"
  />
</template>

<script setup lang="ts">
import AdminUserProfilePage from '~/components/User/AdminUserProfilePage.vue'

const { currentUser: user } = useCurrentOwned()

const refresh = async () => {
  if (!user.value) return
  // const newUser = await $api<User>(`/api/1/users/${user.value.id}/`)

  // This doesn't work I don't know why…
  // users.value[user.value.id] = newUser

  // This doesn't work because of useComponentConfig outside @datagouv/components in
  // <Avatar />
  // user.value.avatar = newUser.avatar
  // user.value.avatar_thumbnail = newUser.avatar_thumbnail
}
</script>
