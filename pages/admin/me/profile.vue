<template>
  <div class="space-y-5">
    <AdminUserProfileHeader
      :user="me"
    />

    <TabLinks
      :links="[
        { href: '/admin/me/profile', label: $t('Profil') },
        { href: `/admin/me/profile/activities`, label: $t('Activités') },
      ]"
    />

    <NuxtPage
      :page-key="route => route.fullPath"
      :user="me"
      @refresh="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import AdminUserProfileHeader from '~/components/User/AdminUserProfileHeader.vue'

const me = useMe()

function refresh() {
  loadMe(me)
}
</script>
