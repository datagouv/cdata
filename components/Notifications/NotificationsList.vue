<template>
  <div class="divide-y max-h-96 overflow-y-auto">
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
      <NotificationsNewBadge
        v-else-if="notification.details.class === 'NewBadgeNotificationDetails'"
        :notification="notification as NewBadgeNotification"
      />
      <NotificationsDiscussion
        v-else-if="notification.details.class === 'DiscussionNotificationDetails'"
        :notification="notification as DiscussionNotification"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeepReadonly } from 'vue'
import type { DiscussionNotification, MembershipRequestNotification, NewBadgeNotification, TransferRequestNotification, UserNotification } from '~/types/notifications'

defineProps<{
  notifications: DeepReadonly<Array<UserNotification>>
}>()
</script>
