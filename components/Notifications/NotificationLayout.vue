<template>
  <div class="relative group hover:bg-gray-some">
    <div class="p-3 flex gap-3">
      <div class="flex-none">
        <!-- The icon and the dot are centered on the first line, 1rem high (`text-xs`). -->
        <component
          :is="icon"
          class="size-4"
        />
      </div>
      <div class="flex-1 truncate">
        <p class="m-0 text-xs font-bold">
          <CdataLink
            v-if="titleLink"
            class="after:absolute after:inset-0 bg-none truncate"
            :to="titleLink"
            :title="titleLinkTitle"
            @click="handleMarkAsRead"
          >
            {{ title }}
          </CdataLink>
          <template v-else>
            {{ title }}
          </template>
        </p>
        <slot />
      </div>
      <div class="flex-none flex flex-col items-end gap-1">
        <div class="flex gap-1.5">
          <p class="m-0 text-xs">
            <!-- Short month, to leave the room to the title. -->
            <FormattedDate
              :date="notification.created_at"
              :options="{ dateStyle: 'medium' }"
            />
          </p>
          <AnimatedLoader
            v-if="loading"
            class="size-2 mt-1"
          />
          <div
            v-else-if="!notification.handled_at"
            class="size-2 rounded-full mt-1"
            :class="requireAction(notification) ? 'bg-danger' : 'bg-new-primary'"
          />
        </div>
        <!-- Under the date, whatever the notification shows below its title. Above the
             overlay link, so that it stays clickable. An action to take cannot be turned
             off: leaving it unanswered would be a bug, not a setting. -->
        <NotificationActions
          v-if="!notification.requires_action"
          class="relative z-10"
          :notification
        />
      </div>
    </div>
    <!-- overlay: only when no titleLink and can be marked as read. Outside of the row,
         where its gap would push the date away from the right edge. Transparent even on
         hover: the DSFR fills hovered buttons, which would hide the notification. -->
    <button
      v-if="!titleLink && canMarkAsRead(notification)"
      class="absolute inset-0 bg-none !bg-transparent"
      :title="$t('Marquer la notification comme lue')"
      @click="handleMarkAsRead"
    />
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, FormattedDate } from '@datagouv/components-next'
import type { Component } from 'vue'
import CdataLink from '../CdataLink.vue'
import NotificationActions from './NotificationActions.vue'
import type { UserNotification } from '~/types/notifications'
import { canMarkAsRead, requireAction } from '~/utils/notifications'

const props = defineProps<{
  icon: Component
  title: string
  notification: UserNotification
  titleLink?: string
  titleLinkTitle?: string
}>()

const { loading, markAsRead } = useMarkAsRead()

const handleMarkAsRead = () => {
  if (canMarkAsRead(props.notification)) {
    markAsRead(props.notification)
  }
}
</script>
