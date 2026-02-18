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
        v-else-if="notification.details.class === 'TransferRequestNotificationDetails'"
        :notification="notification as TransferRequestNotification"
      />
      <NotificationsNewBadge
        v-else-if="notification.details.class === 'NewBadgeNotificationDetails'"
        :notification="notification as NewBadgeNotification"
      />
      <NotificationsDiscussion
        v-else-if="notification.details.class === 'DiscussionNotificationDetails'"
        :notification="notification as DiscussionNotification"
        :subject="subjects[notification.details.discussion.subject.id]"
      />
      <NotificationsMembershipAccepted
        v-else-if="notification.details.class === 'MembershipAcceptedNotificationDetails'"
        :notification="notification as MembershipAcceptedNotification"
      />
      <NotificationsMembershipRefused
        v-else-if="notification.details.class === 'MembershipRefusedNotificationDetails'"
        :notification="notification as MembershipRefusedNotification"
      <NotificationsValidateHarvester
        v-else-if="notification.details.class === 'ValidateHarvesterNotificationDetails'"
        :notification="notification as ValidateHarvesterNotification"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeepReadonly } from 'vue'
import type { DiscussionSubjectTypes } from '~/types/discussions'
import type { DiscussionNotification, MembershipAcceptedNotification, MembershipRefusedNotification, MembershipRequestNotification, NewBadgeNotification, TransferRequestNotification, UserNotification, ValidateHarvesterNotification } from '~/types/notifications'

const props = defineProps<{
  notifications: DeepReadonly<Array<UserNotification>>
}>()

const subjects = ref<Record<string, DiscussionSubjectTypes | null>>({})
const subjectsPromises = ref<Record<string, Promise<void>>>({})
const { $api } = useNuxtApp()

watchEffect(async () => {
  for (const notification of props.notifications) {
    if (notification.details.class !== 'DiscussionNotificationDetails' || notification.details.discussion.subject.id in subjectsPromises.value) continue

    const id = notification.details.discussion.subject.id
    subjectsPromises.value[id] = getSubject($api, notification.details.discussion.subject)
      .then((subject) => {
        subjects.value[id] = subject // Working because there is no conflicts between IDs from different types
      })
  }

  await Promise.all(Object.values(subjectsPromises.value))
})
</script>
