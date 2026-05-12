<template>
  <NotificationLayout
    :icon="RiTerminalLine"
    :title="$t('Nouvelle API')"
    :notification="notification"
    :title-link="notification.details.dataservice.self_web_url"
    :title-link-title="$t('Voir l\'API')"
  >
    <p class="m-0 text-xs truncate">
      {{ notification.details.dataservice.title }}
    </p>
    <p class="m-0 text-xs text-gray-medium truncate">
      {{ $t('sur') }} {{ notification.details.dataset.title }}
    </p>
  </NotificationLayout>
</template>

<script setup lang="ts">
import { RiTerminalLine } from '@remixicon/vue'
import type { DataserviceCreatedNotification } from '~/types/notifications'
import NotificationLayout from './NotificationLayout.vue'

defineProps<{
  notification: DataserviceCreatedNotification
}>()
</script>
