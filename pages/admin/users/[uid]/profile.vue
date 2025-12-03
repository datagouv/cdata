<template>
  <div
    v-if="user"
    class="space-y-5"
  >
    <AdminUserProfileHeader
      :user="user"
    />

    <TabLinks
      :links="[
        { href: `/admin/users/${user.id}/profile`, label: $t('Profil') },
        { href: `/admin/users/${user.id}/profile/activities`, label: $t('Activités') },
      ]"
    />

    <NuxtPage
      :page-key="route => route.fullPath"
      :user="user"
      @refresh="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import type { User } from '@datagouv/components-next'
import AdminUserProfileHeader from '~/components/User/AdminUserProfileHeader.vue'

const { currentUser: user, setCurrentUser } = useCurrentOwned()
const { $api } = useNuxtApp()

const refresh = async () => {
  if (!user.value) return
  const newUser = await $api<User>(`/api/1/users/${user.value.id}/`)

  setCurrentUser(newUser)
}
</script>
