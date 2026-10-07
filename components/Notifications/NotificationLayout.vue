<template>
  <div class="relative group hover:bg-gray-some">
    <div class="p-3 flex gap-3">
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
          <FormattedDate :date="notification.created_at" />
        </p>
        <AnimatedLoader
          v-if="loading"
          class="size-2"
        />
        <div
          v-else-if="!notification.handled_at"
          class="size-2 rounded-full mt-0.5"
          :class="requireAction(notification) ? 'bg-danger' : 'bg-new-primary'"
        />
        <!-- Above the overlay link, so that it stays clickable. Shown on hover only where
             there is one: on a touch screen, always. -->
        <button
          v-if="isConfigurable(notification)"
          type="button"
          class="relative z-10 -mt-0.5 size-5 flex items-center justify-center rounded bg-none hover:bg-gray-lower opacity-0 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-100"
          :class="{ 'opacity-100': showActions }"
          :aria-expanded="showActions"
          :title="$t('Pourquoi je reçois ça ?')"
          @click="showActions = !showActions"
        >
          <RiMoreLine
            class="size-4"
            aria-hidden="true"
          />
        </button>
      </div>
      <!-- overlay: only when no titleLink and can be marked as read -->
      <button
        v-if="!titleLink && canMarkAsRead(notification)"
        class="after:absolute after:inset-0 bg-none"
        :title="$t('Marquer la notification comme lue')"
        @click="handleMarkAsRead"
      />
    </div>
    <NotificationActions
      v-if="showActions"
      class="relative z-10 pl-10 pr-3 pb-3"
      :notification
    />
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, FormattedDate } from '@datagouv/components-next'
import { RiMoreLine } from '@remixicon/vue'
import type { Component } from 'vue'
import CdataLink from '../CdataLink.vue'
import NotificationActions from './NotificationActions.vue'
import type { UserNotification } from '~/types/notifications'
import { canMarkAsRead, isConfigurable, requireAction } from '~/utils/notifications'

const props = defineProps<{
  icon: Component
  title: string
  notification: UserNotification
  titleLink?: string
  titleLinkTitle?: string
}>()

const { loading, markAsRead } = useMarkAsRead()

const showActions = ref(false)

const handleMarkAsRead = () => {
  if (canMarkAsRead(props.notification)) {
    markAsRead(props.notification)
  }
}
</script>
