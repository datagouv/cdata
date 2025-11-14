<template>
  <div class="divide-y h-96 overflow-y-auto">
    <div
      v-for="notification in notifications"
      :key="notification.id"
    >
      <NotificationsMembershipRequest
        v-if="notification.details.class === 'MembershipRequestNotificationDetails'"
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
