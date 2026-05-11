<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiTerminalLine class="size-4" />
    </div>
    <div class="flex-1 truncate">
      <p class="m-0 text-xs font-bold">
        <CdataLink
          class="after:absolute after:inset-0 bg-none"
          :to="notification.details.dataservice.self_web_url"
          @click="markAsRead(notification)"
        >
          {{ $t('Nouvelle API') }}
        </CdataLink>
      </p>
      <p class="m-0 text-xs truncate">
        {{ notification.details.dataservice.title }}
      </p>
      <p class="m-0 text-xs text-gray-medium truncate">
        {{ $t('sur') }} {{ notification.details.dataset.title }}
      </p>
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
        class="size-2 rounded-full bg-new-primary mt-0.5"
      />
    </div>
    <button
      v-if="!notification.handled_at"
      class="after:absolute after:inset-0 bg-none"
      :title="$t('Marquer la notification comme lue')"
      @click="markAsRead(notification)"
    />
  </div>
</template>

<script setup lang="ts">
import { RiTerminalLine } from '@remixicon/vue'
import { AnimatedLoader, useFormatDate } from '@datagouv/components-next'
import CdataLink from '~/components/CdataLink.vue'
import type { DataserviceCreatedNotification } from '~/types/notifications'

defineProps<{
  notification: DataserviceCreatedNotification
}>()

const { formatDate } = useFormatDate()
const { loading, markAsRead } = useMarkAsRead()
</script>
