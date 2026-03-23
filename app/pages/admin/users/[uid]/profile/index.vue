<template>
  <AdminUserProfilePage
    :user
    @refresh="$emit('refresh')"
  />
</template>

<script setup lang="ts">
import type { User } from '@datagouv/components-next'
import AdminUserProfilePage from '~/components/User/AdminUserProfilePage.vue'

defineProps<{ user: User }>()

defineEmits<{
  refresh: []
}>()
</script>
