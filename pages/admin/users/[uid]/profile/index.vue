<template>
  <div>
    <PendingReportsBanner
      class="mb-4"
      :subject="{ class: 'User', value: user }"
    />
    <AdminUserProfilePage
      :user
      @refresh="$emit('refresh')"
    />
  </div>
</template>

<script setup lang="ts">
import type { User } from '@datagouv/components-next'
import PendingReportsBanner from '~/components/Spam/PendingReportsBanner.vue'
import AdminUserProfilePage from '~/components/User/AdminUserProfilePage.vue'

defineProps<{ user: User }>()

defineEmits<{
  refresh: []
}>()
</script>
