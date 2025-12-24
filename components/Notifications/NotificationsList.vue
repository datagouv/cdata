<template>
  <div class="divide-y h-96 overflow-y-auto">
    <div
      v-for="notification in notifications"
      :key="notification.id"
    >
      <NotificationsMembershipRequest
        v-if="notification.details.class === 'MembershipRequestNotificationDetails'"
        :notification="notification as MembershipRequestNotification"
      />
      <NotificationsTransferRequest
        v-if="notification.details.class === 'TransferRequestNotificationDetails'"
        :notification="notification as TransferRequestNotification"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeepReadonly } from 'vue'
import type { MembershipRequestNotification, TransferRequestNotification, UserNotification } from '~/types/notifications'

defineProps<{
  notifications: DeepReadonly<Array<UserNotification>>
}>()
</script>
