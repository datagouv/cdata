<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <component
        :is="icon"
        class="size-4 mt-1"
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
    <div class="flex-none flex m-0 gap-1.5">
      <p class="m-0 text-xs">
        {{ formatDate(notification.created_at) }}
      </p>
      <AnimatedLoader
        v-if="loading"
        class="size-2"
      />
      <div
        v-else-if="!notification.handled_at"
        class="size-2 rounded-full mt-0.5"
        :class="requiresAction ? 'bg-danger' : 'bg-new-primary'"
      />
    </div>
    <!-- Auto overlay: only when no titleLink and unread -->
    <button
      v-if="!titleLink && !notification.handled_at && !requiresAction"
      class="after:absolute after:inset-0 bg-none"
      :title="$t('Marquer la notification comme lue')"
      @click="handleMarkAsRead"
    />
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, useFormatDate } from '@datagouv/components-next'
import CdataLink from '../CdataLink.vue'
import type { UserNotification } from '~/types/notifications'

const props = defineProps<{
  icon: object
  title: string
  notification: UserNotification
  titleLink?: string
  titleLinkTitle?: string
  requiresAction?: boolean
}>()

const { formatDate } = useFormatDate()
const { loading, markAsRead } = useMarkAsRead()

const handleMarkAsRead = () => {
  if (!props.requiresAction) {
    markAsRead(props.notification)
  }
}
</script>
