<template>
  <div class="divide-y max-h-96 overflow-y-auto">
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
import type { DeepReadonly } from 'vue'
import type { UserNotification } from '~/types/notifications'

defineProps<{
  notifications: DeepReadonly<Array<UserNotification>>
}>()
</script>
