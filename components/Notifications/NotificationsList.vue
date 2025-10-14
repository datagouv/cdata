<template>
  <div class="divide-y">
    <div
      v-for="notification in notifications"
      :key="notification.details.id"
    >
      <NotificationsMembershipRequest
        v-if="notification.type === 'membership_request'"
        :notification
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserNotification } from '~/types/notifications'

defineProps<{
  notifications: Array<UserNotification>
}>()
</script>
